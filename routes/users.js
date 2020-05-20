let express = require('express');
let router = express.Router();
let jwt = require('jsonwebtoken');
let bcrypt = require('bcrypt');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});


router.post('/register', function (req, res, next) {

  const email = req.body.email;
  const password = req.body.password;

  // make sure neither are empty
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete - email and password needed"
    })
    return;
  }




});


router.post('/login', function (req, res, next) {

  const email = req.body.email;
  const password = req.body.password;

  // make sure neither are empty
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete - email and password needed"
    })
    return;
  }



});


module.exports = router;
