var express = require('express');
var mysql = require('./dbcon.js');
var bodyParser = require('body-parser');


var CryptoJS = require("crypto-js");
var app = express();
var path = require('path');
var session = require('express-session');

app.use(session({
  secret: '7C44-74D44-WppQ3877S',
  resave: true,
  saveUninitialized: true
}));

var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.use(express.static(path.join(__dirname, '/public')));
app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'handlebars');
app.set('port', process.argv[2]);

app.use('/projects', require('./projects.js'));

app.get('/',function(req,res,next){
  var context = {};
  res.render('signup',context);
});


app.get('/projects',function(req,res,next){
  var context = {};
  res.render('projects',context);
});


app.post('/add-new-user', function (req, res) {
  
  mysql.pool.query("SELECT id from users where email=" + mysql.pool.escape(req.body.user_email),
  function(err,result) {
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
      

      var ciphertext = CryptoJS.AES.encrypt(req.body.user_password, 'secret key 123').toString(); 
      //console.log(ciphertext);

        mysql.pool.query("INSERT INTO users (name, email, password) VALUES (?,?,?)",
        [req.body.full_name, req.body.user_email, ciphertext],
        function(err,result) {
          if (err) {
            console.log(JSON.stringify(err));
            res.write(JSON.stringify(err));
            res.end();
          } else {
            //pass the id of the user inserted to the home page to load projects related to user
            req.session.userId = result.insertId;
            // go straight to the projects page
            res.redirect('projects');
          }
        });
    }
  });
});





app.get('/home',function(req,res,next){
  var context = {};
  //using the session rather than passing as a variable, will preserve across multiple pages this way
  context.id = req.session.userId;
  console.log(req.session)
  res.render('home',context);
});

app.get('/login', function(req, res, next) {
  const context = { email: '', password: '' };
  res.render('login',context);
});

app.post('/user-login', function (req, res) {
  mysql.pool.query("SELECT * from users where email=" + mysql.pool.escape(req.body.user_email),
  function(err,result) {
    // for re-rendering input values if login fails
    const context = {
      email: req.body.user_email,
      password: req.body.user_password,
    };

    // if error, handle by outputting issue encountered
    if (err) {
      console.log(JSON.stringify(err));
      res.write(JSON.stringify(err));
      res.end();
    } 
    // email doesn't exist
    else if (!result[0]) {
      context.errors = 'Incorrect email or password';
      res.status(401).render('login', context);
    }
    else {
      var bytes  = CryptoJS.AES.decrypt(result[0].password, 'secret key 123');
      var decryptedPw = bytes.toString(CryptoJS.enc.Utf8);
      
      // password incorrect
      if (req.body.user_password !== decryptedPw) {
        context.errors = 'Incorrect email or password';
        res.status(401).render('login', context);
      }
      // valid credentials
      else {
        req.session.userId = result[0].id;
        res.redirect('home');
      }
    }
  });
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

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
