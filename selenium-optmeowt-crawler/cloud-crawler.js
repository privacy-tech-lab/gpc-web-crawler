const { Builder, Capabilities } = require("selenium-webdriver");
const firefox = require("selenium-webdriver/firefox");
var capabilities = {
  "moz:debuggerAddress": true,
  browserName: "firefox",
  headless: true,
  "download.default_directory": "/Downloads",
};
const { By } = require("selenium-webdriver");
const { Key } = require("selenium-webdriver");
const fs = require("fs");
const { parse } = require("csv-parse");

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

//set options and driver as global
var options;
let driver;

//start the selenium driver
async function setup() {
  // Set firefox
  options = new firefox.Options().setBinary(firefox.Channel.NIGHTLY);
  options.addArguments("--headless");

  driver = new Builder()
    .usingServer("http://localhost:4444")
    // .usingServer("https://standalone-firefox-jxxphy2r5a-uc.a.run.app/") // my deployed version
    // .usingServer("https://selenium-firefox-dl7hml6cxq-uc.a.run.app/") //lab account version
    .withCapabilities(capabilities)
    // .setFirefoxOptions(options)
    .build();
  console.log("built");
  await driver.get("about:config");
  console.log("built");
  await driver.findElement(By.id("warningButton")).click().finally();
  console.log("built");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  box = driver.findElement(By.xpath('//*[@id="about-config-search"]'));
  await box.sendKeys("xpinstall.signatures.required");
  console.log("sent keys");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await driver
    .findElement(By.xpath("/html/body/table/tr/td[2]/button"))
    .click()
    .finally();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("installing addon...");
  await driver.installAddon("./myextension.xpi");

  await new Promise((resolve) => setTimeout(resolve, 3000));
  const switchAnalysis = Key.chord(Key.ALT, Key.SHIFT, "T");
  await driver.findElement(By.xpath("/html")).sendKeys(switchAnalysis);

  await new Promise((resolve) => setTimeout(resolve, 3000));
  console.log("setup complete");
}

(async () => {
  await setup(); //setup the selenium driver

  for (let site_id in sites) {
    console.time("time-elapsed");
    console.log(site_id, ": ", sites[site_id]);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    try {
      await Promise.race([
        await driver.get(sites[site_id]),
        new Promise((resolve) => setTimeout(resolve, 10000)),
      ]);
    } catch (e) {
      console.log(e);
      driver.quit(); //not sure if this is necessary
      console.log("------restarting driver------");
      await setup(); //restart the selenium driver
    }
    await new Promise((resolve) => setTimeout(resolve, 10000));
    console.timeEnd("time-elapsed");
  }

  // Export csv data
  // await driver.get("about:debugging");
  // const exportAnalysis = Key.chord(Key.ALT, Key.SHIFT, "C");
  // await driver.findElement(By.xpath("/html")).sendKeys(exportAnalysis);
  // await new Promise((resolve) => setTimeout(resolve, 3000));

  driver.quit();
  console.log("done");
})();