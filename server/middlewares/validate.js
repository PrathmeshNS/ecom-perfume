const ApiError = require("../utils/ApiError");

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const messages = result.error.errors.map(
      (e) => `${e.path.join(".")}: ${e.message}`
    );
    return next(new ApiError(400, "Validation failed", messages));
  }
  req.body = result.data;
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    const messages = result.error.errors.map(
      (e) => `${e.path.join(".")}: ${e.message}`
    );
    return next(new ApiError(400, "Invalid query parameters", messages));
  }
  req.query = result.data;
  next();
};

module.exports = { validate, validateQuery };
