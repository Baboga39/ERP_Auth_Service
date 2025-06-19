const Joi = require('joi');

exports.loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),
};

exports.upsertPermissionSchema = {
  body: Joi.object({
    id: Joi.number().optional(),
    resource: Joi.string().required(),
    action: Joi.string().required(),
  }),
};

exports.idSchema = {
  params: Joi.object({
    id: Joi.number().optional()
  }),
};

exports.addToRoleSchema = {
  body: Joi.object({
    roleId: Joi.number().required(),
    permissionId: Joi.number().required(),
  }),
};


exports.addToRoleSchema = {
  body: Joi.object({
    roleId: Joi.number().required(),
    permissionIds: Joi.array()
      .items(Joi.number().integer().positive())
      .min(1)
      .required(),
  }),
};