type RateLimitState = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

const rateLimitGlobal = globalThis as typeof globalThis & {
  __wandrlyRateLimitStore?: Map<string, RateLimitState>;
};

function getStore() {
  if (!rateLimitGlobal.__wandrlyRateLimitStore) {
    rateLimitGlobal.__wandrlyRateLimitStore = new Map<string, RateLimitState>();
  }

  return rateLimitGlobal.__wandrlyRateLimitStore;
}

export function checkRateLimit(input: {
  scope: string;
  key: string;
  limit: number;
  windowMs: number;
}): RateLimitResult {
  const store = getStore();
  const now = Date.now();
  const storageKey = `${input.scope}:${input.key}`;
  const existing = store.get(storageKey);

  if (!existing || existing.resetAt <= now) {
    store.set(storageKey, {
      count: 1,
      resetAt: now + input.windowMs,
    });

    return {
      allowed: true,
      remaining: Math.max(0, input.limit - 1),
      retryAfterSeconds: Math.ceil(input.windowMs / 1000),
    };
  }

  if (existing.count >= input.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  store.set(storageKey, existing);

  return {
    allowed: true,
    remaining: Math.max(0, input.limit - existing.count),
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}
