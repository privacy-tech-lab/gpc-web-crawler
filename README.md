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

GPC web crawler code. The GPC Web crawler is developed and maintained by the [OptMeowt team](https://github.com/privacy-tech-lab/gpc-optmeowt#optmeowt-).

[1. Selenium OptMeowt Crawler](#1-selenium-optmeowt-crawler)  
[2. Development](#2-development)  
[3. Architecture](#3-architecture)  
[4. Thank You!](#4-thank-you)

## 1. Selenium OptMeowt Crawler

The Selenium OptMeowt Crawler is a crawler implemented using [Selenium](https://www.selenium.dev/) that analyzes sites using the [OptMeowt analysis extension](https://github.com/privacy-tech-lab/gpc-web-crawler/tree/main/gpc-analysis-extension). More details about analysis functionality can be found [here](https://github.com/privacy-tech-lab/gpc-web-crawler/edit/main/README.md#optmeowt-analysis-extension).

## 2. Development

1. Clone this repo locally or download a zipped copy and unzip it.

2. Set up the local SQL database by following the instructions in the [wiki](https://github.com/privacy-tech-lab/gpc-web-crawler/wiki/Setting-Up-Local-SQL-Database).

3. Then, run the Rest API by following the instructions in the [wiki](https://github.com/privacy-tech-lab/gpc-web-crawler/wiki/How-to-run-REST-API).

4. With the Rest API running, open a new terminal, and navigate to the root directory of selenium-optmeowt-crawler in terminal by running:

```console
cd selenium-optmeowt-crawler
```

5. Open sites.csv and enter the links you want to analyze in the first column. (Some examples included in the file)

6. Ensure Firefox Nightly is installed on your computer using this [link](https://www.mozilla.org/en-US/firefox/channel/desktop/).

7. Install the dependencies by running:

```console
npm install
```

8. To start the crawler, run:

```console
node local-crawler.js
```

9. To check the analysis results, open a browser and navigate to http://localhost:8080/analysis.

## 3. Architecture

![crawler-architecture](https://github.com/privacy-tech-lab/gpc-web-crawler/assets/40359590/71088392-1542-45d6-ae87-ffedf5339bca)

Components:

- #### Crawler Script:

  The flow of the crawler script is described in the diagram below.

![analysis-flow](https://github.com/privacy-tech-lab/gpc-web-crawler/assets/40359590/c343fcd1-58ef-4798-a225-10c4223819cf)

This script is stored and executed locally. The crawler also keeps a log of sites that cause errors. It stores these logs in a file called error-logging.json and updates this file after each error.

Types of Errors that may be logged:

1. TimeoutError: A Selenium error that is thrown when either the page has not loaded in 30 seconds or the page has not responded for 30 seconds. Timeouts are set in driver.setTimeouts.
2. HumanCheckError: A custom error that is thrown when the site has a title that we have observed means our VPN IP address is blocked or there is a human check on that site. See [Limitations/Known Issues](https://github.com/privacy-tech-lab/gpc-web-crawler#4-limitationsknown-issues) for more details.
3. InsecureCertificateError: A Selenium error that indicates that the site will not be loaded, as it has an insecure certificate.
4. WebDriverError: A Selenium error that indicates that the WebDriver has failed to execute some part of the script.
5. WebDriverError: Reached Error Page: This indicates that an error page has been reached when Selenium tried to load the site.
6. UnexpectedAlertOpenError: This indicates that a popup on the site disrupted Selenium's ability to analyze the site (such as a mandatory login)

- #### OptMeowt Analysis Extension:

  The OptMeowt Analysis extension is [packaged as an xpi file](https://github.com/privacy-tech-lab/gpc-web-crawler/wiki/Pack-Extension-in-XPI-Format) and installed on a Firefox Nightly browser by the crawler script. When a site loads, the OptMeowt Analysis extension automatically analyzes the site and sends the analysis data to the Cloud SQL database via a POST request. The analysis performed by the OptMeowt analysis extension investigates the GPC compliance of a given site using a 4-step approach:

  1. The extension checks whether the site is subject to the CCPA by looking at [Firefox's urlClassification object](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onHeadersReceived#urlclassification). Requests returned by this object are based on the Disconnect list, as described [here](https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop).
  2. The extension checks the value of the [US Privacy string](https://github.com/InteractiveAdvertisingBureau/USPrivacy/tree/master), OneTrust’s OptanonConsent cookie, and the [GPP string](https://github.com/InteractiveAdvertisingBureau/Global-Privacy-Platform/blob/main/Core/Consent%20String%20Specification.md), if any of these exist.
  3. The extension sends a GPC signal to the site.
  4. The extension rechecks the value of the US Privacy string, OptanonConsent cookie, and GPP string.

  The information collected during this process is used to determine whether the site respects GPC. Note that legal obligations to respect GPC differ by geographic location. In order for a site to be GPC compliant, the following statements should be true after the GPC signal was sent for each string or cookie that the site implemented:

  1. the third character of the US Privacy string is a Y
  2. the value of the OptanonConsent cookie is `isGpcEnabled=1`
  3. the opt out columns in the GPP string's relevant [US section](https://github.com/InteractiveAdvertisingBureau/Global-Privacy-Platform/tree/main/Sections) (i.e. SaleOptOut, TargetedAdvertisingOptOut, SharingOptOut) have a value of 1. Note that the columns and opt out requirements vary by state.

- #### Node.js Rest API:

  We use the Rest API to make GET, PUT, and POST requests to the SQL database. The Rest API is also local and is run in a separate terminal from the crawler.

- #### SQL Database:

  The SQL database is a local database that stores analysis data. Instructions to set up an SQL database can be found in the [wiki](https://github.com/privacy-tech-lab/gpc-web-crawler/wiki/Setting-Up-Local-SQL-Database). The columns of our database tables are below:
  | id | site_id | domain | sent_gpc | wellknown | uspapi_before_gpc | uspapi_after_gpc | usp_cookies_before_gpc | usp_cookies_after_gpc | OptanonConsent_before_gpc | OptanonConsent_after_gpc | gpp_before_gpc | gpp_after_gpc | urlClassification |
  | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

  The first few columns primarily pertain to identifying the site and verifying that the OptMeowt Analysis extension is working properly.

  - id: autoincrement primary key to identify the database entry
  - site_id: the id of the domain in the csv file that lists the sites to crawl. This is used for processing purposes (i.e. to identify domains that redirect to another domain) and is set by the crawler script.
  - domain: the domain name of the site
  - sent_gpc: a binary indicator of whether the OptMeowt Analysis extension sent a GPC opt out signal to the site

  The remaining columns pertain to the opt out status of a user, which is indicated by the value of the US Privacy String, OptanonConsent cookie, and GPP string. The US Privacy String can be implemented on a site via (1) the client-side JavaScript USPAPI, which returns the US Privacy String value when called, or (2) an HTTP cookie that stores its value. The OptMeowt analysis extension checks each site for both implementations of the US Privacy String by calling the USPAPI and checking all cookies. The GPP string's value is obtained via the [CMPAPI for GPP](https://github.com/InteractiveAdvertisingBureau/Global-Privacy-Platform/blob/main/Core/CMP%20API%20Specification.md).

  - wellknown: return value of fetching \<site url>/.well-known/gpc.json using [the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch). If there is json data, the value will be that data; if not, it will be null.
  - uspapi_before_gpc: return value of calling the USPAPI before a GPC opt out signal was sent
  - uspapi_after_gpc: return value of calling the USPAPI after a GPC opt out signal was sent
  - usp_cookies_before_gpc: the value of the US Privacy String in an HTTP cookie before a GPC opt out signal was sent
  - usp_cookies_after_gpc: the value of the US Privacy String in an HTTP cookie after a GPC opt out signal was sent
  - OptanonConsent_before_gpc: the isGpcEnabled string from One Trust’s OptanonConsent cookie before a GPC opt out signal was sent. The user is opted out if isGpcEnabled=1, and the user is not opted out if isGpcEnabled=0. If the cookie is present but does not have an isGpcEnabled string, we return “no_gpc”.
  - OptanonConsent_after_gpc: the isGpcEnabled string from One Trust’s OptanonConsent cookie after a GPC opt out signal was sent. The user is opted out if isGpcEnabled=1, and the user is not opted out if isGpcEnabled=0. If the cookie is present but does not have an isGpcEnabled string, we return “no_gpc”.
  - gpp_before_gpc: the value of the GPP string before a GPC opt out signal was sent
  - gpp_after_gpc: the value of the GPP string after a GPC opt out signal was sent
  - urlClassification: the return value of [Firefox's urlClassificaton object](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onHeadersReceived#urlclassification), sorted by category and filtered for the following categories: `fingerprinting`, `tracking_ad`, `tracking_social`, `any_basic_tracking`, `any_social_tracking`.

## 4. Limitations/Known Issues

Since we are using Selenium and a VPN to visit the sites we analyze, there are some limitations to the sites we can analyze.
There are 2 main types of sites that we cannot analyze due to our methodology:

1. Sites where the VPN’s IP address is blocked.

A site titled “Access Denied” that says we don’t have permission to access the site on this server is loaded instead of the real site.

2. Sites that have some kind of human check.

Some sites can detect that we are using automation tools (i.e. Selenium) and do not let us access the real site. Instead, we’re redirected to a page with some kind of captcha or puzzle. We do not try to bypass any human checks.

Since the data collected from both of these types of sites will be incorrect, we list them under HumanCheckError in error-logging.json. We have observed a few different site titles that indicate we have reached a site in one of these categories. Most of the titles occur for multiple sites, with the most common being “Just a Moment…” on a captcha from Cloudflare. We detect when our crawler visits one of these sites by matching the site title of the loaded site with a set of regular expressions that match with the known titles. Clearly, we will miss some sites in this category if we have not seen it and added the title to the set of regular expressions. We are updating the regular expressions as we see more sites like this. For more information, see [issue #51](https://github.com/privacy-tech-lab/gpc-web-crawler/issues/51).

## 5. Thank You!

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
