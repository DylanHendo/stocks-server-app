const express = require('express');
const router = express.Router();
const authorize = require('./authorize');    // add authorize middleware

/**
 * Route for /stocks/symbols page, allowd user to filter by ?industry
 */
router.get('/stocks/symbols', function (req, res, next) {
  let fromQuery = Object.keys(req.query);

  req.db
    .from("stocks")
    .select("name", "symbol", "industry")
    .distinct("name")
    .modify(function (queryBuilder) {
      if (req.query.industry === undefined && (fromQuery.length === 0)) {
        return;   // if no query param, display all data
      } else if (!req.query.industry || (req.query.industry === "")) {
        res.status(400).json({
          "error": true,
          "message": "Invalid query parameter: only 'industry' is permitted"
        });
      } else if (req.query.industry) {
        queryBuilder.where("industry", "like", `%${req.query.industry}%`);
      }
    })
    .then(rows => {
      try {
        if (rows.length == 0) {
          // no data returned
          res.status(404).json({
            "error": true,
            "message": "Industry sector not found"
          });
        } else {
          res.status(200).json(rows);
        }
      } catch (ignored) { }   // catch UnhandledPromiseRejectionWarning
    })
    .catch(err => {
      res.status(500).json({ 
        "error": true, 
        "message": "error executing mysql query" 
      });
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
      if (req.query.from || req.query.to) {
        res.status(400).json({
          "error": true,
          "message": "Date parameters only available on authenticated route /stocks/authed"
        });
      } else if (/^[A-Z]{1,5}$/.test(req.params.symbol)) {
        if (rows.length == 0) {
          res.status(404).json({
            "error": true,
            "message": "No entry for symbol in stocks database"
          });
        } else {
          res.status(200).json(rows[0]);
        }
      } else {
        res.status(400).json({
          "error": true,
          "message": "Stock symbol incorrect format - must be 1-5 capital letters"
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        "error": true,
        "message": "Error executing mysql query"
      });
    })
});


// Authorized price history route
router.get('/stocks/authed/:symbol', authorize, function (req, res, next) {
  
  // object keys of query
  let fromQuery = Object.keys(req.query)[0];
  let toQuery = Object.keys(req.query)[1];
  let len = Object.keys(req.query).length;    // num of queries supplied

  // object values of query params
  let fromValue = req.query.from;
  let toValue = req.query.to;

  req.db.from("stocks")
    .select("*")
    .where("symbol", "=", req.params.symbol)
    .modify(function (queryBuilder) {
      if (!/^[A-Z]{1,5}$/.test(req.params.symbol)) {
        res.status(400).json({
          "error": true,
          "message": "Stock symbol incorrect format - must be 1-5 capital letters"
        });
      } else if (fromValue && !Date.parse(fromValue)) {
        res.status(400).json({
          "error": true,
          "message": "From date cannot be parsed by Date.parse()"
        });
      } else if (toValue && !Date.parse(toValue)) {
        res.status(400).json({
          "error": true,
          "message": "To date cannot be parsed by Date.parse()"
        });
      } else if (!fromQuery && !toQuery) {
        queryBuilder.limit(1);    // if only symbol supplied (no query params), display most recent symbol price
      } else if (fromValue && (toQuery === undefined)) {
        queryBuilder.andWhere("timestamp", ">", new Date(fromValue)); // if just 'from' supplied, show everything 'from' and onwards
      } else if (toValue && (fromQuery === 'to')) {
        queryBuilder.andWhere("timestamp", "<=", new Date(toValue)); // if just 'to' supplied, show everything prior to 'to'
      } else if ((fromValue && toValue) && len === 2) {
        queryBuilder.andWhere("timestamp", ">", new Date(fromValue)).andWhere("timestamp", "<=", new Date(toValue));
      } else {
        res.status(400).json({
          "error": true,
          "message": "Parameters allowed are 'from' and 'to', example: /stocks/authed/AAL?from=2020-03-15"
        });
      }
    })
    .then(rows => {
      try {
        if (rows.length === 0) {
          res.status(404).json({ "error": true, "message": "No entries available for query symbol for supplied date range" });
        } else if (rows.length === 1) {
          res.json(rows[0]);  // if only 1 object returned, remove square braces
        } else {
          res.json(rows);
        }
      } catch (ignored) { }
    })
    .catch(err => {
      res.status(500).json({ "error": true, "message": "Server error" });
    })
});

module.exports = router;