const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const requireAuth = require('../middlewares/auth.middleware');
const requirePermission = require('../../shared-libs/middlewares/requirePermissions');



router.get('/',requirePermission(), roleController.getAllRole);
router.get('/roleWithPermissions',requirePermission(), roleController.getAllRoleWithPermissions);
router.post('/upsert', requireAuth, requirePermission(), roleController.upSertRole);

module.exports = router;





