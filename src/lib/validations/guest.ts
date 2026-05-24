import { z } from "zod"

export const guestSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email required").nullable().optional(),
  phone: z.string().min(1, "Phone number is required"),
  country_code: z.string().nullable().optional(),
  language: z.string().default("en"),
  tags: z.array(z.string()).default([]),
  notes: z.string().nullable().optional(),
  status: z.enum(["active", "inactive", "blocked"]).default("active"),
})

export const guestImportSchema = z.array(guestSchema)

export type GuestInput = z.infer<typeof guestSchema>
