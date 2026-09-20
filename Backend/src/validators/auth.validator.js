const { z } = require("zod");

/**
 * Schema for user registration
 */
const registerSchema = z
  .object({
    name: z
      .string({ required_error: "Name, email and password are required" })
      .trim()
      .min(1, "Name cannot be empty"),
    email: z
      .string({ required_error: "Name, email and password are required" })
      .trim()
      .email("Please provide a valid email address"),
    password: z
      .string({ required_error: "Name, email and password are required" })
      .min(6, "Password must be at least 6 characters"),
    role: z.string().optional()
  })
  .superRefine((data, ctx) => {
    if (data.role !== undefined && data.role !== null) {
      const normalizedRole = String(data.role).toLowerCase().trim();
      if (normalizedRole === "admin") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Public registration of admin accounts is prohibited",
          params: { statusCode: 403 }
        });
      } else if (!["patient", "caregiver"].includes(normalizedRole)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Role must be either 'patient' or 'caregiver'",
          params: { statusCode: 400 }
        });
      }
    }
  });

/**
 * Schema for user login
 */
const loginSchema = z.object({
  email: z
    .string({ required_error: "Email and password are required" })
    .trim()
    .email("Please provide a valid email address"),
  password: z
    .string({ required_error: "Email and password are required" })
    .min(1, "Email and password are required")
});

/**
 * Schema for forgot password
 */
const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Please provide a valid email address")
});

/**
 * Schema for reset password
 */
const resetPasswordSchema = z.object({
  token: z
    .string({ required_error: "Reset token is required" })
    .min(1, "Reset token is required"),
  newPassword: z
    .string({ required_error: "New password is required" })
    .min(6, "Password must be at least 6 characters")
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
