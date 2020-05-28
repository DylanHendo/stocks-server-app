let express = require('express');
let router = express.Router();
let jwt = require('jsonwebtoken');
let bcrypt = require('bcrypt');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});


// middleware
function isRequestBodyEmpty(req, res, next) {
  const { email, password } = req.body;

  // make sure neither are empty
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete - email and password needed"
    });
    return;
  }
  next();
}


// register route
router.post('/register', isRequestBodyEmpty, function (req, res, next) {

  const { email, password } = req.body;

  const queryUsers = req.db
    .from("users")
    .select("*")
    .where("email", "=", email);

  queryUsers
    .then(users => {
      if (users.length > 0) {
        res.status(409).json({ error: true, message: "User already exists!" })
        return;
      }
    })
  // .catch(err => {
  //   console.log("error 1")
  // });

  const saltRounds = 10;
  const hash = bcrypt.hashSync(password, saltRounds);
  req.db
    .from("users")
    .insert({ email, hash })
    .then(() => {
      res.status(201).json({ success: true, message: "User created" });
    })
    .catch(err => { });   // this empty catch is used to quiet the UnhandledPromiseRejectionWarning
});



// login route
router.post('/login', isRequestBodyEmpty, function (req, res, next) {
  const { email, password } = req.body;

  const queryUsers = req.db
    .from("users")
    .select("*")
    .where("email", "=", email);

  queryUsers
    .then(users => {
      if (users.length == 0) {
        res.status(401).json({ error: true, message: "Incorrect email or password" });
        return;
      }

      const user = users[0];
      bcrypt.compare(password, user.hash)
        .then(match => {
          if (!match) {
            res.status(401).json({ success: false, message: "Incorrect email or password" });
          } else {
            const secretKey = "secret key";
            const expires_in = 60 * 60 * 24;  // 1 day
            const exp = Math.floor(Date.now() / 1000) + expires_in;
            const token = jwt.sign({ email, exp }, secretKey);
            res.status(200).json({ token, token_type: "Bearer", expires_in });
          }
        })
    })
});


module.exports = router;
