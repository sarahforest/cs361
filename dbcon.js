var mysql = require('mysql');

const config = require('./config');

var pool = mysql.createPool({
  connectionLimit : 10,
  host            : config.host,
  user            : config.user,
  password        : config.password,
  database        : config.database
});

module.exports.pool = pool;
