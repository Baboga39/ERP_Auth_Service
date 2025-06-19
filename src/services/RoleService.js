const prisma = require("../utils/db");
const CustomError = require("../../shared-libs/errors/CustomError");
const logger = require("../utils/logger");
class SessionService {
  async getAllRolesAndPermissions() {
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
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

    const result = roles.map((role) => ({
      id: role.id,
      name: role.name,
      permissions: role.permissions.map((p) => p.permission),
    }));
    return result;
  }

  async getAllRoles() {
    return await prisma.role.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }

  async addRoleWithPermissions(name, permissions) {
    await this.existingRole(name);

    if (!permissions || permissions.length === 0) {
      await this.create(name);
      return;
    }

    const role = await prisma.role.create({
      data: {
        name,
        permissions: {
          create: permissions.map((permission) => ({
            permission: {
              connect: { id: permission.id },
            },
          })),
        },
      },
    });

    return role;
  }

  async create(name) {
    const role = await prisma.role.create({
      data: { name },
    });

    return role;
  }

  async updateRole(id, name) {
    await this.existingRoleById(id);

    await this.existingRole(name);
    const updatedRole = await prisma.role.update({
      where: { id },
      data: { name },
    });
    if (!updatedRole) {
      throw new CustomError("Role not found", 404);
    }

    return updatedRole;
  }
  async deleteRole(id) {
    const role = await prisma.role.delete({
      where: { id },
    });

    if (!role) {
      throw new CustomError("Role not found", 404);
    }

    return role;
  }

  async existingRoleById(id) {
    const role = await prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new CustomError("Role not found", 404);
    }

    return role;
  }

  async existingRole(name) {
    const checkExistingRole = await prisma.role.findUnique({
      where: { name },
    });

    if (checkExistingRole) {
      throw new CustomError("Role already exists", 400);
    }

    return existingRole;
  }
}

module.exports = new SessionService();
