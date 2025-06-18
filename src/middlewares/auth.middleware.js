const CustomError = require("../../shared-libs/errors/CustomError");
module.exports = function requireAuth(req, res, next) {
  const userId = req.headers['x-user-id'];
  const roleId = req.headers['x-role-id'];
  

  if (!userId) {
    throw new CustomError('Not authenticated', 401);
  }

  req.user = {
    id: parseInt(userId),
    roleId: parseInt(roleId),
  };

  next();
};
