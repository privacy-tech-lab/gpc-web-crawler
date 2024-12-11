/*
Licensed per https://github.com/privacy-tech-lab/gpc-optmeowt/blob/main/LICENSE.md
privacy-tech-lab, https://www.privacytechlab.org/
*/

/*
analysis.js
================================================================================
analysis.js 


Overall we have one goal with this script: Run an analysis on a page.
In order to do this, we will have the following functionality:

- Check the result of a __uspapi call exposed through the window object
- Check for a usprivacy cookie
- Check for usprivacy strings in URLs
- Check for usprivacy strings in HTTP headers

We will ultimately do this in the following order: 

(1) Load a page and check for a usprivacy string
(2) Send a GPC signal to the site and reload
(3) Check for any updated usprivacy strings
(4) Compile into a resulting analysis breakdown

This can potentially extend into other privacy flags into the future. A more 
direct task nearer to the immediate future is to check how CMP (OneTrust, etc.)
sites handle opt-out cookies and how they track in accordance with sending a 
GPC signal to a site that also has/does not have usprivacy strings. 

WARNING:  Content Security Policies are DISABLED while Analysis Mode is ON.
- This leaves you potentially vulnerable to cross-site scripting attacks!
- See disableCSPPerRequest function for more details
*/
import axios from "axios";
import { stores, storage } from "./../storage.js";
import {
  uspPhrasing,
  uspCookiePhrasingList,
} from "../../data/regex.js";
import psl from "psl";
import { headers } from "../../data/headers.js";

/******************************************************************************/
/******************************************************************************/
/**********             # Initializers (cached values)               **********/
/******************************************************************************/
/******************************************************************************/

var analysis = {};
var analysis_userend = {};
var analysis_counter = {};
var domains_collected_during_analysis = [];
var urlsWithUSPString = [];
var firstPartyDomain = "";
var changingSitesOnAnalysis = false;
var debugging_version = true; // assume that the debugging table exists
var urlclassification = {};
var run_halt_counter = {};
var last_committed_url = "";

/******************************************************************************/
/******************************************************************************/
/**********                       # Functions                        **********/
/******************************************************************************/
/******************************************************************************/

// Listener parameters for webRequest & webNavigation
const MOZ_REQUEST_SPEC = ["requestHeaders", "blocking"];
const MOZ_RESPONSE_SPEC = ["responseHeaders", "blocking"];
const FILTER = { urls: ["<all_urls>"] };

function updateAnalysisCounter() {
  let domains_collected = Object.keys(domains_collected_during_analysis);
  for (let i = 0; i < domains_collected_during_analysis.length; i++) {
    analysis_counter[domains_collected[i]] += 1;
  }

  domains_collected_during_analysis = [];
}

async function checkForUSPString(url) {
  if (uspPhrasing.test(url)) {
    urlsWithUSPString.push(url);
  }
}

// Update analysis icon when running
function setAnalysisIcon(tabID) {
  chrome.browserAction.setIcon({
    // no need for browser specific bc analysis mode is only Firefox

    tabId: tabID,
    path: "../../assets/face-icons/optmeow-face-circle-yellow-128.png",
  });
}

/**
 * Though the name says just GPC headers are added here, we also:
 * (1) Check the current stopped URL for a us_privacy string
 * (2) Attatch the GPC headers
 * NOTE: We attach the DOM property in another listener upon finishing reloading
 * @param {Object} details
 * @returns Object
 */
function addGPCHeadersCallback(details) {
  setAnalysisIcon(details.tabId); // Show analysis icon
  checkForUSPString(details.url); // Dump all URLs that contain a us_privacy string

  for (let signal in headers) {
    // add GPC headers
    let s = headers[signal];
    details.requestHeaders.push({ name: s.name, value: s.value });
  }
  return { requestHeaders: details.requestHeaders };
}

/**
 * WARNING: Disables CSP for ALL sites while Analysis Mode is ON.
 * Catches the few sites that didn't work in our initial study.
 * https://github.com/PhilGrayson/chrome-csp-disable/blob/master/background.js
 */
function disableCSPCallback(details) {
  for (var i = 0; i < details.responseHeaders.length; i++) {
    if (
      details.responseHeaders[i].name.toLowerCase() ===
      "content-security-policy"
    ) {
      details.responseHeaders[i].value = "";
    }
  }
  return { responseHeaders: details.responseHeaders };
}
let disableCSPFilter = {
  urls: ["*://*/*"],
  types: ["main_frame", "sub_frame"],
};

var addGPCHeaders = function () {
  chrome.webRequest.onBeforeSendHeaders.addListener(
    addGPCHeadersCallback,
    FILTER,
    MOZ_REQUEST_SPEC
  );
};

var removeGPCSignals = function () {
  chrome.webRequest.onBeforeSendHeaders.removeListener(addGPCHeadersCallback);
};

/**
 * Fetches all US Privacy cookies on current domain that match USP phrasings
 * from uspCookiePhrasingList in regex.js
 * @returns Promise (resolves to an array of cookies if awaited for)
 */
async function fetchUSPCookies() {
  return new Promise((resolve, reject) => {
    let promises = [];
    let allUSPCookies = [];
    for (let i in uspCookiePhrasingList) {
      promises.push(
        new Promise((resolve, reject) => {
          chrome.cookies.getAll(
            {
              domain: firstPartyDomain,
              name: uspCookiePhrasingList[i],
            },
            function (cookies) {
              for (let j in cookies) {
                allUSPCookies.push(cookies[j]);
              }
              // allUSPCookies.push(cookies);
              resolve(cookies);
            }
          );
        })
      );
    }
    Promise.all(promises).then((values) => {
      resolve(allUSPCookies);
    });
  });
}

/**
 * Fetches all USPAPI data by invoking a script to inject such a call onto
 * the current webpage. The data is passed back via messages and resolved.
 * @returns Promise (resolves to a USPAPI result object)
 */
function fetchUSPAPIData() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { msg: "USPAPI_FETCH_REQUEST" },
        function (response) {
          function onResponseHandler(message, sender, sendResponse) {
            chrome.runtime.onMessage.removeListener(onResponseHandler);
            if (message.msg == "USPAPI_TO_BACKGROUND_FROM_FETCH_REQUEST") {
              resolve(message);
            }
          }
          chrome.runtime.onMessage.addListener(onResponseHandler);
        }
      );
    });
  });
}

function fetchGPPData() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { msg: "GPP_FETCH_REQUEST" },
        function (response) {
          function onResponseHandler(message, sender, sendResponse) {
            chrome.runtime.onMessage.removeListener(onResponseHandler);
            if (message.msg == "GPP_TO_BACKGROUND_FROM_FETCH_REQUEST") {
              resolve(message);
            }
          }
          chrome.runtime.onMessage.addListener(onResponseHandler);
        }
      );
    });
  });
}

function fetch_getGPPData() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { msg: "getGPPData_FETCH_REQUEST" },
        function (response) {
          function onResponseHandler(message, sender, sendResponse) {
            chrome.runtime.onMessage.removeListener(onResponseHandler);
            if (message.msg == "getGPPData_TO_BACKGROUND_FROM_FETCH_REQUEST") {
              resolve(message);
            }
          }
          chrome.runtime.onMessage.addListener(onResponseHandler);
        }
      );
    });
  });
}

/**
 * Manually fetches all US Privacy data in both the USPAPI if it exists
 * and also US Privacy cookies if they exist.
 * @returns Object - Contains USP cookies, USPAPI data, and the location
 */
async function fetchUSPStringData() {
  const uspapiData = await fetchUSPAPIData();
  const uspCookies = await fetchUSPCookies(); // returns array of all cookies, irrespective of order

  return {
    cookies: uspCookies,
    data: uspapiData.data,
    location: uspapiData.location,
  };
}
//sends sql post request to db and then resets the global sql_data
function send_sql_and_reset(domain) {
  analysis_userend[domain]["domain"] = domain;
  analysis_userend[domain]["urlClassification"] = JSON.stringify(urlclassification[domain]).slice(0, 5000); //add urlClassification info, cap it at 5000 chars 
  axios
    .post("http://rest_api:8080/analysis", analysis_userend[domain], {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => console.log(res.data))
    .catch((err) => console.log(err));
}

function post_to_debug(domain, a, b) {
  if (debugging_version == true) {
    var debug_data_post = {
      domain: domain,
      a: JSON.stringify(a),//.slice(0, 4000),
      b: JSON.stringify(b) //.slice(0, 4000),
    };
    if (debug_data_post['a'] != null) {
      debug_data_post['a'] = debug_data_post['a'].slice(0, 4000);  // make sure these aren't too long for the sql table
    }
    if (debug_data_post['b'] != null) {
      debug_data_post['b'] = debug_data_post['b'].slice(0, 4000);
    }
    axios
      .post("http://rest_api:8080/debug", debug_data_post, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => console.log(res.data))
      .catch(function (err) {
        // we assume the debugging table doesn't exist, so stop trying to post things to it
        // more information on how this works in issue #50.
        debugging_version = false;
      });
  }
}
/**
 * Initializes the analysis with a refresh after being triggered
 *
 * (1) Query the first party domain for data recording use
 * (2) Add GPC headers
 * (3) Attach DOM property to page after reload
 */
async function runAnalysis() {
  post_to_debug(firstPartyDomain, "line 308", "runAnalysis-fetching");
  const uspapiData = await fetchUSPStringData();
  post_to_debug(firstPartyDomain, "line 310", "runAnalysis-uspsFetched");
  const gppData = await fetchGPPData();
  post_to_debug(firstPartyDomain, "line 312", "runAnalysis-gppFetched");

  let url = new URL(uspapiData.location);
  let domain = parseURL(url);
  if (uspapiData.data !== "USPAPI_FAILED" && uspapiData.data !== null) { //check for null return val for sites like cbs12.com
    logData(domain, "USPAPI", uspapiData.data);
  }
  if (uspapiData.cookies) {
    logData(domain, "COOKIES", uspapiData.cookies);
  }

  url = new URL(gppData.location); // when we remove USPAPI, we can uncomment this
  domain = parseURL(url);
  if (gppData.data !== "GPP_FAILED" && gppData.data !== null) {
    if (gppData.data.gppVersion == '1.0') {
      // getGPPData is where the GPP String is
      const getGPPData = await fetch_getGPPData();
      post_to_debug(firstPartyDomain, getGPPData.data, "GPP-DATA-v1");
      logData(domain, "GPP", getGPPData.data);
    } else {
      // the GPP String is just inside gppData.data
      post_to_debug(firstPartyDomain, gppData.data, "GPP-DATA-v1.1");
      logData(domain, "GPP", gppData.data);
    }
    post_to_debug(firstPartyDomain, gppData.data.gppVersion, "gpp version");
    logData(domain, "GPP_VERSION", gppData.data.gppVersion);
  }

  changingSitesOnAnalysis = true; // Analysis=ON flag
  post_to_debug(firstPartyDomain, "line 342", "runAnalysis-addingHeaders");
  addGPCHeaders();
  await new Promise((resolve) => setTimeout(resolve, 2500)); //new
  // await new Promise((resolve) => setTimeout(resolve, 3000)); //for ground truth collection
  chrome.tabs.reload();
  post_to_debug(firstPartyDomain, "line 342", "runAnalysis-end");
}

/**
 * Disables analysis collection
 */
async function haltAnalysis() {
  post_to_debug(firstPartyDomain, "line 349", "haltAnalysis-begin");
  const uspapiData = await fetchUSPStringData();
  post_to_debug(firstPartyDomain, "line 351", "haltAnalysis-uspsFetched");
  const gppData = await fetchGPPData();
  post_to_debug(firstPartyDomain, "line 353", "haltAnalysis-gppFetched");

  let url = new URL(uspapiData.location);
  let domain = parseURL(url);
  if (uspapiData.data !== "USPAPI_FAILED") {
    logData(domain, "USPAPI", uspapiData.data);
  }
  if (uspapiData.cookies) {
    logData(domain, "COOKIES", uspapiData.cookies);
  }

  url = new URL(gppData.location); // when we remove USPAPI, we can uncomment this
  domain = parseURL(url);
  if (gppData.data !== "GPP_FAILED") {
    post_to_debug(firstPartyDomain, gppData.data, "GPP DATA");

    if (gppData.data.gppVersion == '1.0') {
      // getGPPData is where the GPP String is
      const getGPPData = await fetch_getGPPData();
      post_to_debug(firstPartyDomain, getGPPData.data, "GPP-DATA-v1");
      logData(domain, "GPP", getGPPData.data);
    } else {
      // the GPP String is just inside gppData.data
      logData(domain, "GPP", gppData.data);
    }
      post_to_debug(firstPartyDomain, gppData.data.gppVersion, "gpp version");
      logData(domain, "GPP_VERSION", gppData.data.gppVersion);
  }
  await new Promise((resolve) => setTimeout(resolve, 1000)); //new
  post_to_debug(firstPartyDomain, "line 380", "haltAnalysis-end");
}

/**
 * Runs `dom.js` to attach DOM signal
 * @param {object} details - retrieved info passed into callback
 */
function addDomSignal(details) {
  chrome.tabs.executeScript(details.tabId, {
    file: "../../content-scripts/injection/gpc-dom.js",
    frameId: details.frameId, // Supposed to solve multiple injections
    // as opposed to allFrames: true
    runAt: "document_start",
  });
}

/**
 * https://developer.chrome.com/docs/extensions/reference/history/#transition_types
 * @param {transitionType} transition
 * @returns bool
 */
function isValidTransition(transition) {
  return (
    transition === "link" ||
    transition === "typed" ||
    transition === "generated" ||
    transition === "reload" ||
    transition === "keyword" ||
    transition === "keyword_generated"
  );
}

/**
 * Returns url domain: String
 * @param {String} url
 */
function parseURL(url) {
  let urlObj = new URL(url);
  return psl.parse(urlObj.hostname).domain;
}

var analysisUserendSkeleton = () => {
  return {
    sent_gpc: false,
    gpp_version: null,
    uspapi_before_gpc: null,
    uspapi_after_gpc: null,
    usp_cookies_before_gpc: null,
    usp_cookies_after_gpc: null,
    OptanonConsent_before_gpc: null,
    OptanonConsent_after_gpc: null,
    gpp_before_gpc: null,
    gpp_after_gpc: null,
    OneTrustWPCCPAGoogleOptOut_before_gpc: null,
    OneTrustWPCCPAGoogleOptOut_after_gpc: null,
    OTGPPConsent_before_gpc: null,
    OTGPPConsent_after_gpc: null,
  };
};

var analysisDataSkeletonFirstParties = () => {
  return {
    BEFORE_GPC: {
      COOKIES: [],
      HEADERS: {},
      URLS: {},
      USPAPI: [],
      USPAPI_LOCATOR: {},
      THIRD_PARTIES: {},
      GPP: [],
    },
    AFTER_GPC: {
      COOKIES: [],
      HEADERS: {},
      URLS: {},
      USPAPI: [],
      USPAPI_LOCATOR: {},
      THIRD_PARTIES: {},
      GPP: [],
    },
    SENT_GPC: null,
    GPP_VERSION: [],
  };
};

/**
 *
 * @param {Object} data
 * Parameters - type: STRING, data: ANY
 */

function logData(domain, command, data) {
  // This is to associate data collected during analysis w/ first party domain
  domain = changingSitesOnAnalysis ? firstPartyDomain : domain;
  let gpcStatusKey = changingSitesOnAnalysis ? "AFTER_GPC" : "BEFORE_GPC";

  // If domain doesn't exist, initialize it
  if (!analysis[domain]) {
    analysis[domain] = [];
    analysis_userend[domain] = [];
    analysis_counter[domain] = 0;
  }
  if (
    domains_collected_during_analysis[domain] == undefined ||
    domains_collected_during_analysis[domain] == null
  ) {
    domains_collected_during_analysis.push(domain);
  }
  let callIndex = analysis_counter[domain];

  // Do we associate the incoming info w/ a new request or no? Which index to save at?
  if (!analysis[domain][callIndex]) {
    analysis[domain][callIndex] = analysisDataSkeletonFirstParties();
    analysis_userend[domain] = analysisUserendSkeleton();
  }

  if (changingSitesOnAnalysis) {
    analysis[domain][callIndex]["SENT_GPC"] = true;
    analysis_userend[domain]["sent_gpc"] = true;
  }

  // Let's assume that data does have a name property as a cookie should
  // NOTE: Cookies should be an array of "cookies" objects, not promises, etc.
  if (command === "COOKIES") {
    // all cookies can be logged together here, since it's a list
    analysis[domain][callIndex][gpcStatusKey]["COOKIES"] = [];
    for (let i in data) {
      analysis[domain][callIndex][gpcStatusKey]["COOKIES"].push(data[i]);
    }

    // Detailed case for summary object
    if (gpcStatusKey == "BEFORE_GPC") {
      analysis_userend[domain]["usp_cookies_before_gpc"] = null;
      analysis_userend[domain]["OptanonConsent_before_gpc"] = null;
      analysis_userend[domain]["OneTrustWPCCPAGoogleOptOut_before_gpc"] = null;
      analysis_userend[domain]["OTGPPConsent_before_gpc"] = null;

      for (let i in data) {
        if (data[i]["name"] == "OptanonConsent") {
          var match = data[i]["value"].match(/isGpcEnabled=([10])/); // returns array if matched, else returns null
          if (match) {
            analysis_userend[domain]["OptanonConsent_before_gpc"] = match[0]; // [1] would return only the capture group
          } else {
            // if cookie is found but gpc enabled tag doesn't exist
            analysis_userend[domain]["OptanonConsent_before_gpc"] = "no_gpc";
          }
        }
        else {
          if (data[i]["value"]) { // these cookies may be null, so check if there's a value
            if (data[i]["name"] == "OTGPPConsent") { // the cookie data is a gpp string
              analysis_userend[domain]["OTGPPConsent_before_gpc"] =
                data[i]["value"];
            }
            else if (data[i]["name"] == "OneTrustWPCCPAGoogleOptOut") { // this has values of either true or false, but the values come in as strings
              if (data[i]["value"] == "true") {
                analysis_userend[domain]["OneTrustWPCCPAGoogleOptOut_before_gpc"] = true;
              }
              else if (data[i]["value"] == "false") {
                analysis_userend[domain]["OneTrustWPCCPAGoogleOptOut_before_gpc"] = false;
              }
            }
            // other cookies would be US privacy
            else {
              analysis_userend[domain]["usp_cookies_before_gpc"] =
                data[i]["value"];
            }
          }
        }
      }
    }

    if (gpcStatusKey == "AFTER_GPC") {
      analysis_userend[domain]["usp_cookies_after_gpc"] = null;
      analysis_userend[domain]["OptanonConsent_after_gpc"] = null;
      analysis_userend[domain]["OneTrustWPCCPAGoogleOptOut_after_gpc"] = null;
      analysis_userend[domain]["OTGPPConsent_after_gpc"] = null;


      for (let i in data) {
        post_to_debug(firstPartyDomain, data[i]["name"], "processing cookies");
        if (data[i]["name"] == "OptanonConsent") {
          var match = data[i]["value"].match(/isGpcEnabled=([10])/); // returns array if matched, else returns null
          if (match) {
            analysis_userend[domain]["OptanonConsent_after_gpc"] = match[0]; // [1] would return only the capture group
          } else {
            // if cookie is found but gpc enabled tag doesn't exist
            analysis_userend[domain]["OptanonConsent_after_gpc"] = "no_gpc";
          }
        }
        else {
          if (data[i]["value"]) {
            if (data[i]["name"] == "OTGPPConsent") { // the cookie data is a gpp string
              analysis_userend[domain]["OTGPPConsent_after_gpc"] =
                data[i]["value"];
            }
            else if (data[i]["name"] == "OneTrustWPCCPAGoogleOptOut") { // this has values of either true or false, but the values come in as strings
              if (data[i]["value"] == "true") {
                analysis_userend[domain]["OneTrustWPCCPAGoogleOptOut_after_gpc"] = true;
              }
              else if (data[i]["value"] == "false") {
                analysis_userend[domain]["OneTrustWPCCPAGoogleOptOut_after_gpc"] = false;
              }
            }
            // other cookies would be US privacy
            else {
              analysis_userend[domain]["usp_cookies_after_gpc"] =
                data[i]["value"];
            }

          }
        }
      }
    }
  }

  if (command === "USPAPI") {
    analysis[domain][callIndex][gpcStatusKey]["USPAPI"] = [];
    analysis[domain][callIndex][gpcStatusKey]["USPAPI"].push(data);

    // Detailed case for summary object
    if (gpcStatusKey == "BEFORE_GPC") {
      analysis_userend[domain]["uspapi_before_gpc"] = data["uspString"];
    }
    if (gpcStatusKey == "AFTER_GPC") {
      analysis_userend[domain]["uspapi_after_gpc"] = data["uspString"];
    }
  }

  if (command === "GPP") {
    analysis[domain][callIndex][gpcStatusKey]["GPP"] = [];
    analysis[domain][callIndex][gpcStatusKey]["GPP"].push(data);

    // Detailed case for summary object
    if (gpcStatusKey == "BEFORE_GPC") {
      analysis_userend[domain]["gpp_before_gpc"] = data["gppString"];
    }
    if (gpcStatusKey == "AFTER_GPC") {
      analysis_userend[domain]["gpp_after_gpc"] = data["gppString"];
    }
  }

  if (command === "GPP_VERSION") {
      analysis_userend[domain]["gpp_version"] = data;
  }



  storage.set(stores.analysis, analysis_userend[domain], domain);
}

/******************************************************************************/
/******************************************************************************/
/**********                       # Listeners                        **********/
/******************************************************************************/
/******************************************************************************/

/**
 * Runs anytime the webNavigation.onCommitted listers triggers,
 * especially when making transitions from running analysis and being passive.
 * Also important in making sure all sites without anything noteworthy are logged
 * @param {Object} details
 */
function onCommittedCallback(details) {
  // https://developer.chrome.com/docs/extensions/reference/history/#transition_types
  let validTransition = isValidTransition(details.transitionType);

  if (validTransition) {
    let url = new URL(details.url);
    let domain = parseURL(url);
    last_committed_url = domain;
    post_to_debug('last_committed_url', last_committed_url);
    if (changingSitesOnAnalysis) {
      // add SENDING GPC TO FILE
      // Turn off changing sites on analysis
      // sendingGPC = true;
      logData(domain, null, null);
      addDomSignal(details);
    }
  }
}

// Used for crawling
async function runAnalysisonce(location) {
  await new Promise((resolve) => setTimeout(resolve, 7000)); //give it 7s to get ready after DOM content has loaded
  // await new Promise((resolve) => setTimeout(resolve, 35000)); // for ground truth

  let analysis_started = await storage.get(stores.settings, "ANALYSIS_STARTED");
  let url = new URL(location);
  let domain = parseURL(url);
  firstPartyDomain = domain;

  if (run_halt_counter[domain] == null) {
    run_halt_counter[domain] = [0, 0]; // [count of run Analysis, count of halt analysis]
  }

  let analysis_domains = await storage.getAllKeys(stores.analysis);
  if (!analysis_domains.includes(domain) && analysis_started === false) {
    if (run_halt_counter[domain][0] < run_halt_counter[domain][1] + 1) { // prevent from running 2x
      run_halt_counter[domain][0] += 1;
      post_to_debug(firstPartyDomain, run_halt_counter[domain], "runAnalysisOnce-running");
      runAnalysis();
      await storage.set(stores.settings, true, "ANALYSIS_STARTED");
    }
    else { post_to_debug(domain, "tried to run 2x", run_halt_counter[domain]); }

  }

  if (analysis_started === true) {
    if (run_halt_counter[domain][1] < run_halt_counter[domain][0]) {
      run_halt_counter[domain][1] += 1;
      post_to_debug(domain, run_halt_counter[domain], "runAnalysisOnce-halting");
      haltAnalysis();
      await new Promise((resolve) => setTimeout(resolve, 3000));

      if (analysis_userend[domain] != null) {
        send_sql_and_reset(domain); //send global var sql_data to db via post request
      }
      else {
        post_to_debug(domain, analysis_userend[domain], "SQL POSTING: SOMETHING WENT WRONG");
      }

    } else {
      post_to_debug(domain, "tried to run halt 2x", run_halt_counter[domain]);
      await new Promise((resolve) => setTimeout(resolve, 1500)); // give it a bit more time to finish the first halt
    }
    // always reset vars/set analysis started to false so that it won't get stuck.
    //resetting vars
    function afterUSPStringFetched() {
      changingSitesOnAnalysis = false;
      firstPartyDomain = "";
      last_committed_url = "";
      updateAnalysisCounter();
      removeGPCSignals();

      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        let tab = tabs[0];
        // Change popup icon
        chrome.browserAction.setIcon(
          {
            tabId: tab.id,
            path: "../../assets/face-icons/icon128-face-circle.png",
          },
          () => { }
        );
      });
    }
    afterUSPStringFetched();
    post_to_debug(domain, "line 732", "runAnalysisOnce-done");
    await storage.set(stores.settings, false, "ANALYSIS_STARTED");
  }
}

/**
 * Message passing listener - for collecting USPAPI call data from the window
 */
function onMessageHandler(message, sender, sendResponse) {
  if (message.msg === "SITE_LOADED") {
    post_to_debug(firstPartyDomain, "SITE_LOADED", Date.now());
    runAnalysisonce(message.location);
  }
}

/**
 * Enables all the important listeners in one place
 */
function enableListeners() {
  chrome.webNavigation.onCommitted.addListener(onCommittedCallback);
  chrome.runtime.onMessage.addListener(onMessageHandler);
  chrome.webRequest.onHeadersReceived.addListener(
    disableCSPCallback,
    disableCSPFilter,
    ["blocking", "responseHeaders"]
  );
  chrome.webRequest.onHeadersReceived.addListener(
    // listener that listens for web requests and filters for requests that have 1st/3rd parties that are on disconnect list ()
    function (details) {
      var match = details.documentUrl.match(/moz-extension:\/\//); // returns array if matched, else returns null
      if (!match && last_committed_url != "") {
        // let url = new URL(details.documentUrl);
        // let a = parseURL(url);
        let short_details_url = details.url.match(/https:\/\/([^\/]+)/g); //match with regex to get the domain
        if (short_details_url.length > 0) {
          short_details_url = short_details_url[0] //to decrease characters, get rid of https://www. or just https:// 
          if (short_details_url.includes("https://www.")) {
            short_details_url = short_details_url.replace('https://www.', '')
          }
          else if (short_details_url.includes("https://")) {
            short_details_url = short_details_url.replace('https://', '')
          }
        } //if there's more than one match, take the first
        else { short_details_url = details.url.slice(0, 50) } // if there aren't any matches, take up to the first 50 characters
        var url_classes_we_want = ['fingerprinting', 'tracking_ad', 'tracking_social', 'any_basic_tracking', 'any_social_tracking'];


        if (!(last_committed_url in urlclassification)) { // if this domain doesn't have data, init the domain
          post_to_debug('init urlclass for:', last_committed_url)
          urlclassification[last_committed_url] = { "firstParty": {}, "thirdParty": {} };
        }
        if (details.urlClassification.firstParty.length > 0) {
          for (let url_class = 0; url_class < details.urlClassification.firstParty.length; i++) {
            if (details.urlClassification.firstParty[url_class] in urlclassification[last_committed_url]['firstParty']) { // if the tracking type exists already
              if (!(urlclassification[last_committed_url]["firstParty"][details.urlClassification.firstParty[url_class]].includes(short_details_url))) {
                urlclassification[last_committed_url]["firstParty"][details.urlClassification.firstParty[url_class]].push(short_details_url);
              }
            }
            else { // if this tracking type hasn't been seen yet
              // the only details.urlClassification.firstParty[url_class] values we care about are in classes_we_want. ignore all others
              if (url_classes_we_want.includes(details.urlClassification.firstParty[url_class])) {
                urlclassification[last_committed_url]["firstParty"][details.urlClassification.firstParty[url_class]] = [short_details_url]
              }
            }
          }
        }

        if (details.urlClassification.thirdParty.length > 0) {
          for (let url_class = 0; url_class < details.urlClassification.thirdParty.length; i++) {
            // if (url_classes_we_want.includes(details.urlClassification.thirdParty[url_class])) {
            if (details.urlClassification.thirdParty[url_class] in urlclassification[last_committed_url]['thirdParty']) { // if the tracking type exists already
              if (!(urlclassification[last_committed_url]["thirdParty"][details.urlClassification.thirdParty[url_class]].includes(short_details_url))) {
                urlclassification[last_committed_url]["thirdParty"][details.urlClassification.thirdParty[url_class]].push(short_details_url);
              }
            }
            else { // if this tracking type hasn't been seen yet
              // the only details.urlClassification.thirdParty[url_class] values we care about are in url_classes_we_want. ignore all others
              if (url_classes_we_want.includes(details.urlClassification.thirdParty[url_class])) {
                urlclassification[last_committed_url]["thirdParty"][details.urlClassification.thirdParty[url_class]] = [short_details_url]
              }
            }
          }
        }
      }
    },
    {
      urls: ["*://*/*"]
    }
  );
}


function disableListeners() {
  chrome.webNavigation.onCommitted.removeListener(onCommittedCallback);
  chrome.runtime.onMessage.removeListener(onMessageHandler);
  chrome.webRequest.onHeadersReceived.removeListener(disableCSPCallback);
}

/******************************************************************************/
/******************************************************************************/
/**********           # Exportable init / halt functions             **********/
/******************************************************************************/
/******************************************************************************/

export function init() {
  // SHOW SOME WARNING TO USERS ABOUT MESSING UP THEIR DATA
  enableListeners();
}

export function halt() {
  disableListeners();
}