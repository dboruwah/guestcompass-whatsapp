import type { Role } from "@/lib/types"

export const ROLE_HIERARCHY: Record<Role, number> = {
  super_admin: 100,
  admin: 80,
  manager: 60,
  agent: 40,
  viewer: 20,
}

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
  agent: "Agent",
  viewer: "Viewer",
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  super_admin: "Full system access with all privileges",
  admin: "Property-level administrative access",
  manager: "Operational management access",
  agent: "Day-to-day messaging and guest interaction",
  viewer: "Read-only access to dashboards and reports",
}
