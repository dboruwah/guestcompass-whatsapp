// Redis token bucket - only loaded when REDIS_URL is set
// Uses Lua script for atomic token consumption

export async function tryConsumeRedis(key: string, tokens = 1, capacity = 50, refillRatePerSec = 50) {
  // Only attempt Redis if URL is configured
  if (!process.env.REDIS_URL && !process.env.REDIS_URI && !process.env.REDIS) {
    return { allowed: false, waitMs: 0 } // fallback
  }
  
  try {
    const IORedis = (await import('ioredis')).default
    const redisUrl = (process.env.REDIS_URL || process.env.REDIS_URI || process.env.REDIS || '') as string
    const r = new IORedis(redisUrl)
    const now = Date.now()
    
    const LUA_TRY_CONSUME = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local capacity = tonumber(ARGV[2])
local refill = tonumber(ARGV[3])
local tokens = tonumber(ARGV[4])
local last = redis.call('HMGET', key, 'tokens', 'last')
local curr_tokens = tonumber(last[1]) or capacity
local last_refill = tonumber(last[2]) or now
local delta = math.max(0, now - last_refill)
local add = math.floor(delta * refill / 1000)
curr_tokens = math.min(capacity, curr_tokens + add)
if curr_tokens >= tokens then
  curr_tokens = curr_tokens - tokens
  redis.call('HMSET', key, 'tokens', curr_tokens, 'last', now)
  redis.call('PEXPIRE', key, 86400000)
  return {1, 0}
else
  local need = tokens - curr_tokens
  local wait_ms = math.ceil(need * 1000 / refill)
  return {0, wait_ms}
end
`
    const res = (await r.eval(LUA_TRY_CONSUME, 1, `tokenbucket:${key}`, now, capacity, refillRatePerSec, tokens)) as [number, number]
    await r.quit()
    return { allowed: res[0] === 1, waitMs: res[1] }
  } catch (err) {
    console.warn('Redis token bucket error, returning fallback', err)
    return { allowed: true, waitMs: 0 } // fallback: allow
  }
}

