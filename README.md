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

<br>

<p align="center">
  <a href="https://privacytechlab.org/"><img src="./gpc-logo-small-black.svg" width="200px" height="200px" alt="OptMeowt logo"></a>
</p>

# GPC Web Crawler

GPC web crawler code. The GPC Web crawler is developed and maintained by the [OptMeowt team](https://github.com/privacy-tech-lab/gpc-optmeowt#optmeowt-).

## 1. Firefox Analysis Mode crawler

Firefox Analysis Mode crawler is a crawler for analysis functionality of [OptMeowt](https://github.com/privacy-tech-lab/gpc-web-crawler). It automatically runs [OptMeowt Analysis mode](https://github.com/privacy-tech-lab/gpc-web-crawler/blob/main/README.md#4-analysis-mode-firefox-only) on all the given sites of the [input csv file](https://github.com/privacy-tech-lab/gpc-web-data-and-scripts/blob/main/Firefox-analysis-mode-crawler/sites.csv) in Firefox. The crawler is implemented using [Puppeteer](https://pptr.dev/).

## 2. Development

1. Clone this repo locally or download a zipped copy and unzip it.
2. Ensure that you have [node and npm](https://docs.npmjs.com/getting-started) installed.
3. Navigate to the root directory of Firefox Analysis Mode crawler in terminal by running:

```console
cd Firefox-analysis-mode-crawler
```

4. Open sites.csv and enter the links you want to analyze in the first column. (Some examples included in the file)
5. Install the dependencies by running:

```console
PUPPETEER_PRODUCT=firefox npm install
```

6. To start the crawler, run:

```console
node crawler.js
```

7. The Firefox Nightly browser will be lauched. In about one minute (before page navigation starts), load the extension from source. Open the popup, click 'More' in the upper right corner to navigate to the Settings page and switch to Analysis Mode.
8. After the terminal prints "ALL TESTING DONE", navigate to the Settings page and click 'Export Analysis Data'.

   NOTE: 1. The Firefox Nightly browser should always be on the testing site once page navigation starts. Do not open or navigate to other pages. Otherwise, the crawler will not work. 2. Killing the crawler before all testing done will lead to loss of all analysis data.

- Data of US Privacy String List is stored in this [Google sheet](https://docs.google.com/spreadsheets/d/1nb6-bI8d6-hDTvoj6Y3YT2HME_qVyHyVOQtY9do_Foo/edit?usp=sharing).
- Data of US API Live List is stored in this [Google sheet](https://docs.google.com/spreadsheets/d/1sdmD8Y3jb82PZ_YOREYmRez3_Wi1FUApsP1we1GV29Y/edit#gid=984860887).

## 3. Thank You!

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
