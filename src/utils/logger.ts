/**
 * Simple request-scoped logger. Never logs secrets.
 */

const SECRET_KEYS = ['client_secret', 'access_token', 'authorization', 'secret'];

function redact(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const lower = k.toLowerCase();
    if (SECRET_KEYS.some((s) => lower.includes(s))) {
      out[k] = '[REDACTED]';
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = redact(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export interface Logger {
  info(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
  outbound(method: string, url: string, status?: number, traceId?: string): void;
}

export function createLogger(correlationId?: string): Logger {
  const prefix = correlationId ? `[${correlationId}]` : '';

  return {
    info(msg: string, meta?: Record<string, unknown>) {
      console.log(prefix, msg, meta ? JSON.stringify(redact(meta)) : '');
    },
    error(msg: string, meta?: Record<string, unknown>) {
      console.error(prefix, msg, meta ? JSON.stringify(redact(meta)) : '');
    },
    outbound(method: string, url: string, status?: number, traceId?: string) {
      const m: Record<string, unknown> = { method, url };
      if (status != null) m.status = status;
      if (traceId) m.trace_id = traceId;
      console.log(prefix, 'outbound', JSON.stringify(m));
    },
  };
}
