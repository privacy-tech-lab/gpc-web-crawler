const { Builder, Capabilities } = require("selenium-webdriver");
const firefox = require('selenium-webdriver/firefox');
var capabilities = {
  "moz:debuggerAddress" : true,
  "browserName" : "firefox",
  "headless" : true
}
const {By} = require('selenium-webdriver');
const {Key} = require('selenium-webdriver');
const fs = require('fs');
const { parse } = require("csv-parse");


// Loads sites to crawl
const sites = [];
fs.createReadStream("sites.csv")
  .pipe(parse({ delimiter: ",", from_line: 2 }))
  .on("data", function (row) {
    sites.push(row[0])
  })
  .on("error", function (error) {
    console.log(error.message);
  });

(async () => {
    // Set firefox
    var options = new firefox.Options().setBinary(firefox.Channel.NIGHTLY);
    options.addArguments("--headless");
    const driver = new Builder().forBrowser('firefox').setFirefoxOptions(options).build();
    // let driver = new Builder().setFirefoxOptions(options).build();
    console.log("built")
    await driver.get('about:config');
    console.log("built")
    await driver.findElement(By.id("warningButton")).click().finally();
    console.log("built")
    await new Promise(resolve => setTimeout(resolve, 1000));
    box = driver.findElement(By.xpath('//*[@id="about-config-search"]'));
    await box.sendKeys('xpinstall.signatures.required');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await driver.findElement(By.xpath('/html/body/table/tr/td[2]/button')).click().finally();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await driver.installAddon("/Users/jocelynwang/Desktop/WES/privacy-tech-lab/selenium_optmeowt_crawler/myextension.xpi")

    await new Promise(resolve => setTimeout(resolve, 3000));
    const switchAnalysis = Key.chord(Key.ALT, Key.SHIFT, 'T');
    await driver.findElement(By.xpath('/html')).sendKeys(switchAnalysis);

    await new Promise(resolve => setTimeout(resolve, 3000));

    for (let site_id in sites) {
      await new Promise(resolve => setTimeout(resolve, 3000))
      await driver.get(sites[site_id]);
      await new Promise(resolve => setTimeout(resolve, 3000));
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    await driver.takeScreenshot().then(
      function(image) {
          require('fs').writeFileSync('captured_image_3.png', image, 'base64');
      }
    );

    // Export csv data
    await driver.get('about:debugging');
    const exportAnalysis = Key.chord(Key.ALT, Key.SHIFT, 'C');
    await driver.findElement(By.xpath('/html')).sendKeys(exportAnalysis);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    driver.quit();
})();

