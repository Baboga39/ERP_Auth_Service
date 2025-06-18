const { ok, created } = require("../../shared-libs/utils/response");
const CustomError = require("../../shared-libs/errors/CustomError");
const service = require("../services/index");
const logger = require("../utils/logger");

exports.getAllRole = async (req, res, next) => {
  try {
    const roles = await service.roleService.getAllRoles();
    return ok(res, roles, "Get All Roles Successfully");
  } catch (err) {
    next(err);
  }
};

exports.getAllRoleWithPermissions = async (req, res, next) => {
  try {
    const RolesWithPermissions =
      await service.roleService.getAllRolesAndPermissions();
    return ok(res, RolesWithPermissions, "Session revoked successfully");
  } catch (err) {
    next(err);
  }
};

exports.upSertRole = async (req, res, next) => {
  try {
    const { id, name, permissions } = req.body;
    let role;
    if (id) {
      role = await service.roleService.updateRole(id, name);
      return ok(res, role, "Role updated successfully");
    }
    role = await service.roleService.addRoleWithPermissions(name, permissions);
    return created(res, role, "Role created successfully");
  } catch (err) {
    next(err);
  }
};

exports.upSertRoleWithPermissions = async (req, res, next) => {
  try {
    const { id, name, permissions } = req.body;
  } catch (err) {
    next(err);
  }
};
