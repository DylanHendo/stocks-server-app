let express = require('express');
let router = express.Router();


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
      res.json({
        "Error": false,
        "Message": "Success",
        "stocks": rows
      });

      // if symbols, numbers entered, return 404: "Industry sector not found"
      // it can be an empty param ??

      // if (/^[a-z]+$/i.test(req.query.industry)) {
      //   res.json({
      //     "Error": false,
      //     "Message": "Success",
      //     "stocks": rows
      //   });
      // } else {
      //   res.status(400).json({
      //     "Error": true,
      //     "Message": "Invalid query parameter"
      //   })
      //   return;
      // }

    })
    .catch(err => {
      res.json({
        "Error": true,
        "Message": "Error executing mysql query"
      });
    })
});


// stocks page (most recent stock), filtered by symbol
router.get('/stocks/:symbol', function (req, res, next) {
  req.db.from("stocks")
    .select("*")
    .limit(1)   // only pick top row (most recent date)
    .where("symbol", "=", req.params.symbol)
    .then(rows => {

      // if symbol is 1-5 capital letters and in the DB, show rows, else, appropriate error
      if (/^[A-Z]{1,5}$/.test(req.params.symbol)) {
        if (rows.length == 0)
          res.status(404).json({ "Error": true, "Message": "No entry for symbol in stocks database" });
        else
          res.status(200).json({ "Error": false, "Message": "Success", "stocks": rows });
      } else {
        res.status(400).json({ "Error": true, "Message": "Symobl must be 1-5 capital letters" })
      }
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
