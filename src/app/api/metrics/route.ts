import { NextResponse } from "next/server"
import client from "prom-client"

const register = client.register

try {
  client.collectDefaultMetrics({ register })
} catch {
  // Already registered in dev hot-reload
}

export async function GET() {
  try {
    const metrics = await register.metrics()
    return new NextResponse(metrics, {
      headers: { "Content-Type": register.contentType },
    })
  } catch (error) {
    return NextResponse.json({ error: "failed to collect metrics" }, { status: 500 })
  }
}
