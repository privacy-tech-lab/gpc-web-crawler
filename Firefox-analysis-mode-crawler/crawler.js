const puppeteer = require('puppeteer');
const fs = require("fs");
const { parse } = require("csv-parse");

const firefoxOptions = {
    headless: false,
    product: 'firefox',
};

const sites = [];
fs.createReadStream("sites1.csv")
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
        } catch {
            console.log("Site loading went wrong")
        } 
        
        await new Promise(resolve => setTimeout(resolve, 10000));

        await Promise.race([page.keyboard.down('Alt'), new Promise(resolve => setTimeout(resolve, 5000))]);
        await Promise.race([page.keyboard.down('Shift'), new Promise(resolve => setTimeout(resolve, 5000))]);
        await Promise.race([page.keyboard.down('KeyA'), new Promise(resolve => setTimeout(resolve, 5000))]);

        await new Promise(resolve => setTimeout(resolve, 20000));
        
        await Promise.race([page.keyboard.down('Shift'), new Promise(resolve => setTimeout(resolve, 5000))]);
        await Promise.race([page.keyboard.down('Alt'), new Promise(resolve => setTimeout(resolve, 5000))]);
        await Promise.race([page.keyboard.down('KeyS'), new Promise(resolve => setTimeout(resolve, 5000))]);
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        await page.close();
        console.log("testing done");
    }
    console.log("---------------- ALL TESTING DONE ----------------")
})();
