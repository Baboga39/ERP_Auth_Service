const prisma = require("../utils/db");
const CustomError = require("../../shared-libs/errors/CustomError");
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
    if (this.existingRole(name)) {
      throw new CustomError("Role already exists", 400);
    }

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
    if (!this.existingRole(name)) {
      throw new CustomError("Role already exists", 400);
    }

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

  async findById(id) {
    const role = await prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new CustomError("Role not found", 404);
    }

    return role;
  }

  async existingRole(name) {
    const existingRole = await prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      throw new CustomError("Role already exists", 400);
    }

    return existingRole;
  }
}

module.exports = new SessionService();
