import { z } from "zod"

export const propertySettingsSchema = z.object({
  name: z.string().min(1, "Property name is required"),
  timezone: z.string().default("UTC"),
  default_language: z.string().default("en"),
  whatsapp_business_phone: z.string().nullable().optional(),
  business_hours: z.object({
    enabled: z.boolean().default(false),
    timezone: z.string().optional(),
    monday: z.object({ start: z.string(), end: z.string() }).optional(),
    tuesday: z.object({ start: z.string(), end: z.string() }).optional(),
    wednesday: z.object({ start: z.string(), end: z.string() }).optional(),
    thursday: z.object({ start: z.string(), end: z.string() }).optional(),
    friday: z.object({ start: z.string(), end: z.string() }).optional(),
    saturday: z.object({ start: z.string(), end: z.string() }).optional(),
    sunday: z.object({ start: z.string(), end: z.string() }).optional(),
  }).optional(),
  auto_reply_enabled: z.boolean().default(false),
  auto_reply_message: z.string().nullable().optional(),
  messaging_window: z.object({
    enabled: z.boolean().default(false),
    start_hour: z.number().min(0).max(23).default(9),
    end_hour: z.number().min(0).max(23).default(21),
  }).optional(),
})

export type PropertySettingsInput = z.infer<typeof propertySettingsSchema>
