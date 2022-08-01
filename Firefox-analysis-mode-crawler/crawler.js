const puppeteer = require('puppeteer');
const fs = require("fs");
const { parse } = require("csv-parse");

/**
 * To have Puppeteer fetch a Firefox binary for you, first run:
 *
 *  PUPPETEER_PRODUCT=firefox npm install
 *
 * To get additional logging about which browser binary is executed,
 * run this example as:
 *
 *   DEBUG=puppeteer:launcher NODE_PATH=../ node examples/cross-browser.js
 *
 * You can set a custom binary with the `executablePath` launcher option.
 *
 *
 */

const firefoxOptions = {
    headless: false,
    product: 'firefox',
};

const sites = [];
fs.createReadStream("sites.csv")
  .pipe(parse({ delimiter: ",", from_line: 2 }))
  .on("data", function (row) {
    sites.push(row[0])
  })
  .on("error", function (error) {
    console.log(error.message);
  })
  .on("end", function () {
    console.log("finished");
  });

(async () => {
    const browser = await puppeteer.launch(firefoxOptions);

    const page = await browser.newPage();

    await new Promise(resolve => setTimeout(resolve, 60000));

    for (let site in sites) {
         console.log(sites[site]);

        try {
            await page.goto(sites[site]);
            console.log("Navigated!");
        } catch {
            console.log("Site loading went wrong")
        }

        await new Promise(resolve => setTimeout(resolve, 30000));
            await page.keyboard.down('Alt');
            await page.keyboard.down('Shift');
            await page.keyboard.down('KeyA');
            await page.keyboard.up('Alt');
            await page.keyboard.up('Shift');
            await page.keyboard.up('KeyA');

        await new Promise(resolve => setTimeout(resolve, 30000));
            await page.keyboard.down('Alt');
            await page.keyboard.down('Shift');
            await page.keyboard.down('KeyS');
            await page.keyboard.up('Alt');
            await page.keyboard.up('Shift');
            await page.keyboard.up('KeyS');

        console.log("testing done");

        // try {
        //     // await Promise.all([
        //     //     waitForNetworkIdle(page)
        //     //   ]);
        //     await page.waitForNetworkIdle({idleTime: 5000})
        //     console.log("Time is up");
        // } catch {
        //     console.log("wait for screwed up");
        // }

        // await page.keyboard.down('Alt+Shift+KeyA');
        // await page.keyboard.up('Alt+Shift+KeyA');
        // await page.waitForNetworkIdle(5000);
        // await page.keyboard.down('Alt+Shift+KeyS');
        // await page.keyboard.up('Alt+Shift+KeyS');
    }
    console.log("---------------- ALL TESTING DONE ----------------")
})();