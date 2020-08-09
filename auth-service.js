const crypto = require("crypto-js");
const jwt = require('jsonwebtoken');
const { JWT_SECRET, CRYPTO_SECRET } = require('./config.js');

const AuthService = {
  comparePasswords(password, hash) {
    const bytes = crypto.AES.decrypt(hash, CRYPTO_SECRET);
    const decrypted = bytes.toString(crypto.enc.Utf8);
    return password === decrypted;
  },
  
  createJwt(payload) {
    return jwt.sign(payload, JWT_SECRET, {
      algorithm: 'HS256'
    });
  },

  verifyJwt(token) {
    return jwt.verify(token, JWT_SECRET);
  }  
};

module.exports = AuthService;
