const { Builder } = require("selenium-webdriver");
const firefox = require("selenium-webdriver/firefox");

const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");
const axios = require("axios");

var total_begin = Date.now(); //start logging time
var err_obj = new Object();
// Loads sites to crawl
const sites = [];
fs.createReadStream("sites.csv")
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
// we throw this the title of the site has a human check
// then we can identify sites that we can't crawl with the vpn on
class HumanCheckError extends Error {
  constructor(message) {
    super(message);
    this.name = "HumanCheckError";
  }
}

async function setup() {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  options = new firefox.Options()
    .setBinary("/usr/lib/firefox-nightly/firefox")
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
async function visit_site(sites, site_id) {
  var error_value = "no_error";
  console.log(site_id, ": ", sites[site_id]);
  try {
    await driver.get(sites[site_id]);
    // console.log(Date.now()); to compare to site loading time in debug table
    await new Promise((resolve) => setTimeout(resolve, 22000));
    // await new Promise((resolve) => setTimeout(resolve, 80000)); // for ground truth collection

    // check if access is denied
    // if so, throw an error so it gets tagged as a human check site
    var title = await driver.getTitle();
    if (
      (title.match(/Access/i) && title.match(/Denied/i)) ||
      title.match(/error/i) ||
      (title.match(/service/i) && title.match(/unavailable/i)) ||
      title.match(/Just a moment.../i) ||
      title.match(/you have been blocked/i) ||
      title.match(/site not available/i) ||
      title.match(/attention required/i) ||
      title.match(/access to this page has been blocked/i) ||
      (title.match(/site/i) && title.match(/temporarily unavailable/i)) ||
      (title.match(/site/i) && title.match(/temporarily down/i)) ||
      title.match(/403 forbidden/i) ||
      title.match(/pardon our interruption/i) ||
      title.match(/robot or human/i) ||
      title.match(/are you a robot/i) ||
      title.match(/block -/i) ||
      title.match(/Human Verification/i)
    ) {
      throw new HumanCheckError("Human Check");
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

    ///////////////
    // converting the JSON object to a string
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

    // if it's just a human check site, we don't need to restart
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
            var st = sites[site_id].replace("https://www.", ""); // keep only the domain part of the url -- this only works if site is of this form
            st = st.replace("https://", ""); // removes https:// if www. isn't in the link
            st = st.replace(/\/$/, '') // removes trailing / from filename
            var fullfilename = path.join("./error-logging/", st + ".png"); //creates full file name
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
    error_value != "HumanCheckError"
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
    await new Promise((resolve) => setTimeout(resolve, 2000));
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
