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

    // Allow time to load the extension
    await new Promise(resolve => setTimeout(resolve, 60000));

    for (let site in sites) {
        console.log(sites[site]);
        const page = await browser.newPage();

        try {
          await page.goto(sites[site], { waitUntil: "domcontentloaded" });
            console.log("Navigated!");
        } catch {
            console.log("Site loading went wrong");
        } 
      
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Reloading removes popup ad
        try {
          await page.reload({ waitUntil: "domcontentloaded" });
          console.log("Reloaded");
        } catch {
          console.log("Not reloaded");
        } 

        await new Promise(resolve => setTimeout(resolve, 5000));
        
        /* One site has popup ad only when you load it the second time,
          reload again to remove ad */
        try {
          await page.reload({ waitUntil: "domcontentloaded" });
          console.log("Reloaded");
        } catch {
          console.log("Not reloaded");
        } 
        await new Promise(resolve => setTimeout(resolve, 5000));

        /* Some sites put the crawler in a text box. 
          Clicking on a non-hyperlink element solves the problem. */
        try {
          await page.waitForSelector('h1');
          await page.click('h1');
          console.log('Clicked')
        } catch {
          console.log("Not clicked")
        }

        await new Promise(resolve => setTimeout(resolve, 5000));

        /* Promise.race sets time limit for page.keyboard.down to resolve the issue
           that page.keyboard.down is never rejected or resolved on some sites */
        await Promise.race([page.keyboard.down('Alt'), new Promise(resolve => setTimeout(resolve, 5000))]);
        await Promise.race([page.keyboard.down('Shift'), new Promise(resolve => setTimeout(resolve, 5000))]);
        await Promise.race([page.keyboard.down('KeyA'), new Promise(resolve => setTimeout(resolve, 5000))]);
  
        // Allow the site to load after analysis is triggered
        await new Promise(resolve => setTimeout(resolve, 30000));

        await Promise.race([page.keyboard.down('Shift'), new Promise(resolve => setTimeout(resolve, 5000))]);
        await Promise.race([page.keyboard.down('Alt'), new Promise(resolve => setTimeout(resolve, 5000))]);
        await Promise.race([page.keyboard.down('KeyS'), new Promise(resolve => setTimeout(resolve, 5000))]);
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        await page.close();
        console.log("testing done");
    }
    console.log("---------------- ALL TESTING DONE ----------------")
})();

