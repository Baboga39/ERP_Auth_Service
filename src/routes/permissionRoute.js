const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const requireAuth = require('../middlewares/auth.middleware');
const requirePermission = require('../../shared-libs/middlewares/requirePermissions')


router.get('/all',requireAuth, permissionController.getAllPermissions);
router.get('/:roleId', permissionController.getPermissionsByRoleId);


module.exports = router;





