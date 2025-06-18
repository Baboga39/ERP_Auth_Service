const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const argon2 = require('argon2');

async function main() {
  // 1. Define modules and actions
  const modules = {
    employee: ['create', 'read', 'update', 'delete'],
    asset:    ['create', 'read', 'update', 'delete'],
    inventory:['create', 'read', 'update', 'delete'],
    order:    ['create', 'read', 'update', 'delete'],
    report:   ['read'],
    account:  ['create', 'read', 'update', 'delete'],
    manufacture: ['create', 'read', 'update', 'delete'],
    logistics: ['create', 'read', 'update', 'delete'],
  };

  // 2. Seed Permissions
  const permissionData = [];
  for (const [resource, actions] of Object.entries(modules)) {
    for (const action of actions) {
      permissionData.push({ resource, action });
    }
  }
  await prisma.permission.createMany({ data: permissionData, skipDuplicates: true });

  // 3. Define Roles (admin + manager/staff per module)
  const baseRoles = ['admin'];
  for (const resource of Object.keys(modules)) {
    baseRoles.push(`${resource}_manager`);
    baseRoles.push(`${resource}_staff`);
  }
  await prisma.role.createMany({ data: baseRoles.map(name => ({ name })), skipDuplicates: true });

  // 4. Map RolePermission
  const allPerms = await prisma.permission.findMany();
  const permMap = allPerms.reduce((acc, p) => { acc[`${p.resource}:${p.action}`] = p.id; return acc; }, {});
  const rolePermissions = [];

  // Admin gets all permissions
  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
  for (const p of allPerms) {
    rolePermissions.push({ roleId: adminRole.id, permissionId: p.id });
  }

  // For each module, manager: all CRUD, staff: read only
  for (const [resource, actions] of Object.entries(modules)) {
    const managerRole = await prisma.role.findUnique({ where: { name: `${resource}_manager` } });
    const staffRole   = await prisma.role.findUnique({ where: { name: `${resource}_staff` } });

    for (const action of actions) {
      const permId = permMap[`${resource}:${action}`];
      // manager gets all
      rolePermissions.push({ roleId: managerRole.id, permissionId: permId });
      // staff gets only 'read' or report
      if (action === 'read' || resource === 'report') {
        rolePermissions.push({ roleId: staffRole.id, permissionId: permId });
      }
    }
  }
  await prisma.rolePermission.createMany({ data: rolePermissions, skipDuplicates: true });

  // 5. Create sample Users for each role
  for (const roleName of baseRoles) {
    const email = `${roleName}@example.com`;
    const password = 'Password123!';
    const hashed = await argon2.hash(password);
    const roleRec = await prisma.role.findUnique({ where: { name: roleName } });
    await prisma.user.upsert({
      where: { email },
      update: { password: hashed, roleId: roleRec.id },
      create: { email, password: hashed, roleId: roleRec.id }
    });
  }

  console.log('✅ Auth-service seeding completed with detailed roles.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
