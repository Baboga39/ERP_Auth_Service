const argon2 = require("argon2");
const prisma = require("../utils/db");

const CustomError = require("../../shared-libs/errors/CustomError");
const { existingRole } = require("./RoleService");
const logger = require("../utils/logger");
class PermissionService {
  async getPermissionsByRoleId(roleId) {
    const role = await prisma.role.findUnique({
      where: { id: parseInt(roleId, 10) },
      select: {
        permissions: {
          select: {
            permission: {
              select: {
                id: true,
                resource: true,
                action: true,
              },
            },
          },
        },
      },
    });

    if (!role) {
      throw new CustomError("Role not found", 404);
    }

    return role.permissions.map((p) => p.permission);
  }

  async getAllPermissions() {
    return await prisma.permission.findMany({
      select: {
        id: true,
        resource: true,
        action: true,
      },
    });
  }
  async addPermission(resource, action) {
    if (await this.existingPermission(resource, action)) {
      throw new CustomError("Permission already exists", 400);
    }

    return await prisma.permission.create({
      data: { resource, action },
    });
  }

  async existingPermission(resource, action) {
    return await prisma.permission.findUnique({
      where: { resource_action: { resource, action } },
    });
  }

  async updatePermission(id, resource, action) {
    const existingPermission = await prisma.permission.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existingPermission) {
      throw new CustomError("Permission not found", 404);
    }

    if (await this.existingPermission(resource, action)) {
      throw new CustomError("Permission already exists", 400);
    }

    return await prisma.permission.update({
      where: { id: parseInt(id, 10) },
      data: { resource, action },
    });
  }

  async deletePermission(id) {
    const existingPermission = await prisma.permission.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existingPermission) {
      throw new CustomError("Permission not found", 404);
    }

    return await prisma.permission.delete({
      where: { id: parseInt(id, 10) },
    });
  }
  async addPermissionToRole(roleId, permissionId) {
    await existingRole(roleId);

    await this.existingPermission(permissionId);

    return await prisma.role.update({
      where: { id: parseInt(roleId, 10) },
      data: {
        permissions: {
          connect: { id: parseInt(permissionId, 10) },
        },
      },
    });
  }

  async removePermissionFromRole(roleId, permissionId) {
    await existingRole(roleId);

    await this.existingPermission(permissionId);

    return await prisma.role.update({
      where: { id: parseInt(roleId, 10) },
      data: {
        permissions: {
          disconnect: { id: parseInt(permissionId, 10) },
        },
      },
    });
  }
}

module.exports = new PermissionService();
