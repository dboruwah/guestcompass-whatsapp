import type { Role } from "@/lib/types"

export type Permission =
  | "guests:read"
  | "guests:write"
  | "guests:delete"
  | "guests:export"
  | "campaigns:read"
  | "campaigns:write"
  | "campaigns:delete"
  | "campaigns:send"
  | "segments:read"
  | "segments:write"
  | "segments:delete"
  | "messages:read"
  | "messages:write"
  | "messages:delete"
  | "conversations:read"
  | "conversations:write"
  | "conversations:assign"
  | "staff:read"
  | "staff:write"
  | "staff:delete"
  | "analytics:read"
  | "analytics:export"
  | "settings:read"
  | "settings:write"
  | "audit:read"
  | "audit:export"

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    "guests:read", "guests:write", "guests:delete", "guests:export",
    "campaigns:read", "campaigns:write", "campaigns:delete", "campaigns:send",
    "segments:read", "segments:write", "segments:delete",
    "messages:read", "messages:write", "messages:delete",
    "conversations:read", "conversations:write", "conversations:assign",
    "staff:read", "staff:write", "staff:delete",
    "analytics:read", "analytics:export",
    "settings:read", "settings:write",
    "audit:read", "audit:export",
  ],
  admin: [
    "guests:read", "guests:write", "guests:export",
    "campaigns:read", "campaigns:write", "campaigns:send",
    "segments:read", "segments:write",
    "messages:read", "messages:write",
    "conversations:read", "conversations:write", "conversations:assign",
    "staff:read", "staff:write",
    "analytics:read", "analytics:export",
    "settings:read", "settings:write",
    "audit:read",
  ],
  manager: [
    "guests:read", "guests:write",
    "campaigns:read", "campaigns:write", "campaigns:send",
    "segments:read", "segments:write",
    "messages:read", "messages:write",
    "conversations:read", "conversations:write", "conversations:assign",
    "staff:read",
    "analytics:read",
    "settings:read",
  ],
  agent: [
    "guests:read",
    "campaigns:read",
    "messages:read", "messages:write",
    "conversations:read", "conversations:write",
    "analytics:read",
  ],
  viewer: [
    "guests:read",
    "campaigns:read",
    "messages:read",
    "conversations:read",
    "analytics:read",
  ],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}
