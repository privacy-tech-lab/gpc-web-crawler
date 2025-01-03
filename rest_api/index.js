require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const connection = require("./database.js");

class AnalysisAPI {
  constructor() {
    this.app = express();
    this.app.use(bodyParser.json());
    this.tableName = "entries";
    this.debug = process.argv.length > 2 && process.argv[2] === "debug";
    this.port = process.env.PORT || 8080;

    this.initializeRoutes();
    if (this.debug) {
      this.initializeDebugRoutes();
    }
  }

  async checkDatabaseConnection() {
    try {
      await new Promise((resolve, reject) => {
        connection.query('SELECT 1', (err) => {
          if (err) reject(err);
          resolve();
        });
      });
      return true;
    } catch (error) {
      console.error('Database connection error:', error);
      return false;
    }
  }

  handleDatabaseQuery(query, params) {
    return new Promise((resolve, reject) => {
      connection.query(query, params, (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
    });
  }

  async handleError(res, error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  initializeRoutes() {
    // Basic routes
    this.app.get("/", (req, res) => res.send("Try: /analysis"));
    this.app.get("/status", (req, res) => res.send("Success"));

    // Health check
    this.app.get('/healthz', async (req, res) => {
      const isDatabaseConnected = await this.checkDatabaseConnection();
      if (isDatabaseConnected) {
        res.status(200).send('OK');
      } else {
        res.status(500).send('Database connection error');
      }
    });

    // Analysis routes
    this.app.get("/analysis", this.getAllEntries.bind(this));
    this.app.get("/last_input_domain_analysis", this.getLastEntry.bind(this));
    this.app.get("/null_analysis", this.getNullEntries.bind(this));
    this.app.post("/analysis", this.createEntry.bind(this));
    this.app.get("/analysis/:domain", this.getEntryByDomain.bind(this));
    this.app.put("/analysis", this.updateEntry.bind(this));
  }

  initializeDebugRoutes() {
    this.app.post("/debug", async (req, res) => {
      try {
        const results = await this.handleDatabaseQuery(
          "INSERT INTO `debug` (domain, a, b) VALUES (?,?,?)",
          [req.body.domain, req.body.a, req.body.b]
        );
        res.json(results);
      } catch (error) {
        this.handleError(res, error);
      }
    });

    this.app.get("/debug", async (req, res) => {
      try {
        const results = await this.handleDatabaseQuery("SELECT * FROM analysis.debug");
        res.json(results);
      } catch (error) {
        this.handleError(res, error);
      }
    });
  }

  async getAllEntries(req, res) {
    try {
      const results = await this.handleDatabaseQuery(
        "SELECT * FROM analysis.??",
        this.tableName
      );
      res.json(results);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getLastEntry(req, res) {
    try {
      const results = await this.handleDatabaseQuery(
        "SELECT * FROM analysis.?? WHERE id=(SELECT max(id) FROM analysis.??)",
        [this.tableName, this.tableName]
      );
      res.json(results);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getNullEntries(req, res) {
    try {
      const results = await this.handleDatabaseQuery(
        "SELECT * FROM analysis.?? WHERE site_id IS NULL",
        this.tableName
      );
      res.json(results);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async createEntry(req, res) {
    const fields = [
      'domain', 'sent_gpc', 'gpp_version', 'uspapi_before_gpc', 
      'uspapi_after_gpc', 'usp_cookies_before_gpc', 'usp_cookies_after_gpc',
      'OptanonConsent_before_gpc', 'OptanonConsent_after_gpc', 
      'gpp_before_gpc', 'gpp_after_gpc', 'urlClassification',
      'OneTrustWPCCPAGoogleOptOut_before_gpc', 'OneTrustWPCCPAGoogleOptOut_after_gpc',
      'OTGPPConsent_before_gpc', 'OTGPPConsent_after_gpc'
    ];

    try {
      console.log("posting", req.body.domain, "to analysis...");
      const values = fields.map(field => req.body[field]);
      const query = `INSERT INTO ?? (${fields.join(', ')}) VALUES (${ Array(fields.length).fill("?").join(",")})`;
      
      const results = await this.handleDatabaseQuery(query, [this.tableName, ...values]);
      res.json(results);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getEntryByDomain(req, res) {
    try {
      const results = await this.handleDatabaseQuery(
        "SELECT * FROM analysis.?? WHERE domain = ?",
        [this.tableName, req.params.domain]
      );
      res.json(results);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateEntry(req, res) {
    try {
      const results = await this.handleDatabaseQuery(
        "UPDATE ?? SET site_id = ? WHERE id = ?",
        [this.tableName, req.body.site_id, req.body.id]
      );
      res.json(results);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`App is running at: http://localhost:${this.port}`);
    });
  }
}

const api = new AnalysisAPI();
api.start();