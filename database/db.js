const mysql = require('mysql');

// connec to db containting stocks info
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASS,
  database: 'webcomputing'
});

connection.connect(function (err) {
  if (err) throw err;
});

// middleware
module.exports = (req, res, next) => {
  req.db = connection;
  next();
}