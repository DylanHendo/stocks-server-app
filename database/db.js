const mysql = require('mysql');

// connec to db containting stocks info
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Cab230!',
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