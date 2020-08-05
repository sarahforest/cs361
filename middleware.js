const mysql = require('./dbcon.js');
const AuthService = require('./auth-service.js');

// if there's valid auth token in session, store user in req
function requireAuth(req, res, next) {
  if (!req.session.authToken) {
    return res.redirect(`/login?fromUrl=${req.originalUrl}`);
  }
  try {
    const payload = AuthService.verifyJwt(req.session.authToken);
    // get user data with id
    const sql = "SELECT id, name, email FROM users WHERE id = ?";
    const values = payload.userId;  // user id stored in the jwt
    mysql.pool.query(sql, values, (error, result) => {
      // if error, handle by outputting issue encountered
      if (error) {
        console.log(JSON.stringify(error));
        res.write(JSON.stringify(error));
        res.end();
      }

      // id doesn't exist
      else if (!result[0]) {
        return res.redirect(`/login?fromUrl=${req.originalUrl}`);
      }

      // user id exists, store user in req
      else {
        req.user = result[0];
        next();
      }
    });
  }
  catch(error) {
    return res.redirect(`/login?fromUrl=${req.originalUrl}`);
  }
}

module.exports = { requireAuth };
