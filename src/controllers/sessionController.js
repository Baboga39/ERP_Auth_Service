const { ok, created } = require("../../shared-libs/utils/response");
const CustomError = require("../../shared-libs/errors/CustomError");
const service = require("../services/index");
const logger = require("../utils/logger");



exports.getAllSessions = async (req, res, next) => {
  try {
    const sessions = await service.sessionService.getAllSessions(req.user.id);
    return ok(res, sessions);
  } catch (err) {
    next(err);
  }
};

exports.revokeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    await service.sessionService.revokeSession(sessionId, req.user.id);
    return ok(res, null, "Session revoked successfully");
  } catch (err) {
    next(err);
  }
};

exports.revokeAllSessions = async (req, res, next) => {
  try {
    await service.sessionService.revokeAllSessions(req.user.id);
    return ok(res, null, "All sessions revoked successfully");
  } catch (err) {
    next(err);
  }
};


