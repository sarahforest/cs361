const express = require('express');
const mysql = require('./dbcon.js');
const { requireAuth } = require('./middleware.js');
const Utils = require('./utils.js');
var CryptoJS = require('crypto-js');
var bodyParser = require('body-parser');
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
    console.log('Edit profile called', req.body)
    //TO DO: update the users table with the new details.

    res.redirect('/profile');
});


module.exports = router;