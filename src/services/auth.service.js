const argon2 = require("argon2");
const {
  signAccessToken,
  signRefreshToken,
  verifyToken,
} = require("../utils/jwt");
const CustomError = require("../../shared-libs/errors/CustomError");
const prisma = require("../utils/db");
const { createSession } = require("./sessionService");
const USER_ROLE_MAP = require("../../shared-libs/utils/position-role-map");
const logger = require("../utils/logger");
class AuthService {
  async register(email, password, position) {
    const hashed = await argon2.hash(password);
    const roleName = USER_ROLE_MAP[position] || 'guest'; 
    const role = await prisma.role.findFirst({ where: { name: roleName } });
    const user = await prisma.user.create({
        data: {
          email,
          password: hashed,
          role: { connect: { id: role.id } },
        },
      });
    logger.info(`✔️ User created from position '${position}' → role '${roleName}'`);
    return user;
  }

  async login(email, password, ipAddress, userAgent) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { 
      role: {
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      }
    }
  });

  if (!user || !(await argon2.verify(user.password, password))) {
    throw new CustomError("Incorrect email or password", 401);
  }

  // const permissions = user.role 
  //   ? user.role.permissions.map(rp => `${rp.permission.resource}:${rp.permission.action}`)
  //   : [];

  const payload = {
    id: user.id,
    roleId: user.role ? user.role.id : null,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await createSession(user.id, ipAddress, userAgent);

  return { accessToken, refreshToken };
}


  async refreshToken(token) {
    const payload = verifyToken(token);

    const session = await prisma.session.findUnique({
      where: { refreshToken: token },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new CustomError("Invalid or expired token", 403);
    }

    return signAccessToken({ id: payload.id, roleId: payload.roleId });
  }

  async getCurrentUser(userId) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });
  }

  async logout(token) {
    if (!token) {
      throw new CustomError("No refresh token provided", 400);
    }
    await prisma.session.delete({
      where: { refreshToken: token },
    });
  }

  async resetPassword(email, password, newPassword) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    if (!(await argon2.verify(user.password, password))) {
      throw new CustomError("Incorrect current password", 401);
    }

    const hashedNewPassword = await argon2.hash(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    return { message: "Password updated successfully" };
  }
}

module.exports = new AuthService();
