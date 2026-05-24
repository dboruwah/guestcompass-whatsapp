import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * Campaign Analytics API (Indian Market)
 * GET /api/campaigns/:id/analytics - Detailed campaign stats with INR/IST
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string }

  if (req.method !== 'GET') return res.status(405).end()

  const analytics = {
    campaign_id: id,
    locale: 'en-IN',
    timezone: 'Asia/Kolkata (IST)',
    generated_at: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    summary: {
      total_recipients: 1000,
      sent: 950,
      delivered: 920,
      read: 750,
      replied: 45,
      failed: 30,
      pending: 50,
    },
    rates: {
      delivery_rate: 96.8,
      read_rate: 81.5,
      reply_rate: 4.9,
      failure_rate: 3.2,
    },
    timeline: [
      { timestamp: new Date(Date.now() - 60000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), sent: 100, delivered: 98, read: 75 },
      { timestamp: new Date(Date.now() - 120000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), sent: 150, delivered: 145, read: 110 },
      { timestamp: new Date(Date.now() - 180000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), sent: 200, delivered: 195, read: 160 },
      { timestamp: new Date(Date.now() - 240000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), sent: 250, delivered: 240, read: 185 },
      { timestamp: new Date(Date.now() - 300000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), sent: 250, delivered: 240, read: 220 },
    ],
    top_responses: [
      'Thanks for the offer!',
      'When is this available?',
      'Kitne ka hai?',
      'How much does it cost?',
      'Send more details',
    ],
    response_time_stats: {
      avg_minutes: 12.5,
      median_minutes: 8,
      p95_minutes: 45,
    },
    revenue: {
      total: 45000,
      currency: 'INR',
      formatted: '₹45,000.00',
      conversions: 45,
      avg_order_value: 1000,
    },
  }

  res.status(200).json(analytics)
}
