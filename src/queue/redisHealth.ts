import IORedis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL || process.env.REDIS_URI || process.env.REDIS

export async function checkRedis() {
  if (!REDIS_URL) return { ok: false, error: 'REDIS_URL not set' }
  const r = new IORedis(REDIS_URL)
  try {
    const pong = await r.ping()
    await r.quit()
    return { ok: pong === 'PONG' }
  } catch (err: any) {
    try {
      await r.disconnect()
    } catch (e) {}
    return { ok: false, error: err.message }
  }
}
