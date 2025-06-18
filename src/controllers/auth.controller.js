const { ok, created } = require("../../shared-libs/utils/response");
const CustomError = require("../../shared-libs/errors/CustomError");
const service = require("../services/index");
const { PrismaClient } = require("@prisma/client");
const { checkLoginAttempt } = require('../utils/loginAttemptLimiter');
const logger = require("../utils/logger");


exports.register = async (req, res, next) => {
  try {
    const { email, password, roleId } = req.body;
    const user = await service.authService.register(email, password, roleId);
    return created(res, user, "User registered successfully");
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    await checkLoginAttempt(email);
    let ipAddress =
      (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
      req.connection.remoteAddress ||
      req.ip;

    if (ipAddress === "::1") {
      ipAddress = "127.0.0.1";
    }
    const userAgent = req.headers["user-agent"] || "";

    const tokens = await service.authService.login(
      email,
      password,
      ipAddress,
      userAgent
    );
    return ok(res, tokens, "Login successful");
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    const newAccessToken = await service.authService.refreshToken(token);
    return ok(res, { accessToken: newAccessToken }, "New access token issued");
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await service.authService.getCurrentUser(req.user.id);
    return ok(res, user);
  } catch (err) {
    next(err);
  }
};


exports.logout = async (req, res, next) => {
  try {
    const { token } = req.body;
    await service.authService.logout(token);
    return ok(res, null, "Logged out successfully");
  } catch (err) {
    next(err);
  }
};

exports.getAllSessions = async (req, res, next) => {
  try {
    logger.info(`Fetching all sessions for user ID: ${req.user.id}`);
    const sessions = await service.authService.getAllSessions(req.user.id);
    return ok(res, sessions);
  } catch (err) {
    next(err);
  }
};

exports.revokeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    await service.authService.revokeSession(sessionId, req.user.id);
    return ok(res, null, "Session revoked successfully");
  } catch (err) {
    next(err);
  }
};

exports.revokeAllSessions = async (req, res, next) => {
  try {
    await service.authService.revokeAllSessions(req.user.id);
    return ok(res, null, "All sessions revoked successfully");
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, password, newPassword } = req.body;
    await service.authService.resetPassword(email, password, newPassword);
    return ok(res, null, "Password reset successfully");
  } catch (err) {
    next(err);
  }
};
