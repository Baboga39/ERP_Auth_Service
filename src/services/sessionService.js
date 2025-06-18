const argon2 = require("argon2");
const prisma = require("../utils/db");
const {
  signAccessToken,
  signRefreshToken,
  verifyToken,
} = require("../utils/jwt");
const CustomError = require("../../shared-libs/errors/CustomError");
class SessionService {
    async getAllSessions(userId) {
    return prisma.session.findMany({
      where: { userId },
      select: {
        id: true,
        deviceId: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
      },
    });
  }

  async createSession(userId, ipAddress, userAgent) {
    const existingSession = await prisma.session.findFirst({
      where: { userId, ipAddress, userAgent },
    });

    if (existingSession && existingSession.expiresAt > new Date()) {
      return existingSession;
    }

    const refreshToken = signRefreshToken({ userId });
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const session = await prisma.session.create({
      data: {
        userId,
        ipAddress,
        userAgent,
        refreshToken,
        expiresAt,
      },
    });

    return session;
  }

  async revokeSession(sessionId, userId) {
    const id = Number(sessionId);
    const session = await prisma.session.findUnique({
      where: { id },
    });

    if (!session || session.userId !== userId) {
      throw new CustomError("Session not found or not yours", 404);
    }

    await prisma.session.delete({
      where: { id },
    });
  }

  async revokeAllSessions(userId) {
    await prisma.session.deleteMany({
      where: { userId },
    });
  }


}

module.exports = new SessionService();
