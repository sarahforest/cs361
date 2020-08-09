var mysql = require('mysql');
var config = require('./config.js');

var pool = mysql.createPool({
  connectionLimit : 10,
  host            : config.DB_HOST,
  user            : config.DB_USER,
  password        : config.DB_PASSWORD,
  database        : config.DB_DATABASE
});

module.exports.pool = pool;
