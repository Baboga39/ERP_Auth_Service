const express = require('express');
const router = express.Router();
const session = require('../controllers/sessionController');
const rateLimit = require('express-rate-limit');
const requireAuth = require('../middlewares/auth.middleware');



router.get('/',requireAuth,  session.getAllSessions);

router.delete('/sessions/:sessionId',  session.revokeSession);

router.delete('/sessions',  session.revokeAllSessions);

module.exports = router;





