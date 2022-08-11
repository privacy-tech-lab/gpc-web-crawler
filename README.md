# GPC Web Data and Scripts

Data and scripts for researching GPC on the web

## Do Not Sell link crawler

## Firefox Analysis Mode crawler
Firefox Analysis Mode crawler is a crawler for analysis functionality of [OptMeowt](https://github.com/privacy-tech-lab/gpc-optmeowt). It automatically runs [OptMeowt Analysis mode](https://github.com/privacy-tech-lab/gpc-optmeowt/blob/main/README.md#4-analysis-mode-firefox-only) on all the given sites of the [input csv file](https://github.com/privacy-tech-lab/gpc-web-data-and-scripts/blob/main/Firefox-analysis-mode-crawler/sites.csv) in Firefox. The crawler is implemented using [Puppeteer](https://pptr.dev/#?product=Puppeteer&version=v3.0.0&show=api-keyboardpresskey-options).

### Development
1. Clone this repo locally or download a zipped copy and unzip it.
2. Ensure that you have [node and npm](https://docs.npmjs.com/getting-started) installed.
3. Navigate to the root directory of Firefox Analysis Mode crawler in terminal by running:
```
cd Firefox-analysis-mode-crawler
```
4. Open sites.csv and enter the links you want to analyze in the first column. (Some examples included in the file)
5. Install the dependencies by running:
```
PUPPETEER_PRODUCT=firefox npm install
```
6. To start the crawler, run:
```
node crawler.js
```
7. The Firefox Nightly browser will be lauched. In about one minute (before page navigation starts), load the extension from source. Open the popup, click 'More' in the upper right corner to navigate to the Settings page and switch to Analysis Mode. 
6. After the terminal prints "ALL TESTING DONE", navigate to the Settings page and click 'Export Analysis Data'.

NOTE: 1. The Firefox Nightly browser should always be on the testing site once page navigation starts. Do not open or navigate to other pages. Otherwise, the crawler will not work. 2. Killing the crawler before all testing done will lead to loss of all analysis data. 
