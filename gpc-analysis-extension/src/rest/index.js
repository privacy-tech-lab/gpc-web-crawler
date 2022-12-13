require('dotenv').config()

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const connection = require('./databse.js');

app.get('/', (req,res) => res.send('Try: /analysis') );

app.get('/status', (req, res) => res.send('Success.') );

/* TODO: Implement POST API that allows us to post analysis result to our sql database
  My current idea is to write a function that takes values of one analysis run,
  export this function, and use it in analysis.js. After analyzing one unvisited site, 
  we call this function */


/* TODO: Implement PUP API that allows us to modify analysis result of one existing website in
  sql databse. This function should be exported and use it in analysis.js. 
  After analyzing one visited site, if the analysis result is changed,  
  we call this function to updata the analysis results */

// Use port 8080 by default, unless configured differently in Google Cloud
const port = process.env.PORT || 8080;
app.listen(port, () => {
   console.log(`App is running at: http://localhost:${port}`);
});

