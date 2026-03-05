/**
 * Application and Passport error handling
 */

import type { PassportErrorShape } from '../types/payment.types.js';

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code?: string,
    public readonly traceId?: string,
    public readonly resource?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }

  toJson() {
    return {
      error: this.message,
      ...(this.code && { code: this.code }),
      ...(this.traceId && { trace_id: this.traceId }),
      ...(this.resource && { resource: this.resource }),
    };
  }
}

export function parsePassportError(body: unknown): PassportErrorShape {
  if (body && typeof body === 'object') {
    const b = body as Record<string, unknown>;
    return {
      message: typeof b.message === 'string' ? b.message : undefined,
      http_code: typeof b.http_code === 'number' ? b.http_code : undefined,
      type: typeof b.type === 'string' ? b.type : undefined,
      trace_id: typeof b.trace_id === 'string' ? b.trace_id : undefined,
      code: typeof b.code === 'string' ? b.code : undefined,
      resource: typeof b.resource === 'string' ? b.resource : undefined,
      url: typeof b.url === 'string' ? b.url : undefined,
    };
  }
  return {};
}
