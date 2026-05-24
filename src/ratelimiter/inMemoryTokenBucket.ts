type Bucket = {
  capacity: number
  tokens: number
  refillRatePerSec: number
  lastRefill: number
}

export class InMemoryTokenBucket {
  private buckets: Map<string, Bucket> = new Map()

  ensureBucket(key: string, capacity = 20, refillRatePerSec = 20) {
    if (!this.buckets.has(key)) {
      this.buckets.set(key, { capacity, tokens: capacity, refillRatePerSec, lastRefill: Date.now() })
    }
    return this.buckets.get(key)!
  }

  private refill(bucket: Bucket) {
    const now = Date.now()
    const elapsed = (now - bucket.lastRefill) / 1000
    if (elapsed <= 0) return
    const toAdd = elapsed * bucket.refillRatePerSec
    bucket.tokens = Math.min(bucket.capacity, bucket.tokens + toAdd)
    bucket.lastRefill = now
  }

  /**
   * Try to remove tokens immediately. Returns true if tokens were consumed.
   * If not enough tokens, returns false and the suggested wait ms until next token available.
   */
  tryConsume(key: string, tokens = 1, capacity = 20, refillRatePerSec = 20): { allowed: boolean; waitMs?: number } {
    const b = this.ensureBucket(key, capacity, refillRatePerSec)
    this.refill(b)
    if (b.tokens >= tokens) {
      b.tokens -= tokens
      return { allowed: true }
    }
    // Compute wait time for tokens to refill
    const needed = tokens - b.tokens
    const secs = needed / b.refillRatePerSec
    return { allowed: false, waitMs: Math.ceil(secs * 1000) }
  }
}

export const tokenBucket = new InMemoryTokenBucket()
