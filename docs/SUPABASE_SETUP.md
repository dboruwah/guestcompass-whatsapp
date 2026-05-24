# Supabase Configuration Guide

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Sign up or log in
3. Click "New Project"
   - Name: `guestcompass` (or your project name)
   - Database Password: (generate strong password)
   - Region: (pick closest to you)
4. Wait for project to initialize (5-10 minutes)

## Step 2: Get Your Credentials

1. Go to Settings > API
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY`

3. Go to Settings > Database
   - **Connection String** (note for later migrations)
   - **Password** (what you set during creation)

## Step 3: Update .env.local

Edit `C:\Whatsapp API\.env.local`:

```env
# Supabase (REPLACE WITH YOUR CREDENTIALS)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=GuestCompass

# Webhooks
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-webhook-token

# Redis (optional for production)
# REDIS_URL=redis://localhost:6379
```

## Step 4: Run Database Migrations

The app has pre-built migrations in `supabase/migrations/`:

### Option A: Via Supabase CLI (Recommended)

```bash
npm install -g supabase
supabase link --project-ref your-project-ref
supabase migration list
supabase db push
```

### Option B: Manual SQL in Supabase Dashboard

1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Copy and paste content from each file:
   - `supabase/migrations/00001_initial_schema.sql`
   - `supabase/migrations/00002_messaging_infra.sql`
   - `supabase/migrations/00003_atomic_counters_and_events.sql`
4. Run each one in order

### What Gets Created:

```sql
-- Authentication
auth.users (Supabase built-in)

-- Core tables
public.profiles
public.businesses
public.contacts
public.campaigns
public.broadcast_templates

-- Messaging infrastructure
public.message_queue        (job queue)
public.campaign_runs        (campaign execution tracking)
public.campaign_recipients  (per-recipient tracking)
public.message_events       (event log for analytics)
public.delivery_logs        (raw delivery tracking)
public.webhook_events       (raw webhook ingestion)
public.template_library     (message templates)

-- Functions
increment_campaign_counters() (atomic counter updates)
```

## Step 5: Create Demo Data (Optional)

```sql
-- Insert test business
INSERT INTO public.businesses (id, name, phone_number, website)
VALUES ('demo-biz-1', 'Demo Hotel', '+1234567890', 'https://example.com')
ON CONFLICT DO NOTHING;

-- Insert test contacts
INSERT INTO public.contacts (id, business_id, phone, name, email)
VALUES
  ('contact-1', 'demo-biz-1', '+1234567891', 'John Doe', 'john@example.com'),
  ('contact-2', 'demo-biz-1', '+1234567892', 'Jane Smith', 'jane@example.com'),
  ('contact-3', 'demo-biz-1', '+1234567893', 'Bob Wilson', 'bob@example.com')
ON CONFLICT DO NOTHING;

-- Insert test campaign
INSERT INTO public.campaigns (id, business_id, name, status, template_id)
VALUES ('campaign-1', 'demo-biz-1', 'Welcome Campaign', 'draft', NULL)
ON CONFLICT DO NOTHING;
```

## Step 6: Restart Development Server

```bash
npm run dev
```

The app will now:
1. ✅ Use real Supabase for auth
2. ✅ Persist campaigns, contacts, deliveries to real database
3. ✅ Show real data in dashboard
4. ✅ Save queue jobs and events

## Step 7: Verify Connection

Go to http://localhost:3000/login and:

1. If you have real Supabase creds → see actual login form
2. Try to create a real account or log in
3. Go to broadcasts → see empty list (no campaigns yet)
4. Create a test campaign
5. Dispatch it to see jobs in real queue

## Troubleshooting

### "NEXT_PUBLIC_SUPABASE_URL not configured"

- Check your .env.local file exists
- Make sure it has the correct URL
- Restart dev server after changing .env

### "Invalid API Key"

- Copy the anon key (public, not the service role)
- Make sure it's the full key from Settings > API

### "Service role key not found"

- This is only needed for server-side operations
- Make sure SUPABASE_SERVICE_ROLE_KEY is in .env.local
- Never commit this to version control!

### Migrations Failed

1. Check the error message in Supabase
2. Each table might already exist → use `IF NOT EXISTS`
3. Or reset database: Settings > Danger Zone > Reset Database (⚠️ deletes all data)

## Environment Variables Checklist

```
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ NEXT_PUBLIC_APP_URL
✅ NEXT_PUBLIC_APP_NAME
⏳ REDIS_URL (optional for production)
⏳ WHATSAPP_WEBHOOK_VERIFY_TOKEN (optional for webhooks)
```

## Next Steps

- Continue with deployment (Step 4)
- Or test workflows against real database
- Or set up webhooks integration
