require("dotenv").config();

const express = require("express");

const bodyParser = require("body-parser");
const connection = require("./database.js");
const app = express();
var debug = false;

const args = process.argv;
if (args.length > 2 && args[2] == "debug") {
  console.log("using debugging version!");
  debug = true;
}

async function rest(table) {
  // create application/json parser
  var jsonParser = bodyParser.json();

  // set table name
  var table_name = "entries";

  app.get("/", (req, res) => res.send("Try: /" + table));

  app.get("/status", (req, res) => res.send("Success."));

  app.get("/" + table, (req, res) => {
    connection.query(
      "SELECT * FROM analysis.??",
      table_name,
      (error, results, fields) => {
        if (error) throw error;
        res.json(results);
      }
    );
  });
  app.get("/last_input_domain_" + table, (req, res) => {
    connection.query(
      "SELECT * FROM analysis.?? WHERE id=(SELECT max(id) FROM analysis.??)",
      [table_name, table_name],
      (error, results, fields) => {
        if (error) throw error;
        res.json(results);
      }
    );
  });

  app.get("/null_" + table, (req, res) => {
    connection.query(
      "SELECT * FROM analysis.?? WHERE site_id IS NULL",
      table_name,
      (error, results, fields) => {
        if (error) throw error;
        res.json(results);
      }
    );
  });

  app.post("/" + table, jsonParser, (req, res) => {
    var domain = req.body.domain;
    var dns_link = req.body.dns_link;
    var sent_gpc = req.body.sent_gpc;
    var uspapi_before_gpc = req.body.uspapi_before_gpc;
    var uspapi_after_gpc = req.body.uspapi_after_gpc;
    var usp_cookies_before_gpc = req.body.usp_cookies_before_gpc;
    var usp_cookies_after_gpc = req.body.usp_cookies_after_gpc;
    var OptanonConsent_before_gpc = req.body.OptanonConsent_before_gpc;
    var OptanonConsent_after_gpc = req.body.OptanonConsent_after_gpc;
    console.log("posting", domain, "to analysis...");
    connection.query(
      // "INSERT INTO ?? (domain, dns_link, sent_gpc, uspapi_before_gpc, uspapi_after_gpc, usp_cookies_before_gpc, usp_cookies_after_gpc) VALUES (?,?,?,?,?,?,?)",
      "INSERT INTO ?? (domain, dns_link, sent_gpc, uspapi_before_gpc, uspapi_after_gpc, usp_cookies_before_gpc, usp_cookies_after_gpc, OptanonConsent_before_gpc, OptanonConsent_after_gpc) VALUES (?,?,?,?,?,?,?,?,?)",
      [
        table_name,
        domain,
        dns_link,
        sent_gpc,
        uspapi_before_gpc,
        uspapi_after_gpc,
        usp_cookies_before_gpc,
        usp_cookies_after_gpc,
        OptanonConsent_before_gpc,
        OptanonConsent_after_gpc,
      ],
      (error, results, fields) => {
        if (error) throw error;
        res.json(results);
      }
    );
  });

  app.route("/" + table + "/:domain").get((req, res, next) => {
    connection.query(
      "SELECT * FROM analysis.?? WHERE domain = ?",
      [table_name, req.params.domain],
      (error, results, fields) => {
        if (error) throw error;
        res.json(results);
      }
    );
  });

  app.put("/" + table, jsonParser, (req, res) => {
    connection.query(
      "UPDATE ?? SET site_id = ? WHERE id = ? ",
      [table_name, req.body.site_id, req.body.id],
      (error, results, fields) => {
        if (error) throw error;
        res.json(results);
      }
    );
  });
  if (debug == true) {
    app.post("/debug", jsonParser, (req, res) => {
      // console.log("posting", req.body.domain, "to debug...");
      connection.query(
        "INSERT INTO `debug` (domain, a, b) VALUES (?,?,?)",
        [req.body.domain, req.body.a, req.body.b],
        (error, results, fields) => {
          if (error) throw error;
          res.json(results);
        }
      );
    });

    // adding debug table paths
    app.get("/debug", (req, res) => {
      connection.query(
        "SELECT * FROM analysis.debug",
        (error, results, fields) => {
          if (error) throw error;
          res.json(results);
        }
      );
    });
  }
}

rest("analysis");

// Use port 8080 by default, unless configured differently in Google Cloud
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`App is running at: http://localhost:${port}`);
});
