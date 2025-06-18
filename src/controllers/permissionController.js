const { ok } = require('../../shared-libs/utils/response');
const service = require('../services/');
const logger = require('../utils/logger');

exports.getPermissionsByRoleId = async (req, res, next) => {
  try {
    const { roleId } = req.params;
    const permissions = await service.permissionService.getPermissionsByRoleId(roleId);
    return ok(res, permissions, 'Get Permissions successfully');
  } catch (err) {
    next(err);
  }
}

exports.getAllPermissions = async (req, res, next) => {
  try {
    const permissions = await service.permissionService.getAllPermissions();
    return ok(res, permissions, 'Get All Permissions successfully');
  } catch (err) {
    next(err);
  }
}