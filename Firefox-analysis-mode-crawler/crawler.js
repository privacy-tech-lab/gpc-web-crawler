const puppeteer = require('puppeteer');
const fs = require("fs");
const { parse } = require("csv-parse");

const firefoxOptions = {
    headless: false,
    product: 'firefox',
};

// Read csv file
const sites = [];
fs.createReadStream("sites.csv")
  .pipe(parse({ delimiter: ",", from_line: 2 }))
  .on("data", function (row) {
    sites.push(row[0])
  })
  .on("error", function (error) {
    console.log(error.message);
  });

// Crawling
(async () => {
    // Initiates a csv file that records each analysis time
    let writeStream = fs.createWriteStream('time.csv')
    writeStream.write(['Domain','START_TIME','END_TIME'].join(',')+ '\n', () => {})

    const browser = await puppeteer.launch(firefoxOptions);

    // Allow time to load the extension
    await new Promise(resolve => setTimeout(resolve, 60000));

    // Timestamp
    const a = new Date();
    console.log("Time: ", a.getTime());

    for (let site in sites) {
        let newLine = []
        newLine.push(sites[site])

        console.log(sites[site]);

        const start_time = new Date();
        newLine.push(start_time.getTime())
        console.log("Start time: ", start_time.getTime());

        const page = await browser.newPage();

        try {
          await page.goto(sites[site], { waitUntil: "domcontentloaded" });
          console.log("Navigated!");
        } catch {
          console.log("Site loading went wrong");
        } 
        
        await new Promise(resolve => setTimeout(resolve, 15000));
        
        /* Promise.race sets time limit for page.keyboard.down to resolve the issue that 
           page.keyboard.down is never rejected or resolved on some sites */

        // Press shift+tab to solve text box issue
        await Promise.race([page.keyboard.down('Shift'), new Promise(resolve => setTimeout(resolve, 1000))]);
        await Promise.race([page.keyboard.down('Tab'), new Promise(resolve => setTimeout(resolve, 1000))]);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await Promise.race([page.keyboard.up('Shift'), new Promise(resolve => setTimeout(resolve, 1000))]);
        await Promise.race([page.keyboard.up('Tab'), new Promise(resolve => setTimeout(resolve, 1000))]);

        // Start analysis using keyboard shortcuts
        await Promise.race([page.keyboard.down('Shift'), new Promise(resolve => setTimeout(resolve, 1000))]);
        await Promise.race([page.keyboard.down('Alt'), new Promise(resolve => setTimeout(resolve, 1000))]);
        await Promise.race([page.keyboard.down('KeyA'), new Promise(resolve => setTimeout(resolve, 1000))]);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await Promise.race([page.keyboard.up('Shift'), new Promise(resolve => setTimeout(resolve, 1000))]);
        await Promise.race([page.keyboard.up('Alt'), new Promise(resolve => setTimeout(resolve, 1000))]);
        await Promise.race([page.keyboard.up('KeyA'), new Promise(resolve => setTimeout(resolve, 1000))]);
  
        // Allow the site to load after analysis is triggered
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        await Promise.race([page.keyboard.down('Shift'), new Promise(resolve => setTimeout(resolve, 1000))]);
        await Promise.race([page.keyboard.down('Tab'), new Promise(resolve => setTimeout(resolve, 1000))]);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await Promise.race([page.keyboard.up('Shift'), new Promise(resolve => setTimeout(resolve, 1000))]);
        await Promise.race([page.keyboard.up('Tab'), new Promise(resolve => setTimeout(resolve, 1000))]);

        // Stop analysis using keyboard shortcuts
        await Promise.race([page.keyboard.down('Shift'), new Promise(resolve => setTimeout(resolve, 1000))]);
        await Promise.race([page.keyboard.down('Alt'), new Promise(resolve => setTimeout(resolve, 1000))]);
        await Promise.race([page.keyboard.down('KeyS'), new Promise(resolve => setTimeout(resolve, 1000))]);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await Promise.race([page.keyboard.up('Shift'), new Promise(resolve => setTimeout(resolve, 1000))]);
        await Promise.race([page.keyboard.up('Alt'), new Promise(resolve => setTimeout(resolve, 1000))]);
        await Promise.race([page.keyboard.up('KeyS'), new Promise(resolve => setTimeout(resolve, 1000))]);
        
        await new Promise(resolve => setTimeout(resolve, 5000));
      
        // Close the page to resolve the issue that some sites do not allow redirecting
        await page.close();
        console.log("testing done");
        const end_time = new Date();
        newLine.push(end_time.getTime())
        console.log("End time: ", end_time.getTime());

        // Write the analysis start and end time in the csv file
        writeStream.write(newLine.join(',')+ '\n', () => {})
    }
    const d = new Date();
    console.log("All time: ", d.getTime());
    console.log("---------------- ALL TESTING DONE ----------------");
    writeStream.end()

    writeStream.on('finish', () => {
        console.log('times.csv wrote')
    }).on('error', (err) => {
        console.log(err)
    })
})();
