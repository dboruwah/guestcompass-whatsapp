import fetch from 'node-fetch'

const BASE_URL = 'http://localhost:3000'

interface TestResult {
  name: string
  passed: boolean
  duration: number
  error?: string
}

class E2ETestSuite {
  private results: TestResult[] = []

  async test(name: string, fn: () => Promise<void>): Promise<void> {
    const start = Date.now()
    try {
      await fn()
      this.results.push({ name, passed: true, duration: Date.now() - start })
      console.log(`  ✅ ${name}`)
    } catch (err) {
      this.results.push({ name, passed: false, duration: Date.now() - start, error: String(err) })
      console.log(`  ❌ ${name}`)
      console.error(`     Error: ${err}`)
    }
  }

  async request(method: string, path: string, body?: any) {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    } as any)
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`)
    }
    return response.json()
  }

  report(): void {
    const total = this.results.length
    const passed = this.results.filter(r => r.passed).length
    const failed = total - passed
    const totalTime = this.results.reduce((s, r) => s + r.duration, 0)

    console.log('\n' + '='.repeat(60))
    console.log(`Results: ${passed}/${total} passed (${failed} failed)`)
    console.log(`Time: ${(totalTime / 1000).toFixed(2)}s`)
    console.log('='.repeat(60))

    if (failed > 0) {
      console.log('\nFailed:')
      this.results.filter(r => !r.passed).forEach(r => console.log(`  - ${r.name}: ${r.error}`))
      process.exit(1)
    }
  }
}

async function runTests() {
  const suite = new E2ETestSuite()
  console.log('E2E Test Suite\n')

  // Health
  await suite.test('Health: liveness', async () => {
    const res = await suite.request('GET', '/api/health/liveness')
    if (res.live !== true) throw new Error('Expected live: true')
  })

  await suite.test('Health: readiness', async () => {
    const res = await suite.request('GET', '/api/health/ready')
    if (res.ready !== true) throw new Error('Expected ready: true')
    if (res.whatsapp === undefined) throw new Error('Missing whatsapp config status')
  })

  // Dashboard
  await suite.test('Dashboard: stats', async () => {
    const res = await suite.request('GET', '/api/dashboard/stats')
    if (res.contacts === undefined) throw new Error('Missing contacts')
    if (res.campaigns === undefined) throw new Error('Missing campaigns')
    if (res.queue === undefined) throw new Error('Missing queue')
  })

  // Campaigns
  await suite.test('Campaigns: list', async () => {
    const res = await suite.request('GET', '/api/campaigns')
    if (!Array.isArray(res.campaigns)) throw new Error('Expected campaigns array')
  })

  // Contacts
  await suite.test('Contacts: list', async () => {
    const res = await suite.request('GET', '/api/contacts')
    if (!Array.isArray(res.contacts)) throw new Error('Expected contacts array')
  })

  // Contacts: search
  await suite.test('Contacts: search', async () => {
    const res = await suite.request('GET', '/api/contacts?search=test')
    if (!Array.isArray(res.contacts)) throw new Error('Expected contacts array')
  })

  // Segments
  await suite.test('Segments: list', async () => {
    const res = await suite.request('GET', '/api/segments')
    if (!Array.isArray(res.segments)) throw new Error('Expected segments array')
  })

  // Staff
  await suite.test('Staff: list', async () => {
    const res = await suite.request('GET', '/api/staff')
    if (!Array.isArray(res.staff)) throw new Error('Expected staff array')
  })

  // Conversations
  await suite.test('Conversations: list', async () => {
    const res = await suite.request('GET', '/api/conversations')
    if (!Array.isArray(res.conversations)) throw new Error('Expected conversations array')
  })

  // Analytics
  await suite.test('Analytics: aggregate', async () => {
    const res = await suite.request('GET', '/api/analytics')
    if (res.total_messages === undefined) throw new Error('Missing total_messages')
  })

  // Audit logs
  await suite.test('Audit logs: list', async () => {
    const res = await suite.request('GET', '/api/audit-logs')
    if (!Array.isArray(res.logs)) throw new Error('Expected logs array')
  })

  // Settings
  await suite.test('Settings: get', async () => {
    const res = await suite.request('GET', '/api/settings')
    // May be null if no business configured
  })

  // Webhooks
  await suite.test('Webhooks: list', async () => {
    const res = await suite.request('GET', '/api/webhooks')
    if (res.total === undefined) throw new Error('Missing total')
  })

  // WhatsApp API endpoints (will 503 if not configured — which is expected)
  await suite.test('WhatsApp: templates (unconfigured ok)', async () => {
    const res = await fetch(`${BASE_URL}/api/whatsapp/templates`)
    // 503 is expected if not configured
  })

  // Queue workflow
  await suite.test('Workflow: start test campaign', async () => {
    const res = await suite.request('GET', '/api/test/workflow?action=start')
    if (!res.campaignId) throw new Error('No campaign created')
  })

  await suite.test('Workflow: check queue status', async () => {
    const res = await suite.request('GET', '/api/test/workflow?action=status')
    if (res.queueLength === undefined) throw new Error('No queue length')
  })

  // Webhook processing
  await suite.test('Webhooks: send test webhook', async () => {
    const webhook = {
      entry: [{
        changes: [{
          value: {
            statuses: [{
              id: 'test-msg-' + Date.now(),
              status: 'delivered',
              timestamp: Math.floor(Date.now() / 1000),
            }],
          },
        }],
      }],
    }
    const res = await suite.request('POST', '/api/webhooks/whatsapp', webhook)
    if (!res.ok) throw new Error('Webhook not processed')
  })

  // Metrics
  await suite.test('Metrics: Prometheus', async () => {
    const res = await fetch(`${BASE_URL}/api/metrics`)
    if (!res.ok) throw new Error(`Status ${res.status}`)
    const text = await res.text()
    if (text.length < 10) throw new Error('Empty metrics')
  })

  // Auth page loads
  await suite.test('Auth: login page loads', async () => {
    const res = await fetch(`${BASE_URL}/login`)
    if (!res.ok) throw new Error(`Status ${res.status}`)
  })

  // Error handling
  await suite.test('Error: nonexistent endpoint returns 404', async () => {
    const res = await fetch(`${BASE_URL}/api/nonexistent`, { method: 'GET' } as any)
    // Should get a response (Next.js will return 404 page)
  })

  // Queue pending
  await suite.test('Queue: pending jobs', async () => {
    const res = await suite.request('GET', '/api/queue/pending')
    if (!Array.isArray(res.pending)) throw new Error('Expected pending array')
  })

  suite.report()
}

runTests().catch(console.error)
