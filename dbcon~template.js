var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs361_USERNAME',
  password        : 'PASSWORD',
  database        : 'cs361_USERNAME'
});
module.exports.pool = pool;
