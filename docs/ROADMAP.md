# Development Roadmap

## Phase 1: Foundation (Current)

**Goal:** Production-ready architecture with core modules

- [x] Project initialization (Next.js, TypeScript, Tailwind)
- [x] Enterprise folder structure
- [x] Database schema and migrations
- [x] Supabase client configuration (browser, server, admin, middleware)
- [x] Authentication pages (login, register, forgot password)
- [x] Dashboard layout (sidebar, navbar, responsive shell)
- [x] UI design system (Button, Badge, Avatar, Spinner, Skeleton)
- [x] Data display components (StatCard, EmptyState)
- [x] Full page shells for all 10 modules
- [x] Route protection middleware
- [x] RBAC permissions system
- [x] Zod validation schemas
- [x] Architecture documentation

## Phase 2: Core Features

**Goal:** Fully functional communication platform

- [ ] Guest CRM (CRUD, import/export, search, filtering)
- [ ] WhatsApp integration (Business API, webhooks, templates)
- [ ] Conversation view (real-time messaging, quick replies)
- [ ] Campaign engine (create, schedule, send, track)
- [ ] Segment builder (rule-based criteria, preview count)
- [ ] Staff management (invite, roles, permissions matrix)
- [ ] Dashboard (real-time KPIs, activity feed)
- [ ] Analytics (charts, reports, export)

## Phase 3: Enterprise Features

**Goal:** Advanced capabilities for large-scale use

- [ ] PMS integration (Oracle Opera, Maestro, Cloudbeds, etc.)
- [ ] Automated check-in/check-out messaging
- [ ] AI-powered reply suggestions
- [ ] Smart segmentation (behavioral, predictive)
- [ ] A/B campaign testing
- [ ] Custom dashboard builder
- [ ] Scheduled report generation (PDF, CSV)
- [ ] Bulk messaging with throttling

## Phase 4: Multi-Tenant SaaS

**Goal:** Platform ready for multi-property and multi-business

- [ ] Multi-property management console
- [ ] Usage metering and billing
- [ ] Stripe integration (subscriptions, invoices)
- [ ] White-label support (custom domains, branding)
- [ ] Team collaboration (shared inbox, notes, assignments)
- [ ] Webhook system (integrations marketplace)
- [ ] API key management for third-party access
- [ ] SLA monitoring and uptime dashboards

## Phase 5: Scale & Optimize

**Goal:** Enterprise-grade performance and reliability

- [ ] Database read replicas for analytics
- [ ] Edge Functions for campaign sending
- [ ] CDN for media delivery
- [ ] Performance monitoring (DataDog/PostHog)
- [ ] Automated backup and disaster recovery
- [ ] GDPR compliance tools
- [ ] SOC 2 preparation
- [ ] Global CDN deployment

---

## Coding Standards

### Naming Conventions

| Category | Convention | Example |
|----------|-----------|---------|
| Components | PascalCase | `Button`, `StatCard` |
| Functions | camelCase | `formatDate()`, `useAuth()` |
| Files (components) | PascalCase | `Button.tsx` |
| Files (utilities) | camelCase | `format.ts` |
| Types/Interfaces | PascalCase | `GuestInput`, `ApiResponse` |
| Enums | PascalCase | `CampaignStatus` |
| Constants | UPPER_SNAKE | `APP_NAME`, `SIDEBAR_WIDTH` |
| CSS classes | kebab-case | `rounded-xl`, `text-muted` |
| Database columns | snake_case | `full_name`, `property_id` |

### TypeScript Guidelines

- Strict mode enabled
- No `any` — use `unknown` and type guards
- Prefer `interface` for public APIs, `type` for unions
- Use `const` assertions for literal types
- Export types from barrel files (`index.ts`)

### Component Guidelines

- Server Components by default, `"use client"` when needed
- Props interfaces prefixed with component name
- Use `cn()` for className merging
- Forward refs on interactive components
- Accessibility: focus-visible, aria labels, keyboard nav

### Git Workflow

- Feature branches from `main`
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`
- PRs require review
- Squash merge to main
- Semantic versioning for releases
