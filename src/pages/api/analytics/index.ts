import type { NextApiRequest, NextApiResponse } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

const ADMIN: any = createAdminClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const [totalMsg, delivered, read, replied, conversions, totalContacts, totalRevenue, campaignCount] = await Promise.all([
    ADMIN.from('campaign_recipients').select('*', { count: 'exact', head: true }),
    ADMIN.from('campaign_recipients').select('*', { count: 'exact', head: true }).eq('status', 'delivered'),
    ADMIN.from('campaign_recipients').select('*', { count: 'exact', head: true }).eq('status', 'read'),
    ADMIN.from('campaigns').select('*', { count: 'exact', head: true }),
    ADMIN.from('campaigns').select('*', { count: 'exact', head: true }),
    ADMIN.from('contacts').select('*', { count: 'exact', head: true }).eq('opt_in_status', 'opted_in'),
    ADMIN.from('campaigns').select('revenue_attributed'),
    ADMIN.from('campaigns').select('*', { count: 'exact', head: true }),
  ])

  const sent = totalMsg?.count ?? 0
  const del = delivered?.count ?? 0
  const rd = read?.count ?? 0
  const totalConv = campaignCount?.count ?? 0
  const activeContacts = totalContacts?.count ?? 0
  const revenueRows = totalRevenue?.data || []
  const revenue = revenueRows.reduce((s: number, r: any) => s + (r.revenue_attributed || 0), 0)

  const deliveryRate = sent > 0 ? +((del / sent) * 100).toFixed(1) : 0
  const readRate = del > 0 ? +((rd / del) * 100).toFixed(1) : 0

  res.status(200).json({
    total_messages: sent,
    delivery_rate: deliveryRate,
    read_rate: readRate,
    active_contacts: activeContacts,
    total_campaigns: totalConv,
    total_revenue: revenue,
    revenue_formatted: `₹${revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    generated_at: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  })
}
