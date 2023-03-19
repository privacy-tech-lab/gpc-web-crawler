const { Builder, Capabilities } = require("selenium-webdriver");
const firefox = require("selenium-webdriver/firefox");
var capabilities = {
  "moz:debuggerAddress": true,
  browserName: "firefox",
  // headless: true,
  headless: false,
  "download.default_directory": "/Downloads",
}; 

const { By } = require("selenium-webdriver");
const { Key } = require("selenium-webdriver");
const fs = require("fs");
const { parse } = require("csv-parse");
const axios = require("axios");
var last_input_domain = "";

/////////////////////////// get the last domain that has been input ////
axios
  .get("https://rest-api-dl7hml6cxq-uc.a.run.app/last_input_domain")
  .then(function (res) {
    if (res.data.length != 0) {
      last_input_domain = res.data[0]["domain"];
      console.log("last domain was :", last_input_domain);
    }
  })
  .catch((err) => console.log(err));
//////////////////////////

var total_begin = Date.now(); //start logging time
var error_count = 0;
// var sessionID;
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

  let options = new firefox.Options()
    .setPreference('xpinstall.signatures.required', false)
    .addExtensions('./myextension.xpi')
  options.addArguments("--headful");
  driver = new Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(options)
    // .usingServer("http://localhost:4444")
    .usingServer("https://selenium-firefox-dl7hml6cxq-uc.a.run.app/") //lab account version
    .withCapabilities(capabilities)
    .build();
  console.log("built");

  await new Promise((resolve) => setTimeout(resolve, 3000));
  console.log("setup complete");
}

async function checkDB(site) {
  site_str = site.replace("https://www.", ""); // keep only the domain part of the url -- this only works if site is of this form
  // https://www.npmjs.com/package//axios?activeTab=readme --axios with async
  //   console.log(site_str);
  try {
    const response = await axios.get(
      `https://rest-api-dl7hml6cxq-uc.a.run.app//analysis/${site_str}`
    );
    latest_res_data = response.data;
  } catch (error) {
    console.error(error.message);
    latest_res_data = undefined; // make the crawl fail since the rest-api probably exited--may be diferent if api is not local
  }
}
async function try_crawl(siteID, site_array) {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  // try to collect data from the site
  try {
    await Promise.race([
      await driver.get(site_array[siteID]),
      new Promise((resolve) => setTimeout(resolve, 20000)),
    ]);
  } catch (e) {
    error_count += 1;
    console.log("error count: ", error_count);
    console.log(e);
  }
  await new Promise((resolve) => setTimeout(resolve, 10000));
  await checkDB(site_array[siteID]);
}

(async () => {
  await setup(); //setup the selenium driver
  redo_array = Array(sites.length).fill(0);

  //set site id -- we want to pick up where we left off
  var site_id;
  if (last_input_domain == "") {
    site_id = 0;
  } else {
    site_id = sites.indexOf("https://www." + last_input_domain) + 1;
  }

  while (site_id < sites.length) {
    var begin_site = Date.now();
    console.log(site_id, ": ", sites[site_id]);

    await try_crawl(site_id, sites);

    var end_site = Date.now();
    var timeSpent_site = (end_site - begin_site) / 1000;
    console.log(
      "time spent: ",
      timeSpent_site,
      "total elapsed: ",
      (end_site - total_begin) / 1000
    );
    //check to make sure driver is still working -- if it turned off, restart
    if (timeSpent_site < 14.4) {
      console.log("time < 14.4 s");
      await setup();
    } else {
      //driver is working: if it was added or the site has been tried 3x, move on
      if (latest_res_data.length != 0 || redo_array[site_id] == 1) {
        site_id += 1; //it was added -> inc
      } else if (latest_res_data.length == 0) {
        // it wasn't added -> update the array
        redo_array[site_id] += 1;
        console.log(
          "wasn't added, try again:  attempts: ",
          redo_array[site_id]
        );
      }
    }
    console.log("");
  }

  driver.quit();
  console.log("done");

  var total_end = Date.now();
  var total_timeSpent = (total_end - total_begin) / 1000;
  console.log("total time spent: ", total_timeSpent);
})();