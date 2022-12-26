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

// Use port 8080 by default, unless configured differently in Google Cloud
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`App is running at: http://localhost:${port}`);
});
