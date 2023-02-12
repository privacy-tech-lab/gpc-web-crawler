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
Selenium Optmeowt Crawler is a crawler for analysis functionality of [OptMeowt](https://github.com/privacy-tech-lab/gpc-web-crawler) deployed in Google Cloud Run. It automatically runs [OptMeowt Analysis mode](https://github.com/privacy-tech-lab/gpc-optmeowt/tree/v4.0.1/#4-analysis-mode-firefox-only) on all the given sites of the input csv file in Firefox. The crawler is implemented using [Selenium](https://www.selenium.dev/), [docker](https://www.docker.com/) and [Google Cloud](https://cloud.google.com/).

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

7. To start the cloud crawler, run:

```console
node cloud-crawler.js
```

8. To check the analysis results, open a browser and navigate to https://rest-api-dl7hml6cxq-uc.a.run.app/analysis.


- If you want to run the crawler locally, reference the guide [here](https://github.com/privacy-tech-lab/gpc-web-crawler/wiki/Running-the-Crawler-Locally).

## 2. Thank You!

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
