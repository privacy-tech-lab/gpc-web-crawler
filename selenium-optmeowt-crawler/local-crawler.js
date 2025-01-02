/**
 * @fileoverview Integrated web crawler with simultaneous site crawling and GPC endpoint checking
 */

const { Builder } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const axios = require('axios');
const psl = require('psl');

/**
 * Custom error class for human verification detection.
 * This error is thrown when the crawler detects a CAPTCHA or similar human verification challenge.
 * @extends Error
 */
class HumanCheckError extends Error {
  /**
   * Creates a new HumanCheckError.
   * @param {string} message - The error message.
   */
  constructor(message) {
    super(message);
    this.name = 'HumanCheckError';
  }
}

// Constants for configuration
const UNRECOVERABLE_ERRORS = ['InsecureCertificateError', 'WebDriverError', 'HumanCheckError'];
const PAGE_LOAD_TIMEOUT = 35000;
const SCRIPT_TIMEOUT = 30000;
const RETRY_DELAY = 3000;
const API_BASE_URL = 'http://rest_api:8080';
const CRALWER_BROWSER_URL = 'http://crawl_browser:4444';

/**
 * Configuration class for the web crawler.
 * Stores the start time, list of sites, errors encountered, and the timestamp for the current crawl.
 */
class CrawlerConfig {
  /**
   * Creates a new CrawlerConfig instance.
   * @param {string} timestamp - Timestamp from command line, used to organize crawl results.
   */
  constructor(args) {
    this.scriptStartTime = Date.now();
    this.sites = [];
    this.errors = {};
    this.timestamp = args[0];
    this.test_crawl = args[1] === "1";
    this.crawl_id = args[2];
  }
}

/**
 * Manages the Selenium WebDriver instance for browser interaction.
 * Handles browser setup, CAPTCHA detection, and quitting the browser.
 */
class BrowserManager {
  /**
   * Creates a new BrowserManager instance.
   * @param {CrawlerConfig} config - Crawler configuration object.
   */
  constructor(config) {
    this.config = config;
    this.driver = null;
  }

  /**
   * Sets up the Selenium WebDriver with Firefox options and installs the OptMeowt addon.
   * Also sets timeouts for page load and script execution.
   * @async
   */
  async setup() {
    const options = new firefox.Options()
      .setPreference('xpinstall.signatures.required', false)
      .setPreference('services.settings.server', 'https://firefox.settings.services.mozilla.com/v1')
      .addArguments(
        '--headful',
        'disable-infobars',
        '--no-sandbox',
        '--disable-application-cache',
        '--disable-gpu',
        '--disable-dev-shm-usage'
      );

    this.driver = await new Builder()
      .forBrowser('firefox')
      .setFirefoxOptions(options)
      .usingServer(CRALWER_BROWSER_URL)
      .build();

    await this.driver.installAddon('./ff-optmeowt-2.0.1.xpi', true)

    await this.driver.manage().setTimeouts({
      implicit: 0,
      pageLoad: PAGE_LOAD_TIMEOUT,
      script: SCRIPT_TIMEOUT
    });

    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
  }

  /**
   * Checks the current page title for patterns indicating a CAPTCHA or human verification challenge.
   * If a CAPTCHA is detected, it throws a HumanCheckError.
   * @async
   * @throws {HumanCheckError} If a CAPTCHA is detected.
   */
  async checkForCaptcha() {
    const title = await this.driver.getTitle();
    const captchaPatterns = [
      /Access.*Denied/i,
      /error/i,
      /service.*unavailable/i,
      /Just a moment\.\.\./i,
      /you have been blocked/i,
      /site not available/i,
      /attention required/i,
      /access to this page has been blocked/i,
      /site.*temporarily unavailable/i,
      /site.*temporarily down/i,
      /robot or human/i,
      /403 forbidden/i,
      /pardon our interruption/i,
      /are you a robot/i,
      /block -/i,
      /Human Verification/i
    ];

    if (captchaPatterns.some(pattern => pattern.test(title))) {
      throw new HumanCheckError('Human Check');
    }
  }
}

/**
 * Manages database interactions, including logging GPC results and errors, and updating site IDs.
 */
class DatabaseManager {
  /**
   * Creates a new DatabaseManager instance.
   * @param {string} timestamp - Timestamp for the current crawl, used for organizing results.
   */
  constructor(timestamp) {
    this.gpcResults = [];
    this.timestamp = timestamp;
  }

  /**
   * Updates the site ID for a given analysis record in the database.
   * @async
   * @param {object} data - The data object containing the analysis record to update.
   */
  async updateSiteId(data) {
    try {
      await axios.put(`${API_BASE_URL}/analysis`, data);
    } catch (error) {
      console.error('Error updating site ID:', error.message);
    }
  }

  /**
   * Logs the GPC endpoint check result to a CSV file.
   * Also logs any errors associated with the GPC check.
   * @async
   * @param {string} site - The URL of the site being checked.
   * @param {object} gpcResult - The result of the GPC endpoint check, including status and data.
   */
  async logGPCResult(site, gpcResult) {
    const csvLine = `${site},${gpcResult?.status || 'None'},"${JSON.stringify(gpcResult?.data) || 'None'}"\n`;
    await fs.promises.appendFile(`./crawl_results/${this.timestamp}/well-known-data.csv`, csvLine);

    if (gpcResult?.error) {
      await this.logError(site, gpcResult.error);
    }
  }

  /**
   * Logs an error encountered during crawling or GPC endpoint checking to a JSON file.
   * @async
   * @param {string} site - The URL of the site where the error occurred.
   * @param {string} error - The error message.
   */
  async logError(site, error) {
    const errors = await this.loadErrors();
    errors[site] = error;
    await fs.promises.writeFile(
      `./crawl_results/${this.timestamp}/well-known-errors.json`,
      JSON.stringify(errors, null, 2)
    );
  }

  /**
   * Loads previously logged errors from the JSON file.
   * @async
   * @returns {Promise<object>} An object containing the logged errors, keyed by site URL.
   */
  async loadErrors() {
    try {
      const data = await fs.promises.readFile(`./crawl_results/${this.timestamp}/well-known-errors.json`, 'utf8');
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  /**
   * Checks the database for existing analysis records for a given site and updates the site ID if necessary.
   * Prioritizes updating existing entries where the site_id is null. If no such entry exists, it tries to update a null analysis entry.
   * @async
   * @param {string} site - The URL of the site.
   * @param {number} siteId - The ID of the site to be updated in the database.
   * @returns {Promise<boolean>} True if the database was updated, false otherwise.
   */
  async checkAndUpdateDB(site, siteId) {
    try {
      console.log(site, siteId)
      const response = await axios.get(`${API_BASE_URL}/analysis/${site}`);
      const latestData = response.data;
      if (latestData.length >= 1) {
        console.log(`site: ${site} has probs been added`)
        const lastEntry = latestData[latestData.length - 1];
        if (lastEntry.site_id === null) {
          lastEntry.site_id = siteId;
          await this.updateSiteId(lastEntry);
        }
        return true;
      } else {
        const nullResponse = await axios.get(`${API_BASE_URL}/null_analysis`);
        const nullData = nullResponse.data;
        if (nullData.length >= 1) {
          nullData[nullData.length - 1].site_id = siteId;
          await this.updateSiteId(nullData[nullData.length - 1]);
          return true;
        }
      }
    } catch (error) {
      console.error('Database operation failed:', error.message);
    }
    console.log(`site: ${site} probs hasn't been added`)
    return false;
  }
}

/**
 * The main class responsible for crawling websites and checking for GPC endpoints.
 */
class WebCrawler {
  /**
   * Creates a new WebCrawler instance.
   * Initializes the crawler configuration, browser manager, and database manager.
   */
  constructor() {
    console.log(process.argv.slice(2))
    this.config = new CrawlerConfig(process.argv.slice(2));
    this.browserManager = new BrowserManager(this.config);
    this.dbManager = new DatabaseManager(this.config.timestamp);
    console.log(this.getSitePath())
  }

  getSitePath() {
    if(this.config.test_crawl){
      return 'crawl-sets/sites.csv'
    }else{
      return `crawl-sets/crawl-set-parts/crawl-set-pt${this.config.crawl_id}`
    }
  }
  /**
   * Loads the list of sites to crawl from the 'sites.csv' file.
   * @async
   * @returns {Promise<void>}
   */
  async loadSites() {
    return new Promise((resolve, reject) => {
      fs.createReadStream(this.getSitePath())
        .pipe(parse({ delimiter: ',', from_line: 2 }))
        .on('data', row => this.config.sites.push(row[0]))
        .on('error', reject)
        .on('end', resolve);
    });
  }

  /**
   * Checks for the presence of a GPC endpoint (gpc.json) on a given site.
   * @async
   * @param {string} site - The base URL of the site to check.
   * @returns {Promise<object>} An object containing the status and data of the GPC endpoint check.
   */
  async checkGPCEndpoint(site) {
    const gpcUrl = new URL('/.well-known/gpc.json', site)
    try {
      const response = await axios.get(gpcUrl, {
        timeout: PAGE_LOAD_TIMEOUT
      });

      return {
        status: response.status,
        data: response.status === 200 ? response.data : null
      };
    } catch (error) {
      return {
        status: null,
        data: null,
        error: error.message
      };
    }
  }

  /**
   * Visits a site using the browser, with retry logic for recoverable errors.
   * @async
   * @param {string} site - The URL of the site to visit.
   * @param {number} siteId - The ID of the site in the crawl list.
   * @param {number} [retries=0] - The number of remaining retries.
   * @returns {Promise<string>} 'success' if the visit was successful, otherwise the name of the error encountered.
   */
  async visitSiteWithRetries(site, siteId, retries = 0) {
    //Checks if a site has been added to database
    //Always false on first try of a site
    const added = await this.dbManager.checkAndUpdateDB(site, siteId);
    if (!added){
      try {
        await this.browserManager.driver.get(this.config.sites[siteId]);
        await new Promise(resolve => setTimeout(resolve, 45000));
        await this.browserManager.checkForCaptcha();
      } catch (error) {
        console.log(error)
        await this.handleError(error, site);
        //Unless we have an unrecoverable error, restart the browser
        if (error.name !== 'HumanCheckError' ) {
          await this.browserManager.setup();
        }
        //If we have more retries and error was not unrecoverablez, retry
        if (retries > 0 && !UNRECOVERABLE_ERRORS.includes(error.name)){
          return this.visitSiteWithRetries(site, siteId, retries - 1); 
        }else{
          //If we have no more retries, return the result
          return error.name;
        }
      }
    }
    return 'success';
  }

  /**
   * Handles errors encountered during crawling, logs the error, and takes a screenshot if applicable.
   * @async
   * @param {Error} error - The error object.
   * @param {string} site - The URL of the site where the error occurred.
   */
  async handleError(error, site) {
    console.log(error,site)
    this.config.errors[error.name] = site;
    await fs.promises.writeFile(
      `./crawl_results/${this.config.timestamp}/error-logging/error-logging.json`,
      JSON.stringify(this.config.errors)
    );

    if (error.name !== 'HumanCheckError') {
      try {
        const screenshot = await this.browserManager.driver.takeScreenshot();
        const base64Data = screenshot.replace(/^data:image\/png;base64,/, '');
        const filename = path.join(`./crawl_results/${this.config.timestamp}/error-logging/`, `${site}.png`);
        await fs.promises.writeFile(filename, base64Data, 'base64');
      } catch (screenshotError) {
        console.log('Screenshot failed');
      }
      await this.browserManager.driver.quit();
    }
  }

  /**
   * Crawls a single site, including visiting the site and checking for the GPC endpoint.
   * It also updates the database with the crawl and GPC check results.
   * @async
   * @param {string} site - The hostname of the site to crawl.
   * @param {number} siteId - The ID of the site in the crawl list.
   * @returns {Promise<object>} An object containing the crawl status and GPC data.
   */
  async crawlSite(site, siteId) {
    console.log(site)
    const tasks = [
      this.visitSiteWithRetries(site, siteId, 1),
      this.checkGPCEndpoint(this.config.sites[siteId])
    ];

    const [visitResult, gpcResult] = await Promise.all(tasks);
    await this.dbManager.logGPCResult(site, gpcResult);

    return {
      site,
      crawlSuccess: visitResult === 'success',
      gpcData: gpcResult
    };
  }

  /**
   * Starts the web crawling process.
   * Loads the list of sites, sets up the browser, iterates through the sites, crawls each one, and then quits the browser.
   * @async
   */
  async start() {
    await this.loadSites();
    await this.browserManager.setup();

    for (let siteId in this.config.sites) {
      const startTime = Date.now();
      const { hostname } = new URL(this.config.sites[siteId]);
      const domain = psl.parse(hostname).domain
      console.log('Processing:', domain);
      const result = await this.crawlSite(domain, siteId);

      const timeSpent = (Date.now() - startTime) / 1000;
      console.log(
        `Site: ${domain}`,
        `Crawl: ${result.crawlSuccess ? 'Success' : 'Failed'}`,
        `GPC: ${result.gpcData.status ? 'Found' : 'Not Found'}`,
        `Time: ${timeSpent}s`
      );
    }

    await this.browserManager.driver.quit();
  }
}

// Start the crawler
(async () => {
  const crawler = new WebCrawler();
  await crawler.start();
})();