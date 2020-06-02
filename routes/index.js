const express = require('express');
const router = express.Router();
const authorize = require('./authorize');    // add authorize middleware

/**
 * Route for /stocks/symbols page, allowd user to filter by ?industry
 */
router.get('/stocks/symbols', function (req, res, next) {

  let fromQuery = Object.keys(req.query)

  req.db
    .from("stocks")
    .select("name", "symbol", "industry")
    .distinct("name")
    .modify(function (queryBuilder) {
      // if no query param, display all data
      if (req.query.industry === undefined && (fromQuery.length === 0))
        return;
      else if (!req.query.industry || (req.query.industry === ""))
        res.status(400).json({ "error": true, "message": "Invalid query parameter: only 'industry' is permitted" });
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
    .limit(1)
    .where("symbol", "=", req.params.symbol)
    .then(rows => {
      if (req.query.from || req.query.to)
        res.status(400).json({ "error": true, "message": "Date parameters only available on authenticated route /stocks/authed" })
      else if (/^[A-Z]{1,5}$/.test(req.params.symbol)) {
        // if symbol is 1-5 capital letters and in the DB, show rows, else, appropriate error
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

  // object keys of query
  let fromQuery = Object.keys(req.query)[0];
  let toQuery = Object.keys(req.query)[1];

  // object values of query
  let fromValue = Object.values(req.query)[0];
  let toValue = Object.values(req.query)[1];

  req.db.from("stocks")
    .select("*")
    .where("symbol", "=", req.params.symbol)
    .modify(function (queryBuilder) {

      // if symbol not 1-5 capital letters, return 400
      if (!/^[A-Z]{1,5}$/.test(req.params.symbol))
        res.status(400).json({ "error": true, "message": "Stock symbol incorrect format - must be 1-5 capital letters" });

      // if 'from' or 'to' value supplied, and that value can't be parsed as a date, return 400
      else if (fromValue && !Date.parse(fromValue))
        res.status(400).json({ "error": true, "message": "From date cannot be parsed by Date.parse()" });
      else if (toValue && !Date.parse(toValue))
        res.status(400).json({ "error": true, "message": "To date cannot be parsed by Date.parse()" });

      // if only symbol supplied, display most recent symbol price
      else if (fromQuery === undefined && toQuery === undefined)
        queryBuilder.limit(1);

      // if just 'from' supplied, show everything from 'from' and onwards
      else if (req.query.from && (toQuery === undefined))
        queryBuilder.where("timestamp", ">", new Date(fromValue));

      // if query params != 'from' or 'to', or no data supplied in query, 400 error
      else if ((!req.query.from || !req.query.to) || (fromValue === "" || toValue === ""))
        res.status(400).json({ "error": true, "message": "Parameters allowed are 'from' and 'to', example: /stocks/authed/AAL?from=2020-03-15" });

      else if (req.query.from && req.query.to)
        queryBuilder.andWhere("timestamp", ">", new Date(fromValue)).andWhere("timestamp", "<=", new Date(toValue));
    })
    .then(rows => {
      try {
        if (rows.length === 0)
          res.status(404).json({ "error": true, "message": "No entries available for query symbol for supplied date range" });
        else if (rows.length === 1)
          res.json(rows[0]);  // if only 1 object returned, remove square braces
        else
          res.json(rows);
      } catch (e) { }
    })
    .catch(err => {
      res.status(500).json({ "error": true, "message": "Server error" });
    })
});

module.exports = router;
