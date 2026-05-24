# Security Architecture

## Principles

1. **Defense in depth** — multiple layers of security
2. **Least privilege** — minimum permissions required
3. **Never trust user input** — validate, sanitize, escape
4. **Secure defaults** — everything locked down by default

## Authentication

- Supabase Auth handles password hashing (bcrypt) and session management
- HTTP-only cookies prevent XSS-based token theft
- CSRF protection via SameSite cookie policy
- Password minimum 8 characters with complexity requirements
- Rate limiting on auth endpoints (Supabase handles this)
- Session refresh via middleware on every request

## Authorization

### Database Layer (RLS)
- Every table has RLS enabled
- Policies check `auth.uid()` against profile property_id
- Property-scoped: users can only access data belonging to their property
- Role-based: some operations require specific roles

### Application Layer
- Route groups separate public vs. protected pages
- Middleware checks authentication before rendering
- Future: permission-based UI rendering using `hasPermission()`

## Environment Variables

| Variable | Exposure | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Anonymous API key (RLS-protected) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | Admin operations, bypasses RLS |
| `NEXT_PUBLIC_APP_URL` | Public | Application base URL |

## Data Protection

- All data encrypted in transit (TLS)
- Passwords never logged or stored in plaintext
- PII (email, phone, name) protected by RLS — only staff in the same property can access
- Audit logs track all data access and modifications
- Future: data retention policies, GDPR compliance, data export/deletion

## API Security

- API routes validate session via Supabase server client
- Input validation using Zod schemas
- CORS restricted to application origin
- Rate limiting via Supabase or Vercel WAF
