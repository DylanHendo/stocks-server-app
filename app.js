var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

let cors = require('cors');
let helmet = require('helmet');

const db = require('./database/db');    // database connection

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(db);    // maked db available to use
app.use(cors());
app.use(helmet());

// include knex for DB queries
const options = require("./knexfile.js");
const knex = require("knex")(options);

app.use((req, res, next) => {
  req.db = knex
  next()
})


// all valid routes other than /users will be redirected to be handled by indexRouter.
app.use('/', indexRouter);
app.use('/user', usersRouter);

// add headers using logging
logger.token('req', (req, res) => JSON.stringify(req.headers))
logger.token("res", (req, res) => {
  const headers = {}
  res.getHeaderNames().map(h => headers[h] = res.getHeader(h))
  return JSON.stringify(headers)
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
