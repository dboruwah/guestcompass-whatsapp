import React, { useEffect, useState } from 'react'

export default function QueueMonitorPage() {
  const [pending, setPending] = useState<any[]>([])

  async function load() {
    const r = await fetch('/api/queue/pending')
    const j = await r.json()
    setPending(j.pending || [])
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>Queue Monitor</h1>
      <p>Pending jobs: {pending.length}</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Campaign</th>
            <th>Payload</th>
          </tr>
        </thead>
        <tbody>
          {pending.map((p: any) => (
            <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{p.id}</td>
              <td>{p.job_type}</td>
              <td>{p.campaign_id}</td>
              <td><pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(p.payload)}</pre></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
