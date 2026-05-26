/**
 * Creates the first super admin user in Supabase.
 *
 * Usage:
 *   npm run create-admin
 *     (interactive — prompts for email, password, name)
 *
 *   EMAIL=admin@example.com PASSWORD=secret NAME=Admin npm run create-admin
 *     (non-interactive — uses env vars)
 *
 *   npm run create-admin -- --email admin@example.com --password secret --name "Admin"
 *     (non-interactive — uses CLI args)
 */
import * as fs from 'node:fs'
import * as path from 'node:path'

const envPath = path.resolve(process.cwd(), '.env.local')
try {
  const content = fs.readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
} catch { }

async function main() {
  const { createClient } = await import('@supabase/supabase-js')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase environment variables.\nSet NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  const cliArgs = parseArgs()
  let email = process.env.EMAIL || cliArgs.email || ''
  let password = process.env.PASSWORD || cliArgs.password || ''
  let fullName = process.env.NAME || cliArgs.name || ''
  let businessName = process.env.BUSINESS_NAME || cliArgs['business-name'] || 'GuestCompass'

  if (!email || !password || !fullName) {
    const readline = await import('node:readline/promises')
    const { stdin, stdout } = await import('node:process')
    const rl = readline.createInterface({ input: stdin, output: stdout })
    if (!email) email = await rl.question('Admin email: ')
    if (!password) password = await rl.question('Admin password (min 6 chars): ')
    if (!fullName) fullName = await rl.question('Full name: ')
    const biz = await rl.question(`Business name [${businessName}]: `)
    if (biz) businessName = biz
    rl.close()
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: existing } = await supabase.auth.admin.listUsers()
  const existingUser = existing?.users?.find(u => u.email === email)

  let userId: string
  if (existingUser) {
    console.log(`User ${email} already exists. Upgrading to super_admin...`)
    userId = existingUser.id
  } else {
    const { data: user, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })
    if (createErr) {
      console.error('Failed to create user:', createErr.message)
      process.exit(1)
    }
    userId = user!.user.id
    console.log(`User created: ${userId}`)
  }

  const { data: businesses } = await supabase.from('businesses').select('id, name').limit(1)
  let businessId: string

  if (businesses && businesses.length > 0) {
    businessId = businesses[0].id
    console.log(`Using existing business: ${businesses[0].name}`)
  } else {
    const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const { data: biz, error: bizErr } = await supabase
      .from('businesses')
      .insert({ name: businessName, slug })
      .select('id')
      .single()
    if (bizErr) {
      console.error('Failed to create business:', bizErr.message)
      process.exit(1)
    }
    businessId = biz!.id
    console.log(`Business created: ${businessName}`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', userId)
    .single()

  if (!profile) {
    const { error: insertErr } = await supabase.from('profiles').insert({
      id: userId,
      email,
      full_name: fullName,
      role: 'super_admin',
      business_id: businessId,
    })
    if (insertErr) {
      console.error('Failed to create profile:', insertErr.message)
      process.exit(1)
    }
  } else {
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ role: 'super_admin', full_name: fullName, business_id: businessId })
      .eq('id', userId)
    if (updateErr) {
      console.error('Failed to update profile role:', updateErr.message)
      process.exit(1)
    }
    console.log(`Profile updated: ${profile.role} -> super_admin`)
  }

  const { data: staff } = await supabase
    .from('staff')
    .select('id')
    .eq('user_id', userId)
    .eq('business_id', businessId)
    .maybeSingle()

  if (!staff) {
    const { error: staffErr } = await supabase.from('staff').insert({
      user_id: userId,
      business_id: businessId,
      role: 'super_admin',
      position: 'System Administrator',
      status: 'active',
      permissions: [],
    })
    if (staffErr) {
      console.error('Failed to create staff record:', staffErr.message)
      process.exit(1)
    }
  }

  console.log('\n✔ Admin user ready!')
  console.log(`   Email: ${email}`)
  console.log(`   Role:  super_admin`)
  console.log(`   Login: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`)
}

function parseArgs() {
  const args = process.argv.slice(2)
  const result: Record<string, string> = {}
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2)
      result[key] = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : 'true'
      if (result[key] !== 'true') i++
    }
  }
  return result
}

main().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
