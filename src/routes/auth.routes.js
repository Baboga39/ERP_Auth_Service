const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth.controller');
const rateLimit = require('express-rate-limit');
const requireAuth = require('../middlewares/auth.middleware');

// const loginLimiter = rateLimit({
//   windowMs: 5 * 60 * 1000,
//   max: 5,
//   message: 'Too many login attempts from this IP, please try again after 5 minutes',
// });

// router.post('/login', loginLimiter, auth.login);
router.post('/login', auth.login);
router.post('/register', auth.register);
router.post('/refresh-token', auth.refreshToken);
router.get('/me',requireAuth, auth.me);

router.post('/logout',  auth.logout);


module.exports = router;




