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

## 1. Selenium Optmeowt Crawler

Selenium Optmeowt Crawler is a crawler for analysis functionality of [OptMeowt](https://github.com/privacy-tech-lab/gpc-web-crawler). It automatically runs [OptMeowt Analysis mode](https://github.com/privacy-tech-lab/gpc-optmeowt/tree/v4.0.1/#4-analysis-mode-firefox-only) on all the given sites of the input csv file in Firefox. The crawler is implemented using [Selenium](https://www.selenium.dev/).

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

8. To check the analysis results, open a browser and navigate to https://rest-api-dl7hml6cxq-uc.a.run.app/analysis.

- If you want to run the cloud crawler, reference the guide in the wiki.

## 3. Architecture

![architecture](https://user-images.githubusercontent.com/40359590/230727149-bbfc0b06-38a3-4ee1-8be7-a113938da224.png)

Components:

- Crawler Script:
The flow of the crawler script is described in the diagram below.
![analysis-flow](https://user-images.githubusercontent.com/40359590/230727730-73ffc349-a7b6-4407-9958-f2583f2ecb2d.png)
This script is stored and executed locally.

- OptMeowt Analysis Extension:
The OptMeowt Analysis extension is [packaged as an xpi file](https://github.com/privacy-tech-lab/gpc-web-crawler/wiki/Pack-Extension-in-XPI-Format) and installed on a Firefox Nightly browser. When a site loads, the OptMeowt Analysis extension automatically analyzes the site and sends the analysis data to the Cloud SQL database via a POST request.

- Node.js Rest API:
We use the Rest API to make GET, PUT, and POST requests to the Cloud SQL database. The Rest API is deployed to Google Cloud Run. Instructions for deployment can be found in the [wiki](https://github.com/privacy-tech-lab/gpc-web-crawler/wiki/Google-Cloud-REST-API-Deployment).

- Cloud SQL Database:
The Cloud SQL database is a Google Cloud SQL database that stores analysis data. Instructions to set up a Cloud SQL database can be found in the [wiki](https://github.com/privacy-tech-lab/gpc-web-crawler/wiki/Google-Cloud-MySQL-Configurations).

## 4. Thank You!

<p align="center"><strong>We would like to thank our financial supporters!</strong></p><br>

<p align="center">Major financial support provided by the National Science Foundation.</p>

<p align="center">
  <a href="https://nsf.gov/awardsearch/showAward?AWD_ID=2055196">
    <img class="img-fluid" src="./nsf.png" height="100px" alt="National Science Foundation Logo">
  </a>
</p>

<p align="center">Additional financial support provided by the Anil Fernando Endowment, the Alfred P. Sloan Foundation, and Wesleyan University.</p>

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
