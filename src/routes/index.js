const express = require('express');
const authRoutes = require('./auth.routes');
const sessionRoutes = require('./sessionRoute');
const roleRoute =require('./roleRoute')
const permissionRoute = require('./permissionRoute');

const router = express.Router();

router.use('/', authRoutes);
router.use('/session', sessionRoutes);
router.use('/roles', roleRoute);
router.use('/permissions', permissionRoute);

module.exports = router;
