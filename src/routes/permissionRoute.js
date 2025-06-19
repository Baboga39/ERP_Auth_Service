const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const requireAuth = require('../middlewares/auth.middleware');
const requirePermission = require('../../shared-libs/middlewares/requirePermissions')
const validate = require('../middlewares/validate');
const { upsertPermissionSchema, idSchema, addToRoleSchema } = require('../utils/validation');
const { route } = require('./auth.routes');


router.get('/all',requireAuth, permissionController.getAllPermissions);
router.get('/:roleId', permissionController.getPermissionsByRoleId);
router.post('/upSert',validate(upsertPermissionSchema),requireAuth,requirePermission(),permissionController.upsertPermission)
router.delete('/:id',validate(idSchema),requireAuth,requirePermission(),permissionController.deletePermission)
router.post('/addToRole',requireAuth,requirePermission(),validate(addToRoleSchema),permissionController.addPermissionToRole);
router.post('/removeFromRole',requireAuth,requirePermission(),validate(addToRoleSchema),permissionController.removePermissionFromRole);


module.exports = router;





    