const { Builder, Capabilities } = require("selenium-webdriver");
const firefox = require("selenium-webdriver/firefox");
// var capabilities = {
//   "moz:debuggerAddress": true,
//   browserName: "firefox",
//   headless: true,
// };
const { By } = require("selenium-webdriver");
const { Key } = require("selenium-webdriver");
const fs = require("fs");
const { parse } = require("csv-parse");

var total_begin = Date.now(); //start logging time
var err_obj = new Object();
// Loads sites to crawl
const sites = [];
fs.createReadStream("sites1.csv")
  .pipe(parse({ delimiter: ",", from_line: 2 }))
  .on("data", function (row) {
    sites.push(row[0]);
  })
  .on("error", function (error) {
    console.log(error.message);
  });

var options;
let driver;

async function setup() {
  options = new firefox.Options()
    .setBinary(firefox.Channel.NIGHTLY)
    .setPreference("xpinstall.signatures.required", false)
    .addExtensions("./myextension.xpi");
  options.addArguments("--headful");
  driver = new Builder()
    .forBrowser("firefox")
    .setFirefoxOptions(options)
    .build();
  // set timeout so that if a page doesn't load in 10 s, it times out
  await driver
    .manage()
    .setTimeouts({ implicit: 0, pageLoad: 10000, script: 30000 });
  console.log("built");
  // await driver.get("about:config");
  // console.log("built");
  // await driver.findElement(By.id("warningButton")).click().finally();
  // console.log("built");
  // await new Promise((resolve) => setTimeout(resolve, 1000));
  // box = driver.findElement(By.xpath('//*[@id="about-config-search"]'));
  // await box.sendKeys("xpinstall.signatures.required");
  // await new Promise((resolve) => setTimeout(resolve, 1000));
  // await driver
  //   .findElement(By.xpath("/html/body/table/tr/td[2]/button"))
  //   .click()
  //   .finally();
  // await new Promise((resolve) => setTimeout(resolve, 1000));
  // console.log("installing addon...");
  // await driver.installAddon("./myextension.xpi");

  await new Promise((resolve) => setTimeout(resolve, 3000));
  console.log("setup complete");
}

(async () => {
  await setup();
  for (let site_id in sites) {
    var begin_site = Date.now(); // for timing
    console.log(site_id, ": ", sites[site_id]);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    try {
      await Promise.race([
        await driver.get(sites[site_id]),
        new Promise((resolve) => setTimeout(resolve, 10000)),
      ]);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (e) {
      console.log(e);
      // log the errors in an object so you don't have to sort through manually
      if (e.name in err_obj) {
        err_obj[e.name].push(sites[site_id]);
      } else {
        err_obj[e.name] = [sites[site_id]];
      }
      console.log(err_obj);

      driver.quit();
      console.log("------restarting driver------");
      new Promise((resolve) => setTimeout(resolve, 10000));
      await setup(); //restart the selenium driver
    }
    var end_site = Date.now();
    var timeSpent_site = (end_site - begin_site) / 1000;
    console.log(
      "time spent: ",
      timeSpent_site,
      "total elapsed: ",
      (end_site - total_begin) / 1000
    );
  }

  driver.quit();
})();
