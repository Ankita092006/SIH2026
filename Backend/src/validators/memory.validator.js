const { z } = require("zod");

/**
 * Validator for creating a personal memory
 */
const createMemorySchema = z.object({
  patient_id: z.string().trim().optional(),
  memory_type: z.enum(["PERSON", "EVENT", "OBJECT", "PLACE"], {
    errorMap: () => ({ message: "memory_type must be PERSON, EVENT, OBJECT, or PLACE" })
  }),
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(1, "Title cannot be empty"),
  person: z.string().trim().optional(),
  relationship: z.string().trim().optional(),
  description: z.string().trim().optional(),
  image_url: z.string().trim().optional(),
  date: z.string().trim().optional(),
  location: z.string().trim().optional(),
  tags: z.array(z.string()).optional(),
  caregiver_verified: z.boolean().optional().default(false)
});

/**
 * Validator for updating a memory
 */
const updateMemorySchema = createMemorySchema.partial();

/**
 * Validator for generating a memory recall activity
 */
const generateActivitySchema = z.object({
  patient_id: z.string().trim().optional(),
  memory_id: z.string().trim().optional(),
  type: z.enum(["RECOGNITION", "ASSOCIATION", "CHRONOLOGY"]).optional()
});

module.exports = {
  createMemorySchema,
  updateMemorySchema,
  generateActivitySchema
};
