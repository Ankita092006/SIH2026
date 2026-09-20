/**
 * Generic request validation middleware using Zod
 * Supports validating body, params, query, or direct schemas
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      // If schema is split into body, params, query
      if (schema.body || schema.params || schema.query) {
        if (schema.body) {
          req.body = schema.body.parse(req.body);
        }
        if (schema.params) {
          req.params = schema.params.parse(req.params);
        }
        if (schema.query) {
          req.query = schema.query.parse(req.query);
        }
      } else if (schema.parse) {
        // Direct schema on req.body
        req.body = schema.parse(req.body);
      }
      next();
    } catch (err) {
      const issues = err.issues || err.errors;
      if (issues && Array.isArray(issues)) {
        // Check for specific custom status code (e.g. 403 for admin escalation)
        const customStatusError = issues.find(
          (e) => e.params && e.params.statusCode
        );
        const statusCode = customStatusError ? customStatusError.params.statusCode : 400;

        const messages = issues.map((e) => e.message);
        return res.status(statusCode).json({
          success: false,
          message: messages.join(", ") || "Validation failed",
          errors: issues.map((e) => ({
            field: e.path.join("."),
            message: e.message
          }))
        });
      }

      return res.status(400).json({
        success: false,
        message: err.message || "Invalid input data"
      });
    }
  };
}

module.exports = { validate };
