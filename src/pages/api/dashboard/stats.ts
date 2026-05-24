import type { NextApiRequest, NextApiResponse } from 'next'
import { defaultQueue } from '@/queue/inMemoryQueue'
import { createAdminClient } from '@/lib/supabase/admin'

const ADMIN: any = createAdminClient()

function fmtINR(amount: number) {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const pending = defaultQueue.listPending()
  const dlq = defaultQueue.listDLQ()

  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })

  const [{ count: totalContacts }, { count: optedIn }, { count: activeCampaigns }, { count: totalCampaigns }, { count: totalSent }, { count: failed }, { data: recentLogs }] = await Promise.all([
    ADMIN.from('contacts').select('*', { count: 'exact', head: true }),
    ADMIN.from('contacts').select('*', { count: 'exact', head: true }).eq('opt_in_status', 'opted_in'),
    ADMIN.from('campaigns').select('*', { count: 'exact', head: true }).in('status', ['sending', 'scheduled']),
    ADMIN.from('campaigns').select('*', { count: 'exact', head: true }),
    ADMIN.from('campaign_recipients').select('*', { count: 'exact', head: true }).eq('status', 'sent'),
    ADMIN.from('campaign_recipients').select('*', { count: 'exact', head: true }).eq('status', 'failed'),
    ADMIN.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(10),
  ])

  const optedOut = (totalContacts ?? 0) - (optedIn ?? 0)

  const { data: revenueData } = await ADMIN.from('campaigns').select('revenue_attributed')
  const totalRevenue = (revenueData || []).reduce((sum: number, r: any) => sum + (r.revenue_attributed || 0), 0)

  const stats = {
    timestamp: now,
    timezone: 'Asia/Kolkata (IST)',
    queue: {
      pending: pending.length,
      dlq: dlq.length,
      total_processed: 0,
    },
    campaigns: {
      total: totalCampaigns ?? 0,
      active: activeCampaigns ?? 0,
      completed: (totalCampaigns ?? 0) - (activeCampaigns ?? 0),
      scheduled: 0,
    },
    messages: {
      total_sent: totalSent ?? 0,
      delivered: 0,
      read: 0,
      failed: failed ?? 0,
      delivery_rate: (totalSent ?? 0) > 0 ? Math.round(((totalSent ?? 0) - (failed ?? 0)) / (totalSent ?? 0) * 10000) / 100 : 0,
    },
    contacts: {
      total: totalContacts ?? 0,
      opted_in: optedIn ?? 0,
      opted_out: optedOut,
    },
    revenue: {
      total: totalRevenue,
      currency: 'INR',
      formatted: fmtINR(totalRevenue),
    },
    recent_activity: (recentLogs || []).map((log: any) => ({
      action: log.description || log.action,
      time: log.created_at,
      type: log.entity_type || 'general',
    })),
  }

  res.status(200).json(stats)
}
