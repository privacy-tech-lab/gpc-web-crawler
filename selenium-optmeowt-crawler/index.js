const WebCrawler = require('./WebCrawler')

// Start the crawler
const crawler = new WebCrawler(process.argv.slice(2));

(async () => {
  await crawler.start();
})();
  
  
