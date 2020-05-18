var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});


router.post('/user/register', function (req, res, next) {

});


router.post('/user/login', function (req, res, next) {

});


module.exports = router;
