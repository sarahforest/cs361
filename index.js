var express = require('express');
var mysql = require('./dbcon.js');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
const saltRounds = 10;

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

app.get('/',function(req,res,next){
  var context = {};
  res.render('signup',context);
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
      bcrypt.hash(req.body.user_password, saltRounds).then(function(hash) {
        mysql.pool.query("INSERT INTO users (name, email, password) VALUES (?,?,?)",
        [req.body.full_name, req.body.user_email, hash],
        function(err,result) {
          if (err) {
            console.log(JSON.stringify(err));
            res.write(JSON.stringify(err));
            res.end();
          } else {
            //pass the id of the user inserted to the home page to load projects related to user
            req.session.userId = result.insertId;
            res.redirect('home');
          }
        });
      });
    }
  });
});


app.get('/home',function(req,res,next){
  var context = {};
  //using the session rather than passing as a variable, will preserve across multiple pages this way
  context.id=req.session.userId;
  console.log(req.session)
  res.render('home',context);
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
