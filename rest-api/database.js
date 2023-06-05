const mysql = require("mysql");

var config = {
  user: process.env.DB_USERNAME,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
};

// When running from localhost, get the config from .env
// else {
console.log("Running from localhost. Connecting to DB directly.");
config.host = process.env.DB_HOST;
// }

let connection = mysql.createConnection(config);

connection.connect(function (err) {
  if (err) {
    console.error("Error connecting: " + err.stack);
    return;
  }
  console.log("Connected as thread id: " + connection.threadId);
});

module.exports = connection;
