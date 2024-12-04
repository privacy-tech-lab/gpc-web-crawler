const { Builder, FluentWait } = require("selenium-webdriver");
const firefox = require("selenium-webdriver/firefox");

const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");
const axios = require("axios");
import "./utils"
var script_started = Date.now(); //start logging time
var err_obj = new Object();
// Loads sites to crawl
const sites = [];
fs.createReadStream("crawl-sets/sites.csv")
  .pipe(parse({ delimiter: ",", from_line: 2 }))
  .on("data", function (row) {
    sites.push(row[0]);
  })
  .on("error", function (error) {
    console.log(error.message);
  });

var options;
let driver;


// Capture command-line arguments
const args = process.argv.slice(2); // Skip first two elements (node and script path)

// Function to get flag presence (returns true if flag is present)
function hasFlag(flag) {
  return args.includes(flag);
}

// Function to get argument for a flag (e.g., -bin /path/to/firefox)
function getFlagValue(flag) {
  try{
    const index = args.indexOf(flag);
    return index !== -1 && index + 1 < args.length ? args[index + 1] : null;
  }catch (error){
    throw new Error(`Specified -bin flag incorrectly: ${error}`)
  }
}

// Check if `-d` or `--dev` flag is present
const using_mac = hasFlag('-m')
const using_windows = hasFlag('-w')
const using_custom_bin = hasFlag("-bin")
const num_active_flags = using_custom_bin + using_mac + using_windows
if (num_active_flags > 1 ){
  throw new Error("Only one operating system flag can be used, found many.")
}
async function setup() {
  //Hardcodes firefox.Channel.nightly which is deprecated:
  //https://github.com/SeleniumHQ/selenium/blob/798f3f966dfcf0c7e1f1c0bce11407e2f702e1d7/javascript/node/selenium-webdriver/firefox.js#L766C92-L766C112
  var bin;
  if (using_mac){
    bin = "/Applications/Firefox\ Nightly.app/Contents/MacOS/firefox"
  }else if (using_windows){
    bin = "Nightly\\firefox.exe"
  }else if (using_custom_bin){
    bin = getFlagValue("-bin")
  }
  else{
    bin = "/usr/lib/firefox-nightly/firefox"
  }
  await new Promise((resolve) => setTimeout(resolve, 3000));
  options = new firefox.Options()
    .setBinary(bin)
    .setPreference("xpinstall.signatures.required", false)
    .setPreference("services.settings.server", "https://firefox.settings.services.mozilla.com/v1")
    .addExtensions("./myextension.xpi");

  options.addArguments("--headful");
  options.addArguments("disable-infobars");
  options.addArguments("--no-sandbox");
  options.addArguments("--disable-application-cache");
  options.addArguments("--disable-gpu");
  options.addArguments("--disable-dev-shm-usage");
  driver = new Builder()
    .forBrowser("firefox")
    .setFirefoxOptions(options)
    .build();
  // set timeout so that if a page doesn't load in 30 s, it times out
  await driver
    .manage()
    .setTimeouts({ implicit: 0, pageLoad: 35000, script: 30000 });
  console.log("built");
  // await driver.manage().window().maximize();
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
  st = site.replace("https://www.", ""); // keep only the domain part of the url -- this only works if site is of this form
  st = st.replace("https://", ""); // removes https:// if www. isn't in the link
  // dealing with sites that have additional paths (only keep the part before the path)
  split = st.split("/");
  site_str = split[0];
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
async function visit_site_with_retires(sites, site_id, gpc_enabled, retries) {
  try {
    await driver.get(sites[site_id])
    check_if_captcha_page(driver)
    await driver.wait(async () => {
      const readyState = await driver.executeScript('return document.readyState');
      return readyState === 'complete';
    }, 10000);
    
  } catch (e) {
    console.log(e);
    let err_key = e.name
    // we want to separate the reaching an error page from other webdriver errors
    if (e.message.match(/reached error page/i)) {
      err_key += ": Reached Error Page";
    }
    // log the errors in an object so you don't have to sort through manually
    err_obj[err_key] = (sites[site_id]);
    var err_data = JSON.stringify(err_obj);

    // writing the JSON string content to a file
    fs.writeFile("./error-logging/error-logging.json", err_data, (error) => {
      // throwing the error
      // in case of a writing problem
      if (error) {
        // logging the error
        console.error(error);

        throw error;
      }
      console.log("error-logging.json written correctly");
    });
    //////////////////////
    if (e.name != "HumanCheckError") {
      if (e.message.match(/Failed to decode response from marionette/i)) {
        console.log(
          e.name + ": " + e.message + "-- driver should already have quit "
        );
      } else {
        // take a screenshot of the page so we can better understand what was going on
        try {
          driver.takeScreenshot().then(function (data) {
            var base64Data = data.replace(/^data:image\/png;base64,/, "");
            var fullfilename = path.join("./error-logging/", hostname + ".png"); //creates full file name
            fs.writeFile(fullfilename, base64Data, "base64", function (err) {
              if (err) console.log(err);
            });
          });
        } catch (screenshot_err) {
          console.log("screenshot failed");
        }
        driver.quit();
      }
      console.log("------restarting driver------");
      new Promise((resolve) => setTimeout(resolve, 10000));
      await setup(); //restart the selenium driver
      if (retries > 0){
        visit_site_with_retires(sites, site_id, gpc_enabled, retries - 1)
      }
    }
  }

}

function crawl_site(sites, site_id) {
  const { hostname } = new URL(sites[site_id]);
  visit_site_with_retires(sites, site_id, false, 3)


  visit_site_with_retires(sites, site_id, true, 3)


}

(async () => {
  //setup crawler browser
  await setup();
  for (let site_id in sites) {
    var crawl_started = Date.now();
    crawl_site(sites, site_id)
    var crawl_ended = Date.now();
    var time_spent_on_site_in_seconds = (crawl_ended - crawl_started) / 1000;
    console.log(
      "time spent: ",
      time_spent_on_site_in_seconds,
      "total elapsed: ",
      (crawl_ended - script_started) / 1000
    );
  }

  driver.quit();
})();

