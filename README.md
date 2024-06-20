<p align="center">
  <a href="https://github.com/privacy-tech-lab/gpc-web-crawler/releases"><img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/privacy-tech-lab/gpc-web-crawler"></a>
  <a href="https://github.com/privacy-tech-lab/gpc-web-crawler/releases"><img alt="GitHub Release Date" src="https://img.shields.io/github/release-date/privacy-tech-lab/gpc-web-crawler"></a>
  <a href="https://github.com/privacy-tech-lab/gpc-web-crawler/commits/main"><img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/privacy-tech-lab/gpc-web-crawler"></a>
  <a href="https://github.com/privacy-tech-lab/gpc-web-crawler/issues"><img alt="GitHub issues" src="https://img.shields.io/github/issues-raw/privacy-tech-lab/gpc-web-crawler"></a>
  <a href="https://github.com/privacy-tech-lab/gpc-web-crawler/issues?q=is%3Aissue+is%3Aclosed"><img alt="GitHub closed issues" src="https://img.shields.io/github/issues-closed-raw/privacy-tech-lab/gpc-web-crawler"></a>
  <a href="https://github.com/privacy-tech-lab/gpc-web-crawler/blob/main/LICENSE.md"><img alt="GitHub" src="https://img.shields.io/github/license/privacy-tech-lab/gpc-web-crawler"></a>
  <a href="https://github.com/privacy-tech-lab/gpc-web-crawler/watchers"><img alt="GitHub watchers" src="https://img.shields.io/github/watchers/privacy-tech-lab/gpc-web-crawler?style=social"></a>
  <a href="https://github.com/privacy-tech-lab/gpc-web-crawler/stargazers"><img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/privacy-tech-lab/gpc-web-crawler?style=social"></a>
  <a href="https://github.com/privacy-tech-lab/gpc-web-crawler/network/members"><img alt="GitHub forks" src="https://img.shields.io/github/forks/privacy-tech-lab/gpc-web-crawler?style=social"></a>
  <a href="https://github.com/sponsors/privacy-tech-lab"><img alt="GitHub sponsors" src="https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86"></a>
</p>

<p align="center">
  <a href="https://privacytechlab.org/"><img src="./gpc-logo-small-black.svg" width="200px" height="200px" alt="OptMeowt logo"></a>
</p>

# GPC Web Crawler

GPC web crawler code. The GPC Web crawler is developed and maintained by the [OptMeowt team](https://github.com/privacy-tech-lab/gpc-optmeowt#optmeowt-). In addition to this readme, check out our [wiki](https://github.com/privacy-tech-lab/gpc-web-crawler/wiki) as well.

[1. Selenium OptMeowt Crawler](#1-selenium-optmeowt-crawler)  
[2. Development](#2-development)  
[3. Architecture](#3-architecture)  
[4. Components](#4-components)  
[5. Limitations/Known Issues](#5-limitationsknown-issues)  
[6. Other Resources](#6-other-resources)
[7. Thank You](#7-thank-you)

## 1. Selenium OptMeowt Crawler

The GPC Web Crawler is a crawler implemented using [Selenium](https://www.selenium.dev/) that analyzes sites using the [OptMeowt analysis extension](https://github.com/privacy-tech-lab/gpc-web-crawler/tree/main/gpc-analysis-extension). More details about the analysis functionality can be found [here](https://github.com/privacy-tech-lab/gpc-web-crawler/edit/main/README.md#optmeowt-analysis-extension).

## 2. Development

1. Clone this repo locally or download a zipped copy and unzip it.

2. Set up the local SQL database by following the instructions in the [wiki](https://github.com/privacy-tech-lab/gpc-web-crawler/wiki/Setting-Up-Local-SQL-Database).

3. Then, run the Rest API by following the instructions in the [wiki](https://github.com/privacy-tech-lab/gpc-web-crawler/wiki/How-to-run-REST-API).

4. With the Rest API running, open a new terminal, and navigate to the root directory of selenium-optmeowt-crawler in terminal by running:

   ```console
   cd selenium-optmeowt-crawler
   ```

5. Open sites.csv and enter the links you want to analyze in the first column. (Some examples are included in the file.)

6. Ensure Firefox Nightly is installed on your computer using this [link](https://www.mozilla.org/en-US/firefox/channel/desktop/). (If you receive the following error when completing step 8, update Firefox Nightly to the latest version: `WebDriverError: Process unexpectedly closed with status 0`.)

7. Install the dependencies by running:

   ```console
   npm install
   ```

8. To start the crawler, run:

   ```console
   node local-crawler.js
   ```

9. To check the analysis results, open a browser and navigate to <http://localhost:8080/analysis>.

10. If you modify the analysis extension, you should test it to make sure it still works properly. Some guidelines can be found in the [wiki](https://github.com/privacy-tech-lab/gpc-web-crawler/wiki/Testing-the-OptMeowt-Analysis-Extension).

## 3. Architecture

Here is an overview of the GPC Web Crawler architecture:

![crawler-architecture](https://github.com/privacy-tech-lab/gpc-web-crawler/assets/40359590/71088392-1542-45d6-ae87-ffedf5339bca)

## 4. Components

The GPC Web Crawler consists of various components:

### 4.1 Crawler Script

The flow of the crawler script is described in the diagram below.

![analysis-flow](https://github.com/privacy-tech-lab/gpc-web-crawler/assets/40359590/6261650d-1cc3-4a8e-b6e2-da682e4c1251)

This script is stored and executed locally. The crawler also keeps a log of sites that cause errors. It stores these logs in a file called error-logging.json and updates this file after each error.

#### Types of Errors that May Be Logged

1. TimeoutError: A Selenium error that is thrown when either the page has not loaded in 30 seconds or the page has not responded for 30 seconds. Timeouts are set in driver.setTimeouts.
2. HumanCheckError: A custom error that is thrown when the site has a title that we have observed means our VPN IP address is blocked or there is a human check on that site. See [Limitations/Known Issues](https://github.com/privacy-tech-lab/gpc-web-crawler#4-limitationsknown-issues) for more details.
3. InsecureCertificateError: A Selenium error that indicates that the site will not be loaded, as it has an insecure certificate.
4. WebDriverError: A Selenium error that indicates that the WebDriver has failed to execute some part of the script.
5. WebDriverError: Reached Error Page: This indicates that an error page has been reached when Selenium tried to load the site.
6. UnexpectedAlertOpenError: This indicates that a popup on the site disrupted Selenium's ability to analyze the site (such as a mandatory login).

### 4.2 OptMeowt Analysis Extension

The OptMeowt Analysis extension is [packaged as an xpi file](https://github.com/privacy-tech-lab/gpc-web-crawler/wiki/Pack-Extension-in-XPI-Format) and installed on a Firefox Nightly browser by the crawler script. When a site loads, the OptMeowt Analysis extension automatically analyzes the site and sends the analysis data to the Cloud SQL database via a POST request. The analysis performed by the OptMeowt analysis extension investigates the GPC compliance of a given site using a 4-step approach:

1. The extension checks whether the site is subject to the CCPA by looking at [Firefox's urlClassification object](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onHeadersReceived#urlclassification). Requests returned by this object are based on the Disconnect list, as described [here](https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop).
2. The extension checks the value of the [US Privacy string](https://github.com/InteractiveAdvertisingBureau/USPrivacy/tree/master), the [GPP string](https://github.com/InteractiveAdvertisingBureau/Global-Privacy-Platform/blob/main/Core/Consent%20String%20Specification.md), and OneTrust's OptanonConsent, OneTrustWPCCPAGoogleOptOut, OTGPPConsent cookies if any of these exist.
3. The extension sends a GPC signal to the site.
4. The extension rechecks the value of the US Privacy string, OneTrust cookies, and GPP string.

The information collected during this process is used to determine whether the site respects GPC. Note that legal obligations to respect GPC differ by geographic location. In order for a site to be GPC compliant, the following statements should be true after the GPC signal was sent for each string or cookie that the site implemented:

1. the third character of the US Privacy string is a `Y`
2. the value of the OptanonConsent cookie is `isGpcEnabled=1`
3. the opt out columns in the GPP string's relevant [US section](https://github.com/InteractiveAdvertisingBureau/Global-Privacy-Platform/tree/main/Sections) (i.e. `SaleOptOut`, `TargetedAdvertisingOptOut`, `SharingOptOut`) have a value of `1`; Note that the columns and opt out requirements vary by state
4. the value of the OneTrustWPCCPAGoogleOptOut cookie is `true`

### 4.3 Node.js Rest API

We use the Rest API to make GET, PUT, and POST requests to the SQL database. The Rest API is also local and is run in a separate terminal from the crawler.

### 4.4 SQL Database

The SQL database is a local database that stores analysis data. Instructions to set up an SQL database can be found in the [wiki](https://github.com/privacy-tech-lab/gpc-web-crawler/wiki/Setting-Up-Local-SQL-Database). The columns of our database tables are below:
| id | site_id | domain | sent_gpc | uspapi_before_gpc | uspapi_after_gpc | usp_cookies_before_gpc | usp_cookies_after_gpc | OptanonConsent_before_gpc | OptanonConsent_after_gpc | gpp_before_gpc | gpp_after_gpc | gpp_version |urlClassification | OneTrustWPCCPAGoogleOptOut_before_gpc | OneTrustWPCCPAGoogleOptOut_after_gpc | OTGPPConsent_before_gpc | OTGPPConsent_after_gpc |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

The first few columns primarily pertain to identifying the site and verifying that the OptMeowt Analysis extension is working properly.

- id: autoincrement primary key to identify the database entry
- site_id: the id of the domain in the csv file that lists the sites to crawl. This is used for processing purposes (i.e. to identify domains that redirect to another domain) and is set by the crawler script.
- domain: the domain name of the site
- sent_gpc: a binary indicator of whether the OptMeowt Analysis extension sent a GPC opt out signal to the site

The remaining columns pertain to the opt out status of a user, which is indicated by the value of the US Privacy String, OptanonConsent cookie, and GPP string. The US Privacy String can be implemented on a site via (1) the client-side JavaScript USPAPI, which returns the US Privacy String value when called, or (2) an HTTP cookie that stores its value. The OptMeowt analysis extension checks each site for both implementations of the US Privacy String by calling the USPAPI and checking all cookies. The GPP string's value is obtained via the [CMPAPI for GPP](https://github.com/InteractiveAdvertisingBureau/Global-Privacy-Platform/blob/main/Core/CMP%20API%20Specification.md).

- uspapi_before_gpc: return value of calling the USPAPI before a GPC opt out signal was sent
- uspapi_after_gpc: return value of calling the USPAPI after a GPC opt out signal was sent
- usp_cookies_before_gpc: the value of the US Privacy String in an HTTP cookie before a GPC opt out signal was sent
- usp_cookies_after_gpc: the value of the US Privacy String in an HTTP cookie after a GPC opt out signal was sent
- OptanonConsent_before_gpc: the isGpcEnabled string from One Trust's OptanonConsent cookie before a GPC opt out signal was sent. The user is opted out if isGpcEnabled=1, and the user is not opted out if isGpcEnabled=0. If the cookie is present but does not have an isGpcEnabled string, we return "no_gpc".
- OptanonConsent_after_gpc: the isGpcEnabled string from One Trust's OptanonConsent cookie after a GPC opt out signal was sent. The user is opted out if isGpcEnabled=1, and the user is not opted out if isGpcEnabled=0. If the cookie is present but does not have an isGpcEnabled string, we return "no_gpc".
- gpp_before_gpc: the value of the GPP string before a GPC opt out signal was sent
- gpp_after_gpc: the value of the GPP string after a GPC opt out signal was sent
- gpp_version: the version of CMP API that obtains the GPP string (ie. v1.0 has a getGPPdata command while v1.1 remove the getGPPdata command and remove the return values in favor of callback functions)
- urlClassification: the return value of [Firefox's urlClassificaton object](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onHeadersReceived#urlclassification), sorted by category and filtered for the following categories: `fingerprinting`, `tracking_ad`, `tracking_social`, `any_basic_tracking`, `any_social_tracking`.
- OneTrustWPCCPAGoogleOptOut_before_gpc: the value of the OneTrustWPCCPAGoogleOptOut cookie before a GPC signal was sent. This cookie is described by OneTrust [here](https://my.onetrust.com/articles/en_US/Knowledge/UUID-2dc719a8-4be5-8d16-1dc8-c7b4147b88e0).
- OneTrustWPCCPAGoogleOptOut_after_gpc: the value of the OneTrustWPCCPAGoogleOptOut cookie after a GPC signal was sent. This cookie is described by OneTrust [here](https://my.onetrust.com/articles/en_US/Knowledge/UUID-2dc719a8-4be5-8d16-1dc8-c7b4147b88e0).
- OTGPPConsent_before_gpc: the value of the OTGPPConsent cookie before a GPC signal was sent. This cookie is described by OneTrust [here](https://my.onetrust.com/articles/en_US/Knowledge/UUID-2dc719a8-4be5-8d16-1dc8-c7b4147b88e0).
- OTGPPConsent_after_gpc: the value of the OTGPPConsent cookie after a GPC signal was sent. This cookie is described by OneTrust [here](https://my.onetrust.com/articles/en_US/Knowledge/UUID-2dc719a8-4be5-8d16-1dc8-c7b4147b88e0).

## 5. Limitations/Known Issues

Since we are using Selenium and a VPN to visit the sites we analyze, there are some limitations to the sites we can analyze.
There are 2 main types of sites that we cannot analyze due to our methodology:

1. Sites where the VPN's IP address is blocked.

   A site titled "Access Denied" that says we do not have permission to access the site on this server is loaded instead of the real site.

2. Sites that have some kind of human check.

   Some sites can detect that we are using automation tools (i.e. Selenium) and do not let us access the real site. Instead, we're redirected to a page with some kind of captcha or puzzle. We do not try to bypass any human checks.

   Since the data collected from both of these types of sites will be incorrect, we list them under HumanCheckError in error-logging.json. We have observed a few different site titles that indicate we have reached a site in one of these categories. Most of the titles occur for multiple sites, with the most common being "Just a Moment…" on a captcha from Cloudflare. We detect when our crawler visits one of these sites by matching the site title of the loaded site with a set of regular expressions that match with the known titles. Clearly, we will miss some sites in this category if we have not seen it and added the title to the set of regular expressions. We are updating the regular expressions as we see more sites like this. For more information, see [issue #51](https://github.com/privacy-tech-lab/gpc-web-crawler/issues/51).

3. Sites that block script injection.

   For instance flickr.com, blocks script injection and will not successfully be analyzed. In the debugging table, on the first attempt, the last message will be runAnalysis-fetching, and on the second, the extension logs SQL POSTING: SOMETHING WENT WRONG.

4. Sites that redirect between multiple domains throughout analysis.

   For instance <https://spothero.com/> and <https://parkingpanda.com/> are now one entity but still can use both domains. In the debugging table, you will see multiple debugging entries under each domain. Because we store analysis data by domain, the data will be incomplete and will not be added to the database.

## 6. Other Resources

### 6.1 Python Library for GPP String Decoding

GPP strings must be decoded. The IAB provides a JavaScript library [here](https://www.npmjs.com/package/@iabgpp/cmpapi) and an [interactive html decoder](https://iabgpp.com/#) to do this. To integrate decoding with our colab notebooks, we rewrote the library in Python. The library can be found [here](https://drive.google.com/drive/folders/1b542jvVWm4ny9h_12fplL_VRvBfEVxFX?usp=sharing).

### 6.2 .well-known/gpc.json Python Script

We collect .well-known/gpc.json data after the whole crawl finishes with a separate Python script.
Steps: 
1. This script should be run using a California VPN after all eight crawl batches are completed.
2. Ensure the lock screen setting is as for the usual crawl 
3. Start the script using `python3 well-known-collection.py`. 
Running this script requires 3 input files: `full-crawl-set.csv`, which is in the repo, `redo-original-sites.csv`, and `redo-sites.csv`. The second two files are not found in the repo and should be created for that crawl using [step 5](https://github.com/privacy-tech-lab/gpc-web-crawler/wiki/For-lab-members-performing-crawls:#saving-crawl-data-when-crawling-our-8-batch-dataset). As explained in `well-known-collection.py`, the output is a csv called `well-known-data.csv` with 3 columns: Site URL, request status, json data as well as an error json file called `well-known-errors.json` that logs all the errors. To run this script on a csv file of sites without accounting for redo sites, comment all lines between line 27 and line 40 except for line line 34.

#### Purpose of the well.known Python Script

Analyze the full crawl set with the redo sites replaced by using the full set of sites and the sites that we have redone (which replaced the original sites with redo domains).

- Output

  1. If successful, a csv with 3 columns: Site URL, request status, json data
  2. If not, an error json file: logs all the errors (printing the reason & 500 chars of the request text)
     Examples of an error:
     - "Expecting value: line 1 column 1(char 0)": the status was 200(of sites exists and loaded) but did not find a json
     - Reason: sites send al incorrect links to a generic error page instead of not serving the page

- Code Rundown

  1. First, the file read in the full site set, redo original sites and redo sites
     - sites_df.index(redo_original_sites[idx]): get the index of the site we want to change
     - sites_list[x] = redo_new_sites[idx]: replace the site with the new site
  2. r = requests.get(sites*df[site_idx] + '/.well-known/gpc.json', timeout=35): The code run with a timeout of 35 seconds (to stay consistent with crawler timeouts)
     (i) checks if there will be a json data, then logging all 3 columns (\_site, status, and json data*)
     (ii) if there is no json data, it will just log the **status and site**
     (iii) if r.json is not json data(), the "Expecting value: line 1 column 1 (char 0)", mean that the status .." error will appear in the error logging and the error will log site and status
     (iv) if the request.get does not finish in 35 seconds, it will store errors and only log **site**

- Important Code Documentation

  - "file1.write(sites_df[site_idx] + "," + str(r.status_code) + ',"' + str(r.json()) + '"\n')" : writing data to a file with 3 columns (site, status and json data)
  - "errors[sites_df[site_idx] = str(e)" -> store errors with original links
  - "with open("well-known-errors.json", "w") as outfile: json.dump(errors, outfile)" -> convert and write JSON object as containing errors to file

## 7. Thank You!

<p align="center"><strong>We would like to thank our financial supporters!</strong></p><br>

<p align="center">Major financial support provided by the National Science Foundation.</p>

<p align="center">
  <a href="https://nsf.gov/awardsearch/showAward?AWD_ID=2055196">
    <img class="img-fluid" src="./nsf.png" height="100px" alt="National Science Foundation Logo">
  </a>
</p>

<p align="center">Additional financial support provided by the Alfred P. Sloan Foundation, Wesleyan University, and the Anil Fernando Endowment.</p>

<p align="center">
  <a href="https://sloan.org/grant-detail/9631">
    <img class="img-fluid" src="./sloan_logo.jpg" height="70px" alt="Sloan Foundation Logo">
  </a>
  <a href="https://www.wesleyan.edu/mathcs/cs/index.html">
    <img class="img-fluid" src="./wesleyan_shield.png" height="70px" alt="Wesleyan University Logo">
  </a>
</p>

<p align="center">Conclusions reached or positions taken are our own and not necessarily those of our financial supporters, its trustees, officers, or staff.</p>

##

<p align="center">
  <a href="https://privacytechlab.org/"><img src="./plt_logo.png" width="200px" height="200px" alt="privacy-tech-lab logo"></a>
<p>
