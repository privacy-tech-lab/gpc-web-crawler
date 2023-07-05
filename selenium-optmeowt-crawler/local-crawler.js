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

// write a custom error
// we throw this the title of the site is access denied
// then we can identify sites that we can't crawl with the vpn on
class AccessDeniedError extends Error {
  constructor(message) {
    super(message);
    this.name = "AccessDeniedError";
  }
}
class VerifyHumanError extends Error {
  constructor(message) {
    super(message);
    this.name = "VerifyHumanError";
  }
}

async function setup() {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  options = new firefox.Options()
    .setBinary(firefox.Channel.NIGHTLY)
    .setPreference("xpinstall.signatures.required", false)
    .addExtensions("./myextension.xpi");

  options.addArguments("--headful");
  driver = new Builder()
    .forBrowser("firefox")
    .setFirefoxOptions(options)
    .build();
  // set timeout so that if a page doesn't load in 30 s, it times out
  await driver
    .manage()
    .setTimeouts({ implicit: 0, pageLoad: 30000, script: 30000 });
  console.log("built");

  await new Promise((resolve) => setTimeout(resolve, 3000));
  console.log("setup complete");
}

async function put_site_id(data) {
  try {
    var response = await axios.put(`http://localhost:8080/analysis`, data);
  } catch (error) {
    console.error(error);
  }
}

async function check_update_DB(site, site_id) {
  site_str = site.replace("https://www.", ""); // keep only the domain part of the url -- this only works if site is of this form
  // https://www.npmjs.com/package//axios?activeTab=readme --axios with async
  //   console.log(site_str);
  var added = false;
  try {
    // after a site is visited, to see if the data was added to the db
    var response = await axios.get(
      `http://localhost:8080/analysis/${site_str}`
    );

    latest_res_data = response.data;
    // console.log("getting: ", site_str, "-->", latest_res_data);

    if (latest_res_data.length >= 1) {
      // console.log(latest_res_data[latest_res_data.length - 1]);
      //it exists -> get last added and make sure that id is null (ie it just got added)
      if (latest_res_data[latest_res_data.length - 1]["site_id"] == null) {
        //update site_id
        latest_res_data[latest_res_data.length - 1]["site_id"] = site_id;
        // do put request to update site_id
        await put_site_id(latest_res_data[latest_res_data.length - 1]);
        added = true;
      }
    } else {
      var res = await axios.get(`http://localhost:8080/null_analysis`);

      latest_res_data = res.data;
      console.log("null site_id: ", latest_res_data);
      if (latest_res_data.length >= 1) {
        latest_res_data[latest_res_data.length - 1]["site_id"] = site_id;
        // do put request
        await put_site_id(latest_res_data[latest_res_data.length - 1]);
        added = true;
      }
    }
  } catch (error) {
    console.error(error.message);
    latest_res_data = undefined; // make the crawl fail since the rest-api probably exited--may be diferent if api is not local
  }
  return added;
}
async function visit_site(sites, site_id) {
  var error_value = "no_error";
  console.log(site_id, ": ", sites[site_id]);
  try {
    await driver.get(sites[site_id]);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    // check if access is denied
    // if so, throw an error so it gets tagged as an access denied site
    var title = await driver.getTitle();
    if (title.match(/Access Denied/i)) {
      throw new AccessDeniedError("Access Denied");
    }
    if (title.match(/Just a moment.../i)) {
      throw new VerifyHumanError("page asked to verify you are human");
    }
  } catch (e) {
    console.log(e);
    var msg = "";
    // we want to separate the reaching an error page from other webdriver errors
    if (e.message.match(/reached error page/i)) {
      msg = ": Reached Error Page";
    }
    // log the errors in an object so you don't have to sort through manually
    if (e.name + msg in err_obj) {
      err_obj[e.name + msg].push(sites[site_id]);
    } else {
      err_obj[e.name + msg] = [sites[site_id]];
    }
    console.log(err_obj);
    error_value = e.name; // update error value
    // if it's just access denied, we don't need to restart
    if (e.name != "AccessDeniedError" && e.name != "VerifyHumanError") {
      driver.quit();
      console.log("------restarting driver------");
      new Promise((resolve) => setTimeout(resolve, 10000));
      await setup(); //restart the selenium driver
    }
  }
  return error_value;
}
async function putReq_and_checkRedo(sites, site_id, error_value) {
  // check the db to see if prev site was added / add the site_id
  var added = await check_update_DB(sites[site_id], site_id);
  if (
    //determine whether to redo the site--redo if it wasn't added and there was not
    //an error that prevents us from analyzing that site
    added == false &&
    error_value != "InsecureCertificateError" &&
    error_value != "WebDriverError" &&
    error_value != "AccessDeniedError" &&
    error_value != "VerifyHumanError"
  ) {
    console.log("redo prev site");
    await visit_site(sites, site_id);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // putting site id on redo site
    added = await check_update_DB(sites[site_id], site_id);
  }
}

(async () => {
  await setup();
  var error_value = "no_error";
  for (let site_id in sites) {
    var begin_site = Date.now(); // for timing
    await new Promise((resolve) => setTimeout(resolve, 3000));
    if (site_id > 0) {
      // check if previous site was added
      // if so, do the put request accordingly
      // if not, see if we need to redo it
      await putReq_and_checkRedo(sites, site_id - 1, error_value);
    }
    error_value = await visit_site(sites, site_id);

    //just for the last entry--inc timeout to make sure it is input before checking
    if (site_id == sites.length - 1) {
      // give it extra time for site to be added to db
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await putReq_and_checkRedo(sites, site_id, error_value);
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
