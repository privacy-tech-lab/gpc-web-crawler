require("dotenv").config();

const express = require("express");

const bodyParser = require("body-parser");
const connection = require("./database.js");
const app = express();
// create application/json parser
var jsonParser = bodyParser.json();

async function rest(table_name) {

  app.get("/", (req, res) => res.send("Try: /" + process.env.DB_DATABASE));

  app.get("/status", (req, res) => res.send("Success."));

  app.get("/" + process.env.DB_DATABASE, (req, res) => {
    connection.query(
      "SELECT * FROM ??.??",
      [process.env.DB_DATABASE,
        table_name,],
      (error, results, fields) => {
        if (error) throw error;
        res.json(results);
      }
    );
  });

  app.get("/last_input_domain_" + process.env.DB_DATABASE, (req, res) => {
    connection.query(
      "SELECT * FROM analysis.?? WHERE id=(SELECT max(id) FROM analysis.??)",
      [table_name, table_name],
      (error, results, fields) => {
        if (error) throw error;
        res.json(results);
      }
    );
  });

  app.get("/null_" + process.env.DB_DATABASE, (req, res) => {
    connection.query(
      "SELECT * FROM analysis.?? WHERE site_id IS NULL",
      table_name,
      (error, results, fields) => {
        if (error) throw error;
        res.json(results);
      }
    );
  });

  app.post("/" + process.env.DB_DATABASE, jsonParser, (req, res) => {
    console.log("posting", req.body.domain, "to analysis...");
    connection.query(
      "INSERT INTO ?? (domain, dns_link, sent_gpc, uspapi_before_gpc, uspapi_after_gpc, usp_cookies_before_gpc, usp_cookies_after_gpc, OptanonConsent_before_gpc, OptanonConsent_after_gpc) VALUES (?,?,?,?,?,?,?,?,?)",
      [
        table_name,
        req.body.domain,
        req.body.dns_link,
        req.body.sent_gpc,
        req.body.uspapi_before_gpc,
        req.body.uspapi_after_gpc,
        req.body.usp_cookies_before_gpc,
        req.body.usp_cookies_after_gpc,
        req.body.OptanonConsent_before_gpc,
        req.body.OptanonConsent_after_gpc,
      ],
      (error, results, fields) => {
        if (error) throw error;
        res.json(results);
      }
    );
  });

  app.route("/" + process.env.DB_DATABASE + "/:domain").get((req, res, next) => {
    connection.query(
      "SELECT * FROM analysis.?? WHERE domain = ?",
      [table_name, req.params.domain],
      (error, results, fields) => {
        if (error) throw error;
        res.json(results);
      }
    );
  });

  app.put("/" + process.env.DB_DATABASE, jsonParser, (req, res) => {
    connection.query(
      "UPDATE ?? SET site_id = ? WHERE id = ? ",
      [table_name, req.body.site_id, req.body.id],
      (error, results, fields) => {
        if (error) throw error;
        res.json(results);
      }
    );
  });
}

async function debug_rest(table_name) {

  app.post("/debug", jsonParser, (req, res) => {
    // console.log("posting", req.body.domain, "to debug...");
    connection.query(
      "INSERT INTO ?? (domain, a, b) VALUES (?,?,?)",
      [table_name, req.body.domain, req.body.a, req.body.b],
      (error, results, fields) => {
        if (error) throw error;
        res.json(results);
      }
    );
  });

  // adding debug paths
  app.get("/debug", (req, res) => {
    connection.query(
      "SELECT * FROM ??.??",
      [process.env.DB_DATABASE,
        table_name],
      (error, results, fields) => {
        if (error) throw error;
        res.json(results);
      }
    );
  });
}




async function pp_rest(table_name) {
  // create application/json parser
  var jsonParser = bodyParser.json();

  app.get("/", (req, res) => res.send("Try: /" + table_name));

  app.get("/status", (req, res) => res.send("Success."));

  app.get("/" + table_name, (req, res) => {
    connection.query(
      "SELECT * FROM ??.??",
      [process.env.DB_DATABASE,
        table_name,],
      (error, results, fields) => {
        if (error) throw error;
        res.json(results);
      }
    );
  });

  //// to do: cut requestUrl off at 4000 char. https://urbanbellemag.com was over that limit
  app.post("/" + table_name, jsonParser, (req, res) => {
    console.log("posting", req.body.rootUrl, "to", table_name);
    connection.query(
      "INSERT INTO ?? (timestamp_, permission, rootUrl, snippet, requestUrl, typ, index_, parentCompany, watchlistHash, extraDetail, cookie) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
      [
        table_name,
        req.body.timestamp,
        req.body.permission,
        req.body.rootUrl,
        req.body.snippet,
        req.body.requestUrl,
        req.body.typ,
        req.body.index,
        req.body.parentCompany,
        req.body.watchlistHash,
        req.body.extraDetail,
        req.body.cookie,
      ],
      (error, results, fields) => {
        if (error) throw error;
        res.json(results);
      }
    );
  });
}

const args = process.argv;
if (args.length > 2 && args[2] == "privacy-pioneer") {
  console.log("using privacy-pioneer version!");
  pp_rest('pp_analysis')
}
else if (args.length > 2 && args[2] == "debug") {
  console.log("using debugging version!");
  debug_rest('debug')
  rest("entries");
}
else { rest("entries"); }


// Use port 8080 by default, unless configured differently in Google Cloud
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`App is running at: http://localhost:${port}`);
});
