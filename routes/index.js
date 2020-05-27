let express = require('express');
let router = express.Router();


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Stocks Sever Application' });
});


// GET stocks/symbol page, filterable by industry
router.get('/stocks/symbols', function (req, res, next) {

  if (Object.keys(req.query).length === 0) {
    // if no query param supplied, show all
    req.db.from("stocks")
      .select("name", "symbol", "industry")
      .distinct("name")
      .then(rows => {
        res.json(rows);
      })
      .catch(err => {
        res.json({
          "Error": true,
          "Message": "Error executing mysql query"
        });
      })
  } else if (Object.values(req.query)[0] === "") {
    // if empty query param supplied, 400 error
    res.status(400).json({
      "error": true,
      "message": "Invalid query parameter: only 'industry' is permitted"
    });
  } else {
    // else get all stocks that match query
    req.db.from("stocks")
      .select("name", "symbol", "industry")
      .distinct("name")
      .where("industry", "like", `%${req.query.industry}%`)
      .then(rows => {
        if (rows.length == 0) {
          res.status(404).json({
            "error": true,
            "message": "Industry sector not found"
          });
        } else {
          res.json(rows);
        }
      })
      .catch(err => {
        res.json({
          "Error": true,
          "Message": "Error executing mysql query"
        });
      })
  }
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



//    ../stocks/authed/AAL                            <--   returns most recent 1 for AAL
//    ../stocks/authed/AAL?                           <--   returns most recent 1 for AAL
//    ../stocks/authed/AAL?from                       <--   returns 400 Bad Request   (Parameters allowed are from and to)
//    ../stocks/authed/AAL?from=                      <--   returns 400 Bad Request   (Parameters allowed are from and to)
//    ../stocks/authed/AAL?from=                      <--   returns 400 Bad Request   (Parameters allowed are from and to)
//    ../stocks/authed/AAL31?from=                    <--   returns 400 Bad Request   (symbol must be 1-5 capital letters)
//    ../stocks/authed/AAL?from=2020-03-19            <--   returns all AAL date from and onwards
//    ../stocks/authed/AAL?from=2020-03-19&           <--   returns all AAL date from and onwards
//    ../stocks/authed/AAL?from=2020-03-19&to         <--   returns 400 Bad Request   (Parameters allowed are from and to)
//    ../stocks/authed/AAL?from=2020-03-19&to=        <--   returns 400 Bad Request   (Parameters allowed are from and to)
//    ../stocks/authed/AAL?from=2020-03-19&to=2020    <--   returns 404 Not Found     (No entries available fordate range)

// price history page, also has date ???
router.get('/stocks/authed/:symbol', function (req, res, next) {
  req.db.from("stocks")
    .select("*")
    .whereBetween("timestamp", [req.query.from, req.query.to])
    .andWhere("symbol", "=", req.params.symbol)
    .then(rows => {

      if (/^[A-Z]{1,5}$/.test(req.params.symbol)) {
        if (rows.length == 0)
          res.status(404).json({ "error": true, "message": "No entries available for query symbol for supplied date range" });
        else
          res.json(rows);
      } else {
        res.status(400).json({
          "error": true,
          "message": "Stock symbol incorrect format - must be 1-5 capital letters"
        })
      }
    })
    .catch(err => {
      res.json({ "Error": true, "Message": "Error executing mysql query" });
    })
});

module.exports = router;
