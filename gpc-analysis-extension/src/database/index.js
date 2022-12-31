require('dotenv').config()

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const connection = require('./databse.js');

app.get('/', (req,res) => res.send('Try: /analysis') );

app.get('/status', (req, res) => res.send('Success.') );
app.get("/analysis", (req, res) => {
  connection.query(
    "SELECT * FROM analysis.entries",
    (error, results, fields) => {
      if (error) throw error;
      res.json(results);
    }
  );
});
/* TODO: Implement POST API that allows us to post analysis result to our sql database
  My current idea is to write a function that takes values of one analysis run,
  we call this function */
domain = "nba.com"
dns_link = "true"
sent_gpc = "true"
uspapi_before_gpc = "1YYN"
uspapi_after_gpc = "1YYN"
uspapi_opted_out = "true"
usp_cookies_before_gpc = "null"
usp_cookies_after_gpc = "1YYN"
usp_cookies_opted_out = "true"
connection.query(
  "INSERT INTO `entries` (domain, dns_link, sent_gpc, uspapi_before_gpc, uspapi_after_gpc, uspapi_opted_out, usp_cookies_before_gpc, usp_cookies_after_gpc, usp_cookies_opted_out) VALUES (?,?,?,?,?,?,?,?,?)", 
  [domain, dns_link, sent_gpc, uspapi_before_gpc, uspapi_after_gpc, uspapi_opted_out, usp_cookies_before_gpc, usp_cookies_after_gpc, usp_cookies_opted_out],
  function (error, results, fields) {
    if (error) throw error;
  }
);


/* TODO: Implement PUT API that allows us to modify analysis result of one existing website in
  sql databse. This function should be exported and use it in analysis.js. 
  After analyzing one visited site, if the analysis result is changed,  
  we call this function to updata the analysis results */

// Use port 8080 by default, unless configured differently in Google Cloud
const port = process.env.PORT || 8080;
app.listen(port, () => {
   console.log(`App is running at: http://localhost:${port}`);
});

