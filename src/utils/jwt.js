const jwt = require('jsonwebtoken');
const logger = require('./logger');

const privateKey = Buffer.from(process.env.JWT_PRIVATE_KEY_BASE64, 'base64').toString('utf8');
const publicKey = Buffer.from(process.env.JWT_PUBLIC_KEY_BASE64, 'base64').toString('utf8');

exports.signAccessToken = (payload) => {
  logger.debug(privateKey)
  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  });
};

exports.signRefreshToken = (payload) =>
  jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });

exports.verifyToken = (token) =>
  jwt.verify(token, publicKey, { algorithms: ['RS256'] });
