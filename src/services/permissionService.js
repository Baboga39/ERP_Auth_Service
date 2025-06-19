const argon2 = require("argon2");
const prisma = require("../utils/db");

const CustomError = require("../../shared-libs/errors/CustomError");
const { existingRole, existingRoleById } = require("./RoleService");
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

  async upSertPermission(id, resource, action) {
    if (id) {
      await this.existingPermissionId(id);
      return await this.updatePermission(id, resource, action);
    }
    return await this.addPermission(resource, action);
  }
  async addPermission(resource, action) {
    if (await this.existingPermission(resource, action)) {
      throw new CustomError("Permission already exists", 400);
    }

    return await prisma.permission.create({
      data: { resource, action },
    });
  }

  async existingPermissionById(id) {
    const permission = await prisma.permission.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!permission) {
      throw new CustomError("Permission not found", 404);
    }

    return permission;
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
    await this.existingPermissionId(id);

    return await prisma.permission.delete({
      where: { id: parseInt(id, 10) },
    });
  }

  async existingPermissionId(permissionId) {
    const permission = await prisma.permission.findUnique({
      where: { id: parseInt(permissionId, 10) },
    });
    logger.debug(
      `Checking if permission with ID ${permissionId} exists: ${!!permission}`
    );

    if (!permission) {
      throw new CustomError("Permission not found", 404);
    }

    return permission;
  }

  async addPermissionsToRole(roleId, permissionIds) {
    await existingRoleById(roleId);

    await Promise.all(
      permissionIds.map((id) => this.existingPermissionById(id))
    );

    return await prisma.role.update({
      where: { id: parseInt(roleId, 10) },
      data: {
        permissions: {
          connect: permissionIds.map((id) => ({ id: parseInt(id, 10) })),
        },
      },
    });
  }
  async removePermissionsFromRole(roleId, permissionIds) {
    await existingRoleById(roleId);

    await Promise.all(
      permissionIds.map((id) => this.existingPermissionById(id))
    );

    return await prisma.rolePermission.deleteMany({
      where: {
        roleId: parseInt(roleId, 10),
        permissionId: { in: permissionIds.map((id) => parseInt(id, 10)) },
      },
    });
  }
}

module.exports = new PermissionService();
