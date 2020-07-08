const crypto = require("crypto-js");
const jwt = require('jsonwebtoken');
const config = require('./config.js');

const AuthService = {
  comparePasswords(password, hash) {
    const bytes = crypto.AES.decrypt(hash, 'secret key 123');
    const decrypted = bytes.toString(crypto.enc.Utf8);
    return password === decrypted;
  },
  
  createJwt(payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
      algorithm: 'HS256'
    });
  },

  verifyJwt(token) {
    return jwt.verify(token, config.JWT_SECRET);
  }  
};

module.exports = AuthService;