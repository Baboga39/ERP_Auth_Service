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

exports.upsertPermission = async (req, res, next) => {
  try {
    const { id, resource, action } = req.body;
    const permission = await service.permissionService.upSertPermission(id, resource, action);
    return ok(res, permission, 'Successfully');
  } catch (err) {
    next(err);
  }
}
exports.deletePermission = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.debug(`Deleting permission with ID Controller:  ${id}`);
    await service.permissionService.deletePermission(id);
    return ok(res, null, 'Permission deleted successfully');
  } catch (err) {
    next(err);
  }
}
exports.addPermissionToRole = async (req, res, next) => {
  try {
    const { roleId, permissionIds } = req.body;
    logger.debug(`Adding permission with ID ${permissionIds} to role with ID ${roleId}`);
    const result = await service.permissionService.addPermissionsToRole(roleId, permissionIds);
    return ok(res, result, 'Permission added to role successfully');
  } catch (err) {
    next(err);
  }
}

exports.removePermissionFromRole = async (req, res, next) => {
  try {
    const { roleId, permissionIds } = req.body;
    logger.debug(`Removing permission with ID ${permissionIds} from role with ID ${roleId}`);
    const result = await service.permissionService.removePermissionsFromRole(roleId, permissionIds);
    return ok(res, result, 'Permission removed from role successfully');
  } catch (err) {
    next(err);
  }
}