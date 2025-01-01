const mysql = require("mysql");

const config = {
  user: process.env.DB_USERNAME,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: 3306,
  connectionLimit: 10
};



const pool = mysql.createPool(config);

// Optional: log when connections are created
pool.on('connection', function (connection) {
  console.log('DB Connection established');
});

// Optional: log errors
pool.on('error', function (err) {
  console.error('DB Pool error:', err);
});

module.exports = pool;