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

Selenium OptMeowt Crawler is a crawler for analysis functionality of [OptMeowt](https://github.com/privacy-tech-lab/gpc-web-crawler). It automatically runs [OptMeowt Analysis mode](https://github.com/privacy-tech-lab/gpc-optmeowt/tree/v4.0.1/#4-analysis-mode-firefox-only) on all the given sites of the input csv file in Firefox. The crawler is implemented using [Selenium](https://www.selenium.dev/).

## 2. Development

1. Clone this repo locally or download a zipped copy and unzip it.
2. Navigate to the root directory of selenium-optmeowt-crawler in terminal by running:

```console
cd selenium-optmeowt-crawler
```

3. Open sites.csv and enter the links you want to analyze in the first column. (Some examples included in the file)
4. Install the dependencies by running:

```console
npm install
```

7. To start the crawler, run:

```console
node local-crawler.js
```

8. To check the analysis results, open a browser and navigate to http://localhost:8080/analysis.

## 3. Architecture

![crawler-architecture](https://github.com/privacy-tech-lab/gpc-web-crawler/assets/40359590/71088392-1542-45d6-ae87-ffedf5339bca)


Components:

- Crawler Script:
  The flow of the crawler script is described in the diagram below.
  ![analysis-flow](https://user-images.githubusercontent.com/40359590/230727730-73ffc349-a7b6-4407-9958-f2583f2ecb2d.png)
  This script is stored and executed locally.

- OptMeowt Analysis Extension:
  The OptMeowt Analysis extension is [packaged as an xpi file](https://github.com/privacy-tech-lab/gpc-web-crawler/wiki/Pack-Extension-in-XPI-Format) and installed on a Firefox Nightly browser by the crawler script. When a site loads, the OptMeowt Analysis extension automatically analyzes the site and sends the analysis data to the Cloud SQL database via a POST request. The analysis of a site is performed by the extension as follows:

  1. Check if a site has a Do Not Sell link
  2. Check the site's US Privacy String to determine a user's current opt out status
  3. Send a GPC opt out signal to opt out
  4. Check the site's US Privacy String again to determine the user's current opt out status

- Node.js Rest API:
  We use the Rest API to make GET, PUT, and POST requests to the SQL database. The Rest API is also local and is run in a separate terminal from the crawler. 

- SQL Database:
  The SQL database is a local database that stores analysis data. Instructions to set up an SQL database can be found in the [wiki](https://github.com/privacy-tech-lab/gpc-web-crawler/wiki/Setting-Up-Local-SQL-Database). The columns of our database tables are below:
  | id | site_id | domain | dns_link | sent_gpc | uspapi_before_gpc | uspapi_after_gpc | uspapi_opted_out | usp_cookies_before_gpc | usp_cookies_after_gpc | usp_cookies_opted_out |
  | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

  The first few columns primarily pertain to identifying the site and verifying that the OptMeowt Analysis extension is working properly.

  - id: autoincrement primary key to identify the database entry
  - site_id: the id of the domain in the csv file that lists the sites to crawl. This is used for processing purposes (i.e. to identify domains that redirect to another domain) and is set by the crawler script.
  - domain: the domain name of the site
  - dns_link: a binary indictor of whether the site has a Do Not Sell link
  - sent_gpc: a binary indicator of whether the OptMeowt Analysis extension sent a GPC opt out signal to the site

  The remaining columns pertain to the opt out status of a user, which is indicated by the value of the US Privacy String. The US Privacy String can be implemented on a site via (1) the client-side JavaScript USPAPI, which returns the US Privacy String value when called, or (2) an HTTP cookie that stores its value. The OptMeowt analysis extension checks each site for both implementations of the US Privacy String by calling the USPAPI and checking all cookies.

  - uspapi_before_gpc: return value of calling the USPAPI before a GPC opt out signal was sent
  - uspapi_after_gpc: return value of calling the USPAPI after a GPC opt out signal were sent
  - uspapi_opted_out: a binary indicator of whether the site respected the GPC opt out signal based on the change in the USPAPI return value
  - usp_cookies_before_gpc: the value of the US Privacy String in an HTTP cookie before a GPC opt out signal was sent
  - usp_cookies_before_gpc: the value of the US Privacy String in an HTTP cookie after a GPC opt out signal was sent
  - usp_cookies_opted_out: a binary indicator of whether the site respected the GPC opt out signal based on the change in the US Privacy String in an HTTP cookie

## 4. Thank You!

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

<p align="center"><a href="https://builtwith.com/">BuiltWith</a> provided us with a free Pro account.</p>

<p align="center">Conclusions reached or positions taken are our own and not necessarily those of our financial supporters, its trustees, officers, or staff.</p>

##

<p align="center">
  <a href="https://privacytechlab.org/"><img src="./plt_logo.png" width="200px" height="200px" alt="privacy-tech-lab logo"></a>
<p>
