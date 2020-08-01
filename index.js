// Require necessary packages/files:

var express = require('express');
var bodyParser = require('body-parser');
var CryptoJS = require("crypto-js");
var crypto = require("crypto");
var nodemailer = require('nodemailer');
var path = require('path');
var session = require('express-session');

const config = require('./config.js');
var mysql = require('./dbcon.js');
const AuthService = require('./auth-service.js');

// Set up the server:

var app = express();

app.use(session({
  secret: config.appSecret,
  resave: true,
  saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'handlebars');
app.set('port', process.argv[2]);

var handlebars = require('express-handlebars').create({
  helpers: {
    ifCond: function(v1, operator, v2, options) {
          switch (operator) {
          case '==':
              return (v1 == v2) ? options.fn(this) : options.inverse(this);
          case '===':
              return (v1 === v2) ? options.fn(this) : options.inverse(this);
          case '!=':
              return (v1 != v2) ? options.fn(this) : options.inverse(this);
          case '!==':
              return (v1 !== v2) ? options.fn(this) : options.inverse(this);
          case '<':
              return (v1 < v2) ? options.fn(this) : options.inverse(this);
          case '<=':
              return (v1 <= v2) ? options.fn(this) : options.inverse(this);
          case '>':
              return (v1 > v2) ? options.fn(this) : options.inverse(this);
          case '>=':
              return (v1 >= v2) ? options.fn(this) : options.inverse(this);
          case '&&':
              return (v1 && v2) ? options.fn(this) : options.inverse(this);
          case '||':
              return (v1 || v2) ? options.fn(this) : options.inverse(this);
          default:
              return options.inverse(this);
      }
    },
  },
  defaultLayout:'main'
});

app.engine('handlebars', handlebars.engine);

// Set up routes:

app.use(express.static(path.join(__dirname, '/public')));

app.use('/auth', require('./auth-router.js'));

app.use('/projects', require('./projects.js'));

app.use('/project', require('./project.js'));

app.use('/task', require('./task.js'));

app.use('/mytasks', require('./myTasks.js'));

app.use('/theirTasks', require('./theirTasks.js'));

app.get('/', function(req, res, next) {
  var context = {};
  res.render('signup', context);
});

app.get('/login', function(req, res, next) {
  const context = { email: '', password: '' };
  res.render('login', context);
});

app.get('/forgot', function(req, res, next) {
  const context = { email: ''};
  res.render('forgot', context);
});


function getToken(res, user, complete) {
  crypto.randomBytes(20, function(err, buf) {
    var token = buf.toString('hex');
    user.resetPasswordToken = token;
    complete();
  });
}

function checkIfUserExists(email, res, user, complete) {
  mysql.pool.query(
    "SELECT id from users where email=" + mysql.pool.escape(email),
    function(err, result) {
      // if error, handle by outputting issue encountered
      if (err) {
        console.log(JSON.stringify(err));
        res.write(JSON.stringify(err));
        res.end();
      }
      // if id exists in the db, user already exists, don't proceed with sign up
      else if (!result[0] || !result[0].id) {
        console.log("Doesnt exist")
        res.render('forgot', {
          errors: 'Email address doesn\'t exist.',
        });
      }
      else {
        user.email = email;
        user.id = result[0].id;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        complete();
      }
    })
}

function updateUserTokens(res, user, complete) {
  var sql = "UPDATE users SET token = ?, tokenExpiration = ? WHERE id = ?";
  var inserts = [user.resetPasswordToken, user.resetPasswordExpires, user.id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }
            complete();
        })
}

app.post('/pass/reset', function(req, res, next) {
  var callbackCount = 0;
  var user = {};

  getToken(res, user, complete);
  function complete(){
      callbackCount++;
      if(callbackCount == 1){
          checkIfUserExists(req.body.user_email, res, user, complete);
      } else if (callbackCount == 2) {
        updateUserTokens(res, user, complete);
      } else if (callbackCount == 3) {

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'cs361osu@gmail.com',
            pass: 'superlongstringtest123'
          }
        });

        const mailOptions = {
          from: 'admin@ec3taskmanagement.com',
          to: user.email,
          subject: 'Password Reset Requested',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + user.resetPasswordToken + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };

        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
          console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
        res.render('forgot', {
          info: 'An e-mail has been sent to ' + user.email + ' with further instructions.',
        });
      }
  }
});


app.get('/reset/:token', function(req, res) {

  var sql = "SELECT id, tokenExpiration from users WHERE token = ?";
  var inserts = [req.params.token];
        sql = mysql.pool.query(sql, inserts, function(error, result, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }
            else if (!result[0] || !result[0].id) {

              res.render('reset', {
                errors: 'Password reset token is invalid.',
                link: 'http://' + req.headers.host + '/forgot'
              });
            }
            else if (Date.now() > result[0].tokenExpiration) {
                res.render('reset', {
                  errors: 'Password reset token is expired.',
                  link: 'http://' + req.headers.host + '/forgot'
                });
            }
            else {
              var context = {
                id: result[0].id,
                token: Date.now(),
                showForm: true
              };
              res.render('reset', context)
            }
        })
});

app.post('/reset-password', function(req, res, next) {

  var ciphertext = CryptoJS.AES.encrypt(req.body.password, config.cryptoSecret).toString();

  var sql = "UPDATE users SET password = ?, tokenExpiration = ? WHERE id = ?";
  var inserts = [ciphertext, req.body.token, req.body.id];

        sql = mysql.pool.query(sql, inserts, function(error, result, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }

            res.render('reset', {
              info: 'Password reset successfully.',
              link: 'http://' + req.headers.host + '/login'
            });
          })
});

app.post('/add-new-user', function(req, res) {
  mysql.pool.query(
    "SELECT id from users where email=" + mysql.pool.escape(req.body.user_email),
    function(err, result) {
      // if error, handle by outputting issue encountered
      if (err) {
        console.log(JSON.stringify(err));
        res.write(JSON.stringify(err));
        res.end();
      }
      // if id exists in the db, user already exists, don't proceed with sign up
      else if (result[0] && result[0].id) {
        res.render('signup', {
          errors: 'Email address already exists. Please login to your existing account or use a different email.',
        });
      }
      // we have a new user password we need to hash then add to the db
      else {
        var ciphertext = CryptoJS.AES.encrypt(req.body.user_password, config.cryptoSecret).toString();
        // console.log(ciphertext);
        mysql.pool.query(
          "INSERT INTO users (name, email, password) VALUES (?,?,?)",
          [req.body.full_name, req.body.user_email, ciphertext],
          function(err, result) {
            if (err) {
              console.log(JSON.stringify(err));
              res.write(JSON.stringify(err));
              res.end();
            } else {
              const payload = { userId: result.insertId };
              // store auth token in session
              req.session.authToken = AuthService.createJwt(payload);
              res.redirect('/projects');
            }
          }
        );
      }
    }
  );
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

// Start the server:

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
