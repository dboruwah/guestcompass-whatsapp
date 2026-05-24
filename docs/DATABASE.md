# Database Schema — WhatsApp Marketing CRM

## Entity Relationship Overview

```
businesses (1) ──→ (N) profiles
businesses (1) ──→ (N) staff
businesses (1) ──→ (N) contacts
businesses (1) ──→ (N) contact_tags
businesses (1) ──→ (N) segments
businesses (1) ──→ (N) campaigns
businesses (1) ──→ (N) conversations
businesses (1) ──→ (N) audit_logs
businesses (1) ──→ (N) activity_logs

profiles (1) ──→ (N) staff
profiles (1) ──→ (N) segments (created_by)
profiles (1) ──→ (N) campaigns (created_by)
profiles (1) ──→ (N) conversations (assigned_to)
profiles (1) ──→ (N) messages (sender_id)

contacts (1) ──→ (N) conversations
contacts (1) ──→ (N) campaign_recipients
conversations (1) ──→ (N) messages
campaigns (1) ──→ (N) campaign_recipients
segments (1) ──→ (N) campaigns
```

## Key Tables

### contacts
Core CRM entity. Tracks opt-in status (opted_in/pending/opted_out), opt-in source and date, engagement metrics (messages received/sent), lifetime value, and tags.

### campaigns
Broadcast campaigns with full lifecycle tracking. Tracks sent, delivered, read, replied, clicked, converted counts plus revenue attribution. Status-driven workflow (draft → scheduled → sending → sent).

### campaign_recipients
Many-to-many junction between campaigns and contacts. Tracks individual recipient status, delivery/read/reply/click timestamps, conversion flag, and attributed revenue.

### segments
Dynamic query definitions. `criteria` JSONB stores rule-based conditions for automatic contact grouping. `contact_count` is updated dynamically.

### conversations & messages
WhatsApp conversation threads. Messages are polymorphic (sender_type: staff|contact|system). Supports rich content types. Conversations track assignment, response time averages, and unread counts.

### staff
Links a profile to a business with specific role and permissions. Includes performance metrics: `avg_response_time` and `conversations_handled`.

## Security Design

- **Every table has RLS enabled**
- **All policies are business-scoped** — users only see data for their assigned business
- **Opt-in data is protected** — contacts table has dedicated opt-in tracking
- **Triggers** ensure profile creation on signup and timestamp updates
- **Service role** used only for server-side admin operations
