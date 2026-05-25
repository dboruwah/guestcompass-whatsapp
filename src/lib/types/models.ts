export type Role = "super_admin" | "admin" | "manager" | "agent" | "viewer"

export type StaffStatus = "active" | "inactive" | "suspended"

export type ContactStatus = "active" | "inactive" | "blocked" | "opted_out"

export type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "paused" | "cancelled" | "failed"

export type CampaignType = "promotional" | "transactional" | "engagement" | "feedback" | "announcement" | "broadcast"

export type MessageDirection = "inbound" | "outbound"

export type MessageStatus = "queued" | "sent" | "delivered" | "read" | "failed"

export type ConversationStatus = "active" | "archived" | "resolved"

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "export"
  | "import"
  | "send_message"
  | "bulk_operation"

export type ChatbotStatus = "draft" | "active" | "paused"

export type ChatbotTriggerType = "keyword" | "exact_match" | "regex" | "welcome" | "fallback"

export type ChatbotResponseType = "text" | "template" | "interactive"

export interface Chatbot {
  id: string
  business_id: string
  name: string
  status: ChatbotStatus
  welcome_message: string | null
  fallback_message: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ChatbotRule {
  id: string
  chatbot_id: string
  trigger_type: ChatbotTriggerType
  trigger_value: string | null
  response_type: ChatbotResponseType
  response_config: Record<string, unknown>
  position: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type AuditEntity =
  | "contact"
  | "campaign"
  | "segment"
  | "staff"
  | "message"
  | "conversation"
  | "settings"
  | "user"

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  role: Role
  phone: string | null
  is_active: boolean
  last_sign_in_at: string | null
  created_at: string
  updated_at: string
}

export interface StaffMember {
  id: string
  user_id: string
  business_id: string
  role: Role
  position: string | null
  department: string | null
  status: StaffStatus
  permissions: string[]
  avg_response_time: number | null
  conversations_handled: number
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  business_id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string
  country_code: string | null
  language: string
  tags: string[]
  opt_in_status: "opted_in" | "pending" | "opted_out"
  opt_in_date: string | null
  opt_in_source: string | null
  total_messages_received: number
  total_messages_sent: number
  last_message_at: string | null
  last_campaign_id: string | null
  lifetime_value: number
  notes: string | null
  status: ContactStatus
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: string
  business_id: string
  name: string
  description: string | null
  type: CampaignType
  status: CampaignStatus
  message_template: string
  scheduled_at: string | null
  sent_at: string | null
  completed_at: string | null
  segment_id: string | null
  target_audience_count: number
  sent_count: number
  delivered_count: number
  read_count: number
  failed_count: number
  replied_count: number
  clicked_count: number
  conversion_count: number
  revenue_attributed: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface Segment {
  id: string
  business_id: string
  name: string
  description: string | null
  criteria: SegmentCriteria
  contact_count: number
  is_dynamic: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface SegmentCriteria {
  rules: SegmentRule[]
  logic: "and" | "or"
}

export interface SegmentRule {
  field: string
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "between" | "in" | "not_in"
  value: unknown
}

export interface Conversation {
  id: string
  business_id: string
  contact_id: string
  assigned_to: string | null
  status: ConversationStatus
  last_message_at: string | null
  last_message_preview: string | null
  unread_count: number
  response_time_avg: number | null
  whatsapp_conversation_id: string | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string | null
  sender_type: "staff" | "contact" | "system"
  direction: MessageDirection
  content: string
  content_type: "text" | "image" | "document" | "template" | "interactive"
  media_url: string | null
  status: MessageStatus
  whatsapp_message_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface AuditLog {
  id: string
  business_id: string
  actor_id: string
  action: AuditAction
  entity_type: AuditEntity
  entity_id: string | null
  changes: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface ActivityLog {
  id: string
  business_id: string
  actor_id: string | null
  entity_type: string
  entity_id: string | null
  action: string
  description: string
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface DashboardStats {
  total_contacts: number
  active_campaigns: number
  messages_sent_today: number
  delivery_rate: number
  read_rate: number
  response_rate: number
  conversion_rate: number
  revenue_attributed: number
  new_contacts_this_week: number
  contact_growth_percentage: number
  opt_in_subscribers: number
  avg_response_time: number
}
