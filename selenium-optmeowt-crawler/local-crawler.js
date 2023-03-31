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
const axios = require("axios");

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
    .setTimeouts({ implicit: 0, pageLoad: 20000, script: 30000 });
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

async function put_site_id(data) {
  try {
    const response = await axios.put(
      // `https://rest-api-dl7hml6cxq-uc.a.run.app/analysis`,
      `http://localhost:8080/analysis`,
      data
    );
  } catch (error) {
    console.error(error);
  }
}

async function check_update_DB(site, site_id) {
  site_str = site.replace("https://www.", ""); // keep only the domain part of the url -- this only works if site is of this form
  // https://www.npmjs.com/package//axios?activeTab=readme --axios with async
  //   console.log(site_str);

  try {
    // after a site is visited, to see if the data was added to the db
    const response = await axios.get(
      `https://rest-api-dl7hml6cxq-uc.a.run.app/analysis/${site_str}`
    );
    latest_res_data = response.data;

    if (latest_res_data.length >= 1) {
      // console.log(latest_res_data[latest_res_data.length - 1]);
      //it exists -> get last added and make sure that id is null (ie it just got added)
      if (latest_res_data[latest_res_data.length - 1]["site_id"] == null) {
        //update site_id
        latest_res_data[latest_res_data.length - 1]["site_id"] = site_id;
        // do put request to update site_id
        await put_site_id(latest_res_data[latest_res_data.length - 1]);
      }
    } else {
      // is not in db -- due to not getting added or redirect
      // then just search for null val and update the last site with null site_id
      const res = await axios.get(`http://localhost:8080/null`);
      latest_res_data = res.data;
      console.log("null site_id: ", latest_res_data);
      if (latest_res_data.length >= 1) {
        latest_res_data[latest_res_data.length - 1]["site_id"] = site_id;
        // do put request
        await put_site_id(latest_res_data[latest_res_data.length - 1]);
      }
    }
  } catch (error) {
    console.error(error.message);
    latest_res_data = undefined; // make the crawl fail since the rest-api probably exited--may be diferent if api is not local
  }
}

(async () => {
  await setup();
  for (let site_id in sites) {
    var begin_site = Date.now(); // for timing
    console.log(site_id, ": ", sites[site_id]);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    if (site_id > 0) {
      // check the db to see if prev site was added / add the site_id
      // check here so that we don't have to increase timeouts
      await check_update_DB(sites[site_id - 1], site_id - 1);
    }
    try {
      await driver.get(sites[site_id]);
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

    //just for the last entry--inc timeout to make sure it is input before checking
    if (site_id == sites.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await check_update_DB(sites[site_id], site_id);
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
