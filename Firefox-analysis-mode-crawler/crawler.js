const puppeteer = require('puppeteer');
const fs = require("fs");
const { parse } = require("csv-parse");

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
  });


(async () => {
    const browser = await puppeteer.launch(firefoxOptions);

    await new Promise(resolve => setTimeout(resolve, 60000));

    for (let site in sites) {
        console.log(sites[site]);
        const page = await browser.newPage();

        try {
            await page.goto(sites[site], { waitUntil: "domcontentloaded" });
            console.log("Navigated!");
            await new Promise(resolve => setTimeout(resolve, 30000));
                await page.keyboard.down('Alt');
                await page.keyboard.down('Shift');
                await page.keyboard.down('KeyA');
        
            await new Promise(resolve => setTimeout(resolve, 30000));
                await page.keyboard.down('Alt');
                await page.keyboard.down('Shift');
                await page.keyboard.down('KeyS');
            console.log("Analyzed!");
        } catch {
            console.log("Site loading went wrong")
        }

        await page.close();
        console.log("testing done");
    }
    console.log("---------------- ALL TESTING DONE ----------------")
})();