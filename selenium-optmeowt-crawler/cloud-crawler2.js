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
const axios = require("axios");

var total_begin = Date.now(); //start logging time

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
var latest_res_data; //init var to help check if data was posted to db

//start the selenium driver
async function setup() {
  // Set firefox
  options = new firefox.Options().setBinary(firefox.Channel.NIGHTLY);
  options.addArguments("--headless");

  driver = new Builder()
    .usingServer("http://localhost:4444")
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

async function checkDB(site) {
  site_str = site.replace("https://www.", ""); // keep only the domain part of the url -- this only works if site is of this form
  // https://www.npmjs.com/package//axios?activeTab=readme --axios with async
  //   console.log(site_str);
  try {
    const response = await axios.get(
      `http://localhost:8080/analysis/${site_str}`
    );
    latest_res_data = response.data;
  } catch (error) {
    console.error(error);
    latest_res_data = undefined; // make the crawl fail since the rest-api probably exited--may be diferent if api is not local
  }
}
async function try_crawl(siteID, site_array) {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  // try to collect data from the site
  try {
    await Promise.race([
      await driver.get(site_array[siteID]),
      new Promise((resolve) => setTimeout(resolve, 10000)),
    ]);
  } catch (e) {
    console.log(e);
    // driver.quit(); //not sure if this is necessary--try it without
    console.log("------restarting driver------");
    await setup(); //restart the selenium driver
  }
  await new Promise((resolve) => setTimeout(resolve, 10000));
  await checkDB(site_array[siteID]); //check the db to see if domain is in db already
  //note if the domain in excel redirects to some other domain, it will appear that it was not crawled
}

(async () => {
  await setup(); //setup the selenium driver
  var success_site = 0;
  var redo_array = [];

  let site_id = 0;
  while (site_id < sites.length) {
    var begin_site = Date.now();
    console.log(site_id, ": ", sites[site_id]);

    await try_crawl(site_id, sites);

    // if domain is not in db
    if (latest_res_data.length == 0) {
      console.log("-------try again later");
      redo_array.push(sites[site_id]); // assume it is related to that particular site; we'll try again at the end
    } else {
      // domain is in db
      success_site += 1;
    }
    var end_site = Date.now();
    var timeSpent_site = (end_site - begin_site) / 1000;
    console.log(
      "time spent: ",
      timeSpent_site,
      "total elapsed: ",
      (end_site - total_begin) / 1000
    );
    //check to make sure driver is still working -- if it's < 13.25 s it turned off, so restart
    if (timeSpent_site < 13.25) {
      console.log("time < 13.25 s, remove from redo array");
      redo_array = redo_array.slice(0, -1); // remove added entry from redo_array since it's doing it again now
      await setup();
      //have some sort of statement for breaking loop if it's failed twice?
    } else {
      site_id += 1; // driver is still working, move on
    }
    console.log("current success rate: ", success_site, " / ", site_id); // success rate won't be right if a site is redirected to a different domain
    console.log("");
  }

  console.log("finished sites, crawling sites that failed before:");
  console.log(redo_array);
  for (let redo_site in redo_array) {
    var begin_site = Date.now();
    console.log(redo_site, ": ", redo_array[redo_site]);
    await try_crawl(redo_site, redo_array);

    if (latest_res_data.length != 0) {
      // site has been added to db
      success_site += 1;
    }

    var end_site = Date.now();
    var timeSpent_site = (end_site - begin_site) / 1000;
    console.log(
      "time spent: ",
      timeSpent_site,
      "total elapsed: ",
      (end_site - total_begin) / 1000
    );
    console.log("current success rate: ", success_site, " / ", site_id); // update success rate
    console.log("");
  }

  driver.quit();
  console.log("done");

  var total_end = Date.now();
  var total_timeSpent = (total_end - total_begin) / 1000;
  console.log("total time spent: ", total_timeSpent);
})();
