const express = require('express');
const mysql = require('./dbcon.js');
const { requireAuth } = require('./middleware.js');
const Utils = require('./utils.js');
var CryptoJS = require('crypto-js');
var bodyParser = require('body-parser');
const config = require('./config.js');
const router = express.Router();

router.get('/', requireAuth, function(req, res) {
    const context = {};
    context.userId = req.user.id;
    context.name = req.user.name;
    context.email = req.user.email;
    //console.log(req.user);
    res.render('profile', context);
});

router.post('/edit', requireAuth, function(req, res) {
    //console.log('Edit profile called', req.body)
    var sql = "SELECT id from users where email = ? and id != ?";
    var inserts = [req.body.email, req.body.id];
    sql = mysql.pool.query(sql, inserts, function(error, result, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.status(400);
            res.end();
        }
        // if email address exists, render error on page.
        // don't update profile.
        else if (result[0]) {
            var context = {
                errors: 'Email address already exists. Profile changes not saved.',
                userId: req.body.id,
                email: req.body.original_email,
                name: req.body.original_name
            }
          res.render('profile', context);
        }
        else {
            if (req.body.password !== '') {
                var ciphertext = CryptoJS.AES.encrypt(req.body.password, config.CRYPTO_SECRET).toString();

                sql = "UPDATE users " + 
                "SET name = ?, " + 
                "email = ?, " +
                "password = ? " +
                "WHERE id = ?";

                inserts = [req.body.name, req.body.email, ciphertext, req.body.id];
            } else {

                sql = "UPDATE users " + 
                "SET name = ?, " + 
                "email = ? " +
                "WHERE id = ?";

                inserts = [req.body.name, req.body.email, req.body.id];
            }

            sql = mysql.pool.query(sql, inserts, function(error, result, fields){
                if(error){
                    res.write(JSON.stringify(error));
                    res.status(400);
                    res.end();
                }

                res.redirect('/profile');

        });
    }
});

});


module.exports = router;