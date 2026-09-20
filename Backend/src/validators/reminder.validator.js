const { z } = require("zod");

/**
 * Validator for creating a reminder
 */
const createReminderSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(1, "Title cannot be empty"),
  description: z.string().trim().optional(),
  reminder_time: z
    .string({ required_error: "Reminder time is required" })
    .trim()
    .min(1, "Reminder time cannot be empty"),
  recurrence: z
    .enum(["none", "daily", "weekly", "custom"])
    .optional()
    .default("daily"),
  category: z
    .enum(["medication", "activity", "hydration", "appointment", "general"])
    .optional()
    .default("general"),
  patient_id: z.string().trim().optional()
});

/**
 * Validator for updating a reminder
 */
const updateReminderSchema = z.object({
  title: z.string().trim().min(1, "Title cannot be empty").optional(),
  description: z.string().trim().optional(),
  reminder_time: z.string().trim().min(1, "Reminder time cannot be empty").optional(),
  recurrence: z.enum(["none", "daily", "weekly", "custom"]).optional(),
  category: z.enum(["medication", "activity", "hydration", "appointment", "general"]).optional(),
  is_completed: z.boolean().optional(),
  is_active: z.boolean().optional()
});

module.exports = {
  createReminderSchema,
  updateReminderSchema
};
