require("dotenv").config();

const express = require("express");

const bodyParser = require("body-parser");
const connection = require("./databse.js");
const app = express();

// create application/json parser
var jsonParser = bodyParser.json();

app.get("/", (req, res) => res.send("Try: /analysis"));

app.get("/status", (req, res) => res.send("Success."));

app.get("/analysis", (req, res) => {
  connection.query(
    "SELECT * FROM analysis.entries",
    (error, results, fields) => {
      if (error) throw error;
      res.json(results);
    }
  );
});

app.post("/analysis", jsonParser, (req, res) => {
  var domain = req.body.domain;
  var dns_link = req.body.dns_link;
  var sent_gpc = req.body.sent_gpc;
  var uspapi_before_gpc = req.body.uspapi_before_gpc;
  var uspapi_after_gpc = req.body.uspapi_after_gpc;
  var uspapi_opted_out = req.body.uspapi_opted_out;
  var usp_cookies_before_gpc = req.body.usp_cookies_before_gpc;
  var usp_cookies_after_gpc = req.body.usp_cookies_after_gpc;
  var usp_cookies_opted_out = req.body.usp_cookies_opted_out;

  connection.query(
    "INSERT INTO `entries` (domain, dns_link, sent_gpc, uspapi_before_gpc, uspapi_after_gpc, uspapi_opted_out, usp_cookies_before_gpc, usp_cookies_after_gpc, usp_cookies_opted_out) VALUES (?,?,?,?,?,?,?,?,?)",
    [
      domain,
      dns_link,
      sent_gpc,
      uspapi_before_gpc,
      uspapi_after_gpc,
      uspapi_opted_out,
      usp_cookies_before_gpc,
      usp_cookies_after_gpc,
      usp_cookies_opted_out,
    ],
    (error, results, fields) => {
      if (error) throw error;
      res.json(results);
    }
  );
});

// Use port 8080 by default, unless configured differently in Google Cloud
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`App is running at: http://localhost:${port}`);
});
