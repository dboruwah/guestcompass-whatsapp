# API Architecture

## Current (Direct Supabase)

Currently, the application queries Supabase directly from client and server components using typed clients. This is the fastest approach for development while maintaining full security.

**Pattern:**
```
Component → Supabase Client → Database
              ↓
          RLS Enforced
```

## Future (Service Layer)

As the application grows, a service layer will be introduced:

```
Component → Service Function → Supabase Client → Database
                                    ↓
                                RLS + Business Logic
```

### Planned API Route Structure

```
POST   /api/auth/login              # Authentication
POST   /api/auth/logout
POST   /api/auth/register

GET    /api/guests                  # Guest management
POST   /api/guests
GET    /api/guests/:id
PATCH  /api/guests/:id
DELETE /api/guests/:id

GET    /api/campaigns               # Campaign management
POST   /api/campaigns
PATCH  /api/campaigns/:id
POST   /api/campaigns/:id/send

GET    /api/conversations           # Messaging
GET    /api/conversations/:id
POST   /api/conversations/:id/messages

GET    /api/analytics               # Analytics
GET    /api/analytics/export

GET    /api/staff                   # Staff management
POST   /api/staff/invite
PATCH  /api/staff/:id

GET    /api/settings                # Settings
PATCH  /api/settings

GET    /api/audit-logs              # Audit
GET    /api/audit-logs/export
```

### Webhook Endpoints (Future)

```
POST   /api/webhooks/whatsapp      # WhatsApp incoming messages
POST   /api/webhooks/whatsapp/status # Message status updates
POST   /api/webhooks/stripe        # Billing events
```
