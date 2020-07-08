const express = require('express');
const mysql = require('./dbcon.js');
const AuthService = require('./auth-service.js');

const AuthRouter = express.Router();
const jsonBodyParser = express.json();

AuthRouter
  .post('/login', jsonBodyParser, function(req, res) {
    const { user_email, user_password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";
    const values = user_email;
    mysql.pool.query(sql, values, (error, result) => {
      // stores user inputs for re-rendering values if login fails
      const context = {
        email: user_email,
        password: user_password,
      };

      // if error, handle by outputting issue encountered
      if (error) {
        console.log(JSON.stringify(error));
        res.write(JSON.stringify(error));
        res.end();
      }

      // email doesn't exist
      else if (!result[0]) {
        context.errors = 'Incorrect email or password';
        res.status(401).render('login', context);
      }

      // password incorrect
      else if (!AuthService.comparePasswords(user_password, result[0].password)) {
        context.errors = 'Incorrect email or password';
        res.status(401).render('login', context);
      }

      // valid email and password
      else {
        const payload = { userId: result[0].id };
        // store auth token in session
        req.session.authToken = AuthService.createJwt(payload);
        res.redirect('/projects');
      }
    });
  })
  .post('/logout', function(req, res) {
    // clear auth token
    req.session.authToken = null;
    res.redirect('/');
  });

module.exports = AuthRouter;