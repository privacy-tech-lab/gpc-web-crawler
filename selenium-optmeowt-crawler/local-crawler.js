/**
 * @fileoverview Integrated web crawler with simultaneous site crawling and GPC endpoint checking
 */

const { Builder } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const axios = require('axios');
const requests = require('requests');

/**
 * Custom error class for human verification detection
 * @extends Error
 */
class HumanCheckError extends Error {
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

/**
 * Combined results from crawling and GPC endpoint checking
 * @typedef {Object} CrawlResult
 * @property {string} site - Site URL
 * @property {boolean} crawlSuccess - Whether crawl succeeded
 * @property {Object|null} gpcData - GPC endpoint data if available
 */

/**
 * Manages crawler configuration and initialization
 */
class CrawlerConfig {
  /**
   * @param {string[]} args - Command line arguments
   */
  constructor(args) {
    this.scriptStartTime = Date.now();
    this.sites = [];
    this.errors = {};
    this.operatingSystem = this.determineOS(args);
    this.firefoxBinary = this.getFirefoxPath(args);
  }

  /**
   * Determines operating system from command line flags
   * @param {string[]} args - Command line arguments
   * @returns {Object} Operating system configuration
   * @throws {Error} If multiple OS flags are specified
   */
  determineOS(args) {
    const usingMac = args.includes('-m');
    const usingWindows = args.includes('-w');
    const usingCustomBin = args.includes('-bin');
    
    const activeFlags = [usingMac, usingWindows, usingCustomBin].filter(Boolean).length;
    if (activeFlags > 1) {
      throw new Error('Only one operating system flag can be used.');
    }
    
    return { usingMac, usingWindows, usingCustomBin };
  }

  /**
   * Gets Firefox binary path based on OS configuration
   * @param {string[]} args - Command line arguments
   * @returns {string} Path to Firefox binary
   * @throws {Error} If -bin flag is specified incorrectly
   */
  getFirefoxPath(args) {
    const { usingMac, usingWindows, usingCustomBin } = this.operatingSystem;
    
    if (usingMac) return '/Applications/Firefox\\ Nightly.app/Contents/MacOS/firefox';
    if (usingWindows) return 'Nightly\\firefox.exe';
    if (usingCustomBin) {
      const binIndex = args.indexOf('-bin');
      if (binIndex === -1 || binIndex + 1 >= args.length) {
        throw new Error('Specified -bin flag incorrectly');
      }
      return args[binIndex + 1];
    }
    return '/usr/lib/firefox-nightly/firefox';
  }
}

/**
 * Manages browser setup and operations
 */
class BrowserManager {
  /**
   * @param {CrawlerConfig} config - Crawler configuration
   */
  constructor(config) {
    this.config = config;
    this.driver = null;
  }

  /**
   * Sets up Selenium WebDriver with Firefox
   * @async
   */
  async setup() {
    const options = new firefox.Options()
      .setBinary(this.config.firefoxBinary)
      .setPreference('xpinstall.signatures.required', false)
      .setPreference('services.settings.server', 'https://firefox.settings.services.mozilla.com/v1')
      .addExtensions('./ff-optmeowt-2.0.1.xpi')
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
      .build();

    await this.driver.manage().setTimeouts({
      implicit: 0,
      pageLoad: PAGE_LOAD_TIMEOUT,
      script: SCRIPT_TIMEOUT
    });

    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
  }

  /**
   * Checks if current page is a CAPTCHA/verification page
   * @async
   * @throws {HumanCheckError} If human verification is detected
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
 * Enhanced DatabaseManager with GPC data handling
 */
class DatabaseManager {
  constructor() {
    this.gpcResults = [];
  }

  /**
   * Updates site ID in the database
   * @async
   * @param {Object} data - Site data to update
   */
  async updateSiteId(data) {
    try {
      await axios.put(`${API_BASE_URL}/analysis`, data);
    } catch (error) {
      console.error('Error updating site ID:', error.message);
    }
  }

  /**
   * Logs GPC check result to CSV
   * @async
   * @param {string} site - Site URL
   * @param {Object} gpcResult - GPC check result
   */
  async logGPCResult(site, gpcResult) {
    const csvLine = `${site},${gpcResult?.status || 'None'},"${gpcResult?.data || 'None'}"\n`;
    await fs.promises.appendFile('well-known-data.csv', csvLine);
    
    if (gpcResult?.error) {
      await this.logError(site, gpcResult.error);
    }
  }

  async logError(site, error) {
    const errors = await this.loadErrors();
    errors[site] = error;
    await fs.promises.writeFile(
      'well-known-errors.json',
      JSON.stringify(errors, null, 2)
    );
  }

  async loadErrors() {
    try {
      const data = await fs.promises.readFile('well-known-errors.json', 'utf8');
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  /**
   * Checks and updates database records for a site
   * @async
   * @param {string} site - Site hostname
   * @param {string} siteId - Site identifier
   * @returns {Promise<boolean>} Whether update was successful
   */
  async checkAndUpdateDB(site, siteId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/analysis/${site}`);
      const latestData = response.data;

      if (latestData.length >= 1) {
        const lastEntry = latestData[latestData.length - 1];
        if (lastEntry.site_id === null) {
          lastEntry.site_id = siteId;
          await this.updateSiteId(lastEntry);
          return true;
        }
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
    return false;
  }
}

/**
 * Main crawler class orchestrating the entire crawling process
 */
class WebCrawler {
  constructor() {
    this.config = new CrawlerConfig(process.argv.slice(2));
    this.browserManager = new BrowserManager(this.config);
    this.dbManager = new DatabaseManager();
  }

  /**
   * Loads sites from CSV file
   * @async
   * @returns {Promise<void>}
   */
  async loadSites() {
    return new Promise((resolve, reject) => {
      fs.createReadStream('crawl-sets/sites.csv')
        .pipe(parse({ delimiter: ',', from_line: 2 }))
        .on('data', row => this.config.sites.push(row[0]))
        .on('error', reject)
        .on('end', resolve);
    });
  }

  /**
   * Checks GPC endpoint for a site
   * @async
   * @param {string} site - Site URL
   * @returns {Promise<Object>} GPC check result
   */
  async checkGPCEndpoint(site) {
    try {
      const response = await axios.get(`${site}/.well-known/gpc.json`, {
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
   * Visits a site with retry logic
   * @async
   * @param {string} site - Site hostname
   * @param {string} siteId - Site identifier
   * @param {number} retries - Number of remaining retry attempts
   * @returns {Promise<string>} Result status
   */
  async visitSiteWithRetries(site, siteId, retries = 0) {
    try {
      await this.browserManager.driver.get(this.config.sites[siteId]);
      await new Promise(resolve => setTimeout(resolve, 45000));
      await this.browserManager.checkForCaptcha();
      return 'success';
    } catch (error) {
      await this.handleError(error, site);
      
      if (error.name !== 'HumanCheckError' && retries > 0 && 
          !UNRECOVERABLE_ERRORS.includes(error.name)) {
        await this.browserManager.setup();
        return this.visitSiteWithRetries(site, siteId, retries - 1);
      }
      return error.name;
    }
  }

  /**
   * Handles errors during site visits
   * @async
   * @param {Error} error - Error object
   * @param {string} site - Site hostname
   */
  async handleError(error, site) {
    this.config.errors[error.name] = site;
    await fs.promises.writeFile(
      './error-logging/error-logging.json',
      JSON.stringify(this.config.errors)
    );

    if (error.name !== 'HumanCheckError') {
      try {
        const screenshot = await this.browserManager.driver.takeScreenshot();
        const base64Data = screenshot.replace(/^data:image\/png;base64,/, '');
        const filename = path.join('./error-logging/', `${site}.png`);
        await fs.promises.writeFile(filename, base64Data, 'base64');
      } catch (screenshotError) {
        console.log('Screenshot failed');
      }
      await this.browserManager.driver.quit();
    }
  }

  /**
   * Crawls a single site
   * @async
   * @param {string} site - Site hostname
   * @param {string} siteId - Site identifier
   * @returns {Promise<CrawlResult>} Combined crawl and GPC check results
   */
  async crawlSite(site, siteId) {
    const tasks = [
      this.visitSiteWithRetries(site, siteId, 0),
      this.checkGPCEndpoint(this.config.sites[siteId])
    ];

    const [visitResult, gpcResult] = await Promise.all(tasks);
    await this.dbManager.logGPCResult(site, gpcResult);

    const added = await this.dbManager.checkAndUpdateDB(site, siteId);
    
    if (!added && !UNRECOVERABLE_ERRORS.includes(visitResult)) {
      await this.visitSiteWithRetries(site, siteId, 1);
      await this.dbManager.checkAndUpdateDB(site, siteId);
    }

    return {
      site,
      crawlSuccess: visitResult === 'success',
      gpcData: gpcResult
    };
  }

  /**
   * Starts the crawling process
   * @async
   */
  async start() {
    await this.loadSites();
    await this.browserManager.setup();

    for (let siteId in this.config.sites) {
      const startTime = Date.now();
      const { hostname } = new URL(this.config.sites[siteId]);
      
      console.log('Processing:', hostname);
      const result = await this.crawlSite(hostname, siteId);
      
      const timeSpent = (Date.now() - startTime) / 1000;
      console.log(
        `Site: ${hostname}`,
        `Crawl: ${result.crawlSuccess ? 'Success' : 'Failed'}`,
        `GPC: ${result.gpcData ? 'Found' : 'Not Found'}`,
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