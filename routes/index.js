let express = require('express');
let router = express.Router();


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Stocks Sever Application' });
});


//  .../stocks/symbols             <-- should return all 495 stocks
//  .../stocks/symbols?            <-- should return all 495 stocks
//  .../stocks/symbols?industry    <-- should return error ("Invalid query parameter: only 'industry' is permitted")
//  .../stocks/symbols?industry=   <-- should return error ("Invalid query parameter: only 'industry' is permitted")

// GET stocks/symbol page, filterable by industry
router.get('/stocks/symbols', function (req, res, next) {
  let queryIndustry = req.params.industry;

  req.db.from("stocks")
    .select("name", "symbol", "industry")
    .distinct("name")       // only get one copy of each select (dates not included)
    // .where("industry", "like", `%${industry}%`)   // alow string querying
    .where({ industry: queryIndustry })
    .then(rows => {

      if (rows.length == 0)
        res.status(404).json({ "error": true, "message": "Industry sector not found" });
      else
        res.json(rows);

      // if (/^[a-z]+$/i.test(req.query.industry)) {
      //   res.json(rows);
      // } else {
      //   res.status(400).json({
      //     "error": true,
      //     "message": "Invalid query parameter"
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
          res.status(404).json({ "error": true, "message": "No entry for symbol in stocks database" });
        else
          res.status(200).json(rows[0]);
      } else {
        res.status(400).json({ "error": true, "message": "Stock symbol incorrect format - must be 1-5 capital letters" })
      }
    })
    .catch(err => {
      res.json({ "error": true, "message": "Error executing mysql query" });
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
