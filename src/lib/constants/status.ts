import type {
  CampaignStatus,
  MessageStatus,
  ConversationStatus,
  ContactStatus,
  StaffStatus,
} from "@/lib/types"

export const CAMPAIGN_STATUS_CONFIG: Record<CampaignStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "neutral" },
  scheduled: { label: "Scheduled", color: "blue" },
  sending: { label: "Sending", color: "amber" },
  sent: { label: "Sent", color: "green" },
  paused: { label: "Paused", color: "yellow" },
  cancelled: { label: "Cancelled", color: "red" },
  failed: { label: "Failed", color: "red" },
}

export const MESSAGE_STATUS_CONFIG: Record<MessageStatus, { label: string; color: string }> = {
  queued: { label: "Queued", color: "neutral" },
  sent: { label: "Sent", color: "blue" },
  delivered: { label: "Delivered", color: "green" },
  read: { label: "Read", color: "emerald" },
  failed: { label: "Failed", color: "red" },
}

export const CONVERSATION_STATUS_CONFIG: Record<ConversationStatus, { label: string; color: string }> = {
  active: { label: "Active", color: "green" },
  archived: { label: "Archived", color: "neutral" },
  resolved: { label: "Resolved", color: "blue" },
}

export const CONTACT_STATUS_CONFIG: Record<ContactStatus, { label: string; color: string }> = {
  active: { label: "Active", color: "green" },
  inactive: { label: "Inactive", color: "neutral" },
  blocked: { label: "Blocked", color: "red" },
  opted_out: { label: "Opted Out", color: "yellow" },
}

export const STAFF_STATUS_CONFIG: Record<StaffStatus, { label: string; color: string }> = {
  active: { label: "Active", color: "green" },
  inactive: { label: "Inactive", color: "neutral" },
  suspended: { label: "Suspended", color: "red" },
}
