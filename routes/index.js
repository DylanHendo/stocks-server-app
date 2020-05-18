var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Stocks Sever Application' });
});


// GET stocks/symbol page, filterable by industry
router.get('/stocks/symbols', function (req, res, next) {
  req.db.from("stocks")
    .select("name", "symbol", "industry")
    .distinct("name")       // only get one copy of each select (dates not included)
    .where("industry", "like", `%${req.query.industry}%`)   // alow string querying
    .then(rows => {
      res.json({ "Error": false, "Message": "Success", "stocks": rows });
    })
    .catch(err => {
      res.json({ "Error": true, "Message": "Error executing mysql query" });
    })
});


// stocks page (most recent stock), filtered by symbol
router.get('/stocks/:symbol', function (req, res, next) {
  req.db.from("stocks")
    .select("*")
    .limit(1)   // only pick top row (most recent date)
    .where("symbol", "=", req.params.symbol)
    .then(rows => {
      res.json({ "Error": false, "Message": "Success", "stocks": rows });
    })
    .catch(err => {
      res.json({ "Error": true, "Message": "Error executing mysql query" });
    })
});


//    /symbol?from=......&to=......
//    select * from stocks where symbol='A' and timestamp between '2020-03-19' and '2020-03-24';

// price history page, also has date ???
router.get('/stocks/authed/:symbol', function (req, res, next) {
  req.db.from("stocks")
    .select("*")
    .whereBetween("timestamp", [req.query.from, req.query.to])
    .andWhere("symbol", "=", req.params.symbol)
    .then(rows => {
      res.json({ "Error": false, "Message": "Success", "stocks": rows });
    })
    .catch(err => {
      res.json({ "Error": true, "Message": "Error executing mysql query" });
    })
});

module.exports = router;
