require("dotenv").config();

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./databse.js");

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

// Preliminary implementation of post. This is for the
// database described in the tutorial here:
// https://billmartin.io/blog/how-to-build-and-deploy-a-nodejs-api-on-google-cloud
// TODO: change variable/database names so that
// they match Jocelyn's database setup

// app.post("/warehouses/save", (req, res) => {
//   var identification = req.query.id;
//   var name = req.query.name;
//   var zip = req.query.zip;
//   connection.query(
//     "INSERT INTO `acme`.`warehouses`() VALUES (?,?,?)",
//     [identification, name, zip],
//     (error, results, fields) => {
//       if (error) throw error;
//       res.json(results);
//     }
//   );
// });
app.post("/analysis", (req, res) => {
  var domain = req.query.domain;
  var dns_link = req.query.dns_link;
  var sent_gpc = req.query.sent_gpc;
  var uspapi_before_gpc = req.query.uspapi_before_gpc;
  var uspapi_after_gpc = req.query.uspapi_after_gpc;
  var uspapi_opted_out = req.query.uspapi_opted_out;
  var usp_cookies_before_gpc = req.query.usp_cookies_before_gpc;
  var usp_cookies_after_gpc = req.query.usp_cookies_after_gpc;
  var usp_cookies_opted_out = req.query.usp_cookies_opted_out;

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
