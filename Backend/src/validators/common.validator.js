const { z } = require("zod");

/**
 * Common parameter validators
 */
const idParamSchema = z.object({
  id: z.string().trim().min(1, "ID parameter is required")
});

const patientIdParamSchema = z.object({
  patientId: z.string().trim().min(1, "Patient ID parameter is required")
});

const gameIdParamSchema = z.object({
  gameId: z.string().trim().min(1, "Game ID parameter is required")
});

const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => !isNaN(val) && val > 0, "Page must be a positive number"),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .refine((val) => !isNaN(val) && val > 0 && val <= 100, "Limit must be between 1 and 100")
});

module.exports = {
  idParamSchema,
  patientIdParamSchema,
  gameIdParamSchema,
  paginationQuerySchema
};
