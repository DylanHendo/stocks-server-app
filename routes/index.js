const express = require('express');
const router = express.Router();
const authorize = require('./authorize');    // add authorize middleware

/**
 * Route for /stocks/symbols page, allowd user to filter by ?industry
 */
router.get('/stocks/symbols', function (req, res, next) {
  req.db
    .from("stocks")
    .select("name", "symbol", "industry")
    .distinct("name")
    .modify(function (queryBuilder) {
      // if no query param, display all data
      if (req.query.industry === undefined && (Object.keys(req.query).length === 0))
        return;

      // if query is not 'industry', or query is industry but no value supplied
      else if (!req.query.industry || (req.query.industry === ""))
        res.status(400).json({ "error": true, "message": "Invalid query parameter: only 'industry' is permitted" });

      // if valid industry, perform filtering on it
      else if (req.query.industry)
        queryBuilder.where("industry", "like", `%${req.query.industry}%`);
    })
    .then(rows => {
      try {
        if (rows.length == 0)
          res.status(404).json({ "error": true, "message": "Industry sector not found" });
        else
          res.status(200).json(rows);
      } catch (e) { }   // catch --> UnhandledPromiseRejectionWarning: Error [ERR_HTTP_HEADERS_SENT] (send two status codes)
    })
    .catch(err => {
      res.status(500).json({ "Error": true, "Message": "Error executing mysql query" });
    })
});


/**
 * Route for /stocks/{symbol} page, where user can filter via the {symbol}
 */
router.get('/stocks/:symbol', function (req, res, next) {
  req.db.from("stocks")
    .select("*")
    .limit(1)   // only pick top row (most recent date)
    .where("symbol", "=", req.params.symbol)
    .then(rows => {

      // if date query supplied
      if (Object.keys(req.query).length !== 0)
        return res.status(400).json({ "error": true, "message": "Date parameters only available on authenticated route /stocks/authed" })

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
      res.status(500).json({ "error": true, "message": "Error executing mysql query" });
    })
});


// Authorized price history route
router.get('/stocks/authed/:symbol', authorize, function (req, res, next) {

  let fromQuery = Object.keys(req.query)[0];
  let toQuery = Object.keys(req.query)[1];

  let fromValue = Object.values(req.query)[0];
  let toValue = Object.values(req.query)[1];

  req.db.from("stocks")
    .select("*")
    .where("symbol", "=", req.params.symbol)
    .modify(function (queryBuilder) {

      // if only symbol supplied, display most recent symbol price
      if (fromQuery === undefined && toQuery === undefined)
        queryBuilder.limit(1);

      // if just 'from' supplied, show everything from 'from' and onwards
      else if (req.query.from && (toQuery === undefined))
        queryBuilder.where("timestamp", ">", req.query.from);

      // if query params != 'from' or 'to', or no data supplied in query, 400 error
      else if ((fromQuery !== "from" || toQuery !== "to") || (fromValue === "" || toValue === ""))
        res.status(400).json({ "error": true, "message": "Parameters allowed are 'from' and 'to', example: /stocks/authed/AAL?from=2020-03-15" });

      // if both supplied, query between dates
      else if (req.query.from && req.query.to)
        queryBuilder.andWhere("timestamp", ">", req.query.from).andWhere("timestamp", "<=", req.query.to);
    })
    .then(rows => {
      try {

        // if symbol = 1-5 capital letters
        if (/^[A-Z]{1,5}$/.test(req.params.symbol)) {
          if (rows.length === 0)
            res.status(404).json({ "error": true, "message": "No entries available for query symbol for supplied date range" });

          else if (rows.length === 1)
            res.json(rows[0]);  // if only 1 object returned, remove square braces

          else
            res.json(rows);

        } else {
          res.status(400).json({ "error": true, "message": "Stock symbol incorrect format - must be 1-5 capital letters" });
        }

      } catch (e) { }
    })
    .catch(err => {
      res.status(400).json({ "error": true, "message": "Cannot parse supplied date values" });
    })
});

module.exports = router;
