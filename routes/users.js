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
      success: false,
      message: "Request body incomplete - email and password needed"
    });
    return;
  }

  const queryUsers = req.db
    .from("users")
    .select("*")
    .where("email", "=", email);

  queryUsers
    .then(users => {
      if (users.length > 0) {
        res.status(409).json({ success: false, message: "User already exists" })
        return;
      }
    })
    .catch(err => {
      console.log("error 1")
    });

  const saltRounds = 10;
  const hash = bcrypt.hashSync(password, saltRounds);
  req.db
    .from("users")
    .insert({ email, hash })
    .then(() => {
      res.status(200).json({ success: true, message: "User created" });
    })
    .catch(err => { });   // this empty catch is used to quiet the UnhandledPromiseRejectionWarning
});


router.post('/login', function (req, res, next) {

  const email = req.body.email;
  const password = req.body.password;

  // make sure neither are empty
  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: "Request body incomplete - email and password needed"
    })
    return;
  }

  const queryUsers = req.db
    .from("users")
    .select("*")
    .where("email", "=", email);

  queryUsers
    .then(users => {
      if (users.length == 0) {
        res.status(401).json({ success: false, message: "Incorrect email or password" });
        return;
      }

      const user = users[0];
      bcrypt.compare(password, user.hash)
        .then(match => {
          if (!match) {
            res.status(401).json({ success: false, message: "Incorrect email or password" });
          } else {
            const secretKey = "secret key";
            const expiresIn = 60 * 60 * 24;  // 1 day
            const exp = Math.floor(Date.now() / 1000) + expiresIn;
            const token = jwt.sign({ email, exp }, secretKey);
            res.status(200).json({ token_type: "Bearer", token, expiresIn });
          }
        });
    })
});


module.exports = router;
