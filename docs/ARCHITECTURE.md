# GuestCompass — WhatsApp Marketing CRM Architecture

## 1. System Overview

GuestCompass is a **WhatsApp Business marketing and CRM platform** architected as a **modular, multi-tenant SaaS** application. It enables businesses to send bulk WhatsApp campaigns, manage customer audiences, segment contacts, track campaign performance, and handle customer conversations — all from a single enterprise-grade dashboard.

### What This Platform Is

- WhatsApp broadcast campaign management
- Contact/audience CRM with opt-in tracking
- Rule-based audience segmentation
- Real-time conversation inbox
- Campaign analytics and revenue attribution
- Staff performance monitoring
- Multi-business SaaS platform

### What This Platform Is NOT

- A hotel PMS system
- A reservation management tool
- A room booking platform
- A front-desk operations system

---

## 2. Architecture Philosophy

- **Modular by design** — each business domain is isolated in its own module
- **API-first** — all business logic is accessible via typed service layers
- **Secure by default** — Row Level Security at the database, middleware at the edge
- **Future-proof** — architecture supports migration to microservices without rewrites
- **SaaS-ready** — multi-business support built into schema and permissions from day one

---

## 3. Folder Structure

```
src/
├── app/
│   ├── (auth)/               # Auth route group
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (dashboard)/          # Dashboard route group
│   │   ├── dashboard/        # Marketing KPIs overview
│   │   ├── contacts/         # Contact CRM management
│   │   ├── broadcasts/       # WhatsApp campaign management
│   │   ├── segments/         # Audience segmentation
│   │   ├── inbox/            # Conversation management
│   │   ├── analytics/        # Campaign & audience analytics
│   │   ├── staff/            # Team & performance management
│   │   ├── settings/         # Platform configuration
│   │   └── audit-logs/       # Security audit trail
│   └── api/                  # API routes
│
├── components/
│   ├── ui/                   # Design system primitives
│   ├── layout/               # Sidebar, Navbar, DashboardShell
│   ├── data-display/         # StatCard, DataTable, EmptyState
│   ├── forms/                # FormField, SearchInput, FilterBar
│   ├── feedback/             # AlertBanner, ConfirmDialog
│   └── charts/               # LineChart, BarChart, PieChart
│
├── lib/
│   ├── supabase/             # Supabase clients (browser, server, admin, middleware)
│   │   └── queries/          # Database query modules
│   ├── auth/                 # Authentication helpers
│   ├── utils/                # Utility functions
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript type definitions
│   ├── validations/          # Zod validation schemas
│   ├── constants/            # Business constants (roles, permissions, menu)
│   └── services/             # Business logic service layer (future)
│
└── providers/                # React context providers
```

---

## 4. Dashboard Architecture

### KPI Cards (Top Row)
- **Total Contacts** — audience size with growth trend
- **Active Campaigns** — currently running broadcasts
- **Messages Today** — daily volume
- **Delivery Rate** — successful delivery percentage

### KPI Cards (Second Row)
- **Read Rate** — message open percentage
- **Response Rate** — customer reply percentage
- **Revenue Attributed** — campaign-driven revenue
- **Avg Response Time** — staff performance metric

### Dashboard Sections
1. **Campaign Performance Overview** — top campaigns by delivery, read, and response rates
2. **Audience Growth Analytics** — new contacts, opt-in trends, opt-out tracking
3. **Message Volume Chart** — 12-month delivery trend visualization
4. **Staff Performance** — agent response times, conversation counts, resolution rates
5. **Recent Activity Feed** — chronological platform events

---

## 5. Database Design

### Core Entities

| Table | Purpose |
|-------|---------|
| `businesses` | Multi-tenant foundation (one row = one business) |
| `profiles` | Extends auth.users with role and business association |
| `staff` | Links profiles to businesses with roles and permissions |
| `contacts` | CRM contacts with opt-in status, tags, engagement metrics |
| `contact_tags` | Reusable tag definitions per business |
| `segments` | Rule-based audience definitions with dynamic counts |
| `campaigns` | Broadcast campaigns with full lifecycle tracking |
| `campaign_recipients` | Campaign-to-contact mapping with delivery/reply/conversion tracking |
| `conversations` | WhatsApp conversation threads with assignment and SLA tracking |
| `messages` | Individual messages with status, direction, and content type |
| `audit_logs` | Immutable security log for all CRUD operations |
| `activity_logs` | User-facing activity feed |

### Key Design Decisions

- **Opt-in tracking** — every contact has `opt_in_status`, `opt_in_date`, and `opt_in_source`
- **Revenue attribution** — campaigns track `revenue_attributed` and `conversion_count`
- **Staff performance** — staff table includes `avg_response_time` and `conversations_handled`
- **Campaign recipients** — tracks delivery, read, reply, click, and conversion per recipient
- **All tables have RLS** — business-scoped access control

---

## 6. Security

- Supabase Auth with HTTP-only cookies
- Row Level Security on every table, scoped to `business_id`
- RBAC with 5 roles and 26 granular permissions
- Audit logging for all data operations
- Service role key for server-side operations only

---

## 7. Future Roadmap

### Phase 2: Core Features
- Contact CRUD with import/export (CSV)
- WhatsApp Business API integration
- Real-time conversation inbox
- Campaign scheduling and sending engine
- Segment builder with live preview
- Staff performance dashboards

### Phase 3: Advanced Features
- A/B campaign testing
- AI-powered reply suggestions
- Automated opt-in flows
- Custom webhook integrations
- Scheduled report generation

### Phase 4: Multi-Tenant SaaS
- Multi-business management console
- Stripe billing and usage metering
- White-label support
- API key management for third-party access
