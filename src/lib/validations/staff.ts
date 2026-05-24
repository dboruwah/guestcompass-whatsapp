import { z } from "zod"

export const staffSchema = z.object({
  email: z.string().email("Valid email is required"),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["super_admin", "admin", "manager", "agent", "viewer"]),
  position: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
})

export const staffUpdateSchema = z.object({
  full_name: z.string().min(2).optional(),
  role: z.enum(["super_admin", "admin", "manager", "agent", "viewer"]).optional(),
  position: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
})

export type StaffInput = z.infer<typeof staffSchema>
export type StaffUpdateInput = z.infer<typeof staffUpdateSchema>
