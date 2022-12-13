require('dotenv').config()

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const connection = require('./databse.js');

app.get('/', (req,res) => res.send('Try: /analysis') );

app.get('/status', (req, res) => res.send('Success.') );

app.get('/analysis', (req, res) => {
  connection.query(
    "SELECT * FROM analysis.entries",
    (error, results, fields) => {
      if(error) throw error;
      res.json(results);
      connection.end();
    }
  );
});

// Use port 8080 by default, unless configured differently in Google Cloud
const port = process.env.PORT || 8080;
app.listen(port, () => {
   console.log(`App is running at: http://localhost:${port}`);
});

