// API key gate + rate limiting (100 req/day)
// Uses Upstash Redis REST API directly — no npm package needed
// Gracefully degrades: if env vars not set, just validates the key (no count enforcement)

const DAILY_LIMIT = 100;

async function redisIncr(key) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null; // Redis not configured — skip counting

  try {
    const res = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([
        ['INCR', key],
        ['EXPIRE', key, 86400],
      ]),
    });
    const data = await res.json();
    // Pipeline returns [[null, count], [null, 1]]
    return data?.[0]?.[1] ?? null;
  } catch {
    return null; // Redis error — don't block the request
  }
}

/**
 * Call at the top of every API handler that should be rate-limited.
 * Returns true  → request is allowed, continue
 * Returns false → response already sent (401 or 429), handler must return
 *
 * Normal website traffic (no x-api-key header) always passes through.
 */
export async function checkApiKey(req, res) {
  const key = (req.headers['x-api-key'] || '').trim();

  // No key = normal website visitor → always allow
  if (!key) return true;

  const validKey = process.env.FRIEND_API_KEY;
  if (!validKey || key !== validKey) {
    res.status(401).json({ error: 'Invalid API key.' });
    return false;
  }

  // Valid key — check daily quota
  const today = new Date().toISOString().slice(0, 10); // e.g. "2026-06-30"
  const rKey  = `xkor:rl:${today}`;
  const count = await redisIncr(rKey);

  if (count !== null) {
    res.setHeader('X-RateLimit-Limit',     String(DAILY_LIMIT));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, DAILY_LIMIT - count)));
    res.setHeader('X-RateLimit-Reset',     'midnight UTC');

    if (count > DAILY_LIMIT) {
      res.status(429).json({
        error:    'Rate limit exceeded.',
        limit:    DAILY_LIMIT,
        used:     count,
        resetsAt: 'midnight UTC',
      });
      return false;
    }
  }

  return true;
}
