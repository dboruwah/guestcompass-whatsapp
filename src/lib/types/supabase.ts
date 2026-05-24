// Placeholder for generated Supabase types.
// Run `supabase gen types typescript --linked > src/lib/types/supabase.ts` after linking project.

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      staff: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      guests: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      guest_tags: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      campaigns: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      campaign_audiences: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      segments: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      conversations: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      messages: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      audit_logs: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      activity_logs: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      properties: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
