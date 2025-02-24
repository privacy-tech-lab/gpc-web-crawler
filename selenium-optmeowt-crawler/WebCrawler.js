const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const axios = require('axios');
const psl = require('psl');
const {UNRECOVERABLE_ERRORS, PAGE_LOAD_TIMEOUT} = require('./constants')
const CrawlerConfig = require('./CrawlerConfig')
const BrowserManager = require('./BrowserManager')
const DatabaseManager = require('./DatabaseManager')
/**
 * The main class responsible for crawling websites and checking for GPC endpoints.
 */
class WebCrawler {
    /**
     * Creates a new WebCrawler instance.
     * Initializes the crawler configuration, browser manager, and database manager.
     */
    constructor(args) {
      this.config = new CrawlerConfig(args);
      this.browserManager = new BrowserManager(this.config);
      this.dbManager = new DatabaseManager(this.config.save_path);
    }
  
    getSitePath() {
      if(this.config.test_crawl){
        return 'crawl-sets/sites.csv'
      }else{
        return `crawl-sets/crawl-set-parts/crawl-set-pt${this.config.crawl_id}.csv`
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
    async checkGPCEndpoint(site, retries = 0) {
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
          if (retries > 0){
            return this.checkGPCEndpoint(site, retries - 1);
          }else {
            return {
                  status: null,
                  data: null,
                  error: error.message
                };
          }
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
      const alreadyAdded = await this.dbManager.checkAndUpdateDB(site, siteId);
      if (!alreadyAdded){
        try {
          await this.browserManager.driver.get(this.config.sites[siteId]);
          await new Promise(resolve => setTimeout(resolve, 22000));
          await this.browserManager.checkForCaptcha();
        } catch (error) {
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
      const wasAdded = await this.dbManager.checkAndUpdateDB(site, siteId);
      if (wasAdded){
         return 'success';
      }else if(retries > 0){
         return this.visitSiteWithRetries(site, siteId, retries - 1);
      }else{
         return 'failure'
      }
    }    
    
    /**
     * Handles errors encountered during crawling, logs the error, and takes a screenshot if applicable.
     * @async
     * @param {Error} error - The error object.
     * @param {string} site - The URL of the site where the error occurred.
     */
    async handleError(error, site) {
      (this.config.errors[error.name] ??= []).push(site);
      await fs.promises.writeFile(
        `${this.config.save_path}/error-logging/error-logging.json`,
        JSON.stringify(this.config.errors)
      );
  
      if (error.name !== 'HumanCheckError') {
        try {
          const screenshot = await this.browserManager.driver.takeScreenshot();
          const base64Data = screenshot.replace(/^data:image\/png;base64,/, '');
          const filename = path.join(`${this.config.save_path}/error-logging/`, `${site}.png`);
          await fs.promises.writeFile(filename, base64Data, 'base64');
        } catch (screenshotError) {
          console.log('Screenshot failed');
        }
        try{
          await this.browserManager.driver.quit();
        }catch (driverError) {
          console.log(`Encountered error while trying to end browser session, error: ${driverError}`)
        }
      }
    }
  
    /**
     * Crawls a single site,.
     * It also updates the database with the crawl results.
     * @async
     * @param {string} site - The hostname of the site to crawl.
     * @param {number} siteId - The ID of the site in the crawl list.
     * @returns {Promise<object>} An object containing the crawl status.
     */
    async crawlSite(site, siteId) {
      const visitResult = await this.visitSiteWithRetries(site, siteId, 1)
  
      return {
        site,
        crawlSuccess: visitResult === 'success'
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
        const url = this.config.sites[siteId]
        const { hostname } = new URL(url);

        const startTime = Date.now();
        console.log('Processing:', hostname);
        const result = await this.crawlSite(hostname, siteId);
        await this.dbManager.increment_siteId()
        const timeSpent = (Date.now() - startTime) / 1000;
        console.log(
          `Site: ${hostname}`,
          `Crawl: ${result.crawlSuccess ? 'Success' : 'Failed'}`,
          `Time: ${timeSpent}s`
        );
      }
  
      await this.browserManager.driver.quit();
    }
}
module.exports = WebCrawler
