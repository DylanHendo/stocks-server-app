const jwt = require("jsonwebtoken");

/**
 * Middleware function to perform authorization for /stokcs/authed/{symbol} route
 * @param {*} req Request object
 * @param {*} res Response object
 * @param {*} next Next function
 */
function authorize(req, res, next) {
  const authorization = req.headers.authorization;
  let token = null;

  // retrieve token
  if (authorization && authorization.split(" ").length === 2) {
    token = authorization.split(" ")[1];

    // verify
    try {
      const decoded = jwt.verify(token, process.env.KEY);
      if (decoded.exp > Date.now()) {
        res.status(403).json({ error: true, message: "Token has expired" });
        return;
      }
      next();
    } catch (error) {
      res.status(403).json({ error: true, message: "Invalid token" });
    }

  } else {
    res.status(403).json({ error: true, message: "Authorization header not found" });
  }
}


module.exports = authorize;