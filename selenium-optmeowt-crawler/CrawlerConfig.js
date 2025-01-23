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
      this.save_path = args[0];
      this.test_crawl = args[1] === "1";
      this.crawl_id = args[2];
    }
}
module.exports = CrawlerConfig
