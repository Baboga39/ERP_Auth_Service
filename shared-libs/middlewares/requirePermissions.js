
const logger = require("../../src/utils/logger");
const CustomError = require("../errors/CustomError");


function requirePermissions(requiredPermissions) {
  if (
    requiredPermissions !== undefined &&
    !Array.isArray(requiredPermissions)
  ) {
    throw new CustomError(
      "INVALID_MIDDLEWARE_USAGE",
      500,
      "requirePermissions must be called with an array of permission strings, or with no arguments for admin-only."
    );
  }

  const perms = Array.isArray(requiredPermissions) ? requiredPermissions : [];

  return (req, res, next) => {
    const role = req.headers["x-role-id"];
    const rawPerms = req.headers["x-permissions"];

    logger.debug(
      `Checking permissions for user ${
        req.headers["x-user-id"]
      } (role=${role}), requiredPerms=[${perms.join(", ")}]`
    );

    // Admins always pass
    if (role === "5") {
      return next();
    }

    if (perms.length === 0) {
      return next(
        new CustomError(
          "PERMISSION_DENIED",
          403,
          "Admin role required to access this resource."
        )
      );
    }

    if (!rawPerms) {
      return next(
        new CustomError(
          "MISSING_PERMISSIONS_HEADER",
          403,
          "Missing x-permissions header."
        )
      );
    }

    const userPermissions = rawPerms.split(",").map((p) => p.trim());
    const hasAny = perms.some((p) => userPermissions.includes(p));

    if (!hasAny) {
      return next(
        new CustomError(
          "PERMISSION_DENIED",
          403,
          `At least one of these permissions is required: [${perms.join(", ")}]`
        )
      );
    }

    next();
  };
}

module.exports = requirePermissions;
