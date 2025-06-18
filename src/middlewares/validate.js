const CustomError = require("../../shared-libs/errors/CustomError");

module.exports = (schema) => {
  return (req, res, next) => {
    const targets = ['params', 'query', 'body'];

    try {
      for (const key of targets) {
        if (schema[key]) {
          const { error, value } = schema[key].validate(req[key], {
            abortEarly: true, 
            stripUnknown: true,
            presence: 'optional',
            convert: true,
          });

          if (error) {
            throw new CustomError(
              'VALIDATION_ERROR',
              400,
              error.details[0].message
            );
          }

          req[key] = value;
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
