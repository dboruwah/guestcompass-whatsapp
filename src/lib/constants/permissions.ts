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
  | "chatbots:read"
  | "chatbots:write"

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
    "chatbots:read", "chatbots:write",
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
    "chatbots:read", "chatbots:write",
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
    "audit:read",
    "chatbots:read", "chatbots:write",
  ],
  agent: [
    "guests:read",
    "campaigns:read",
    "messages:read", "messages:write",
    "conversations:read", "conversations:write",
    "analytics:read",
    "chatbots:read",
  ],
  viewer: [
    "guests:read",
    "campaigns:read",
    "messages:read",
    "conversations:read",
    "analytics:read",
    "chatbots:read",
  ],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}
