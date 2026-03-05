/**
 * Payments route handler. Single endpoint: POST /payments
 */

import type { Request, Response } from 'express';
import { PassportPaymentService } from '../services/passport-payment.service.js';
import { AppError } from '../utils/errors.js';
import { createLogger } from '../utils/logger.js';

function getCorrelationId(req: Request): string {
  const id =
    (req.headers['x-request-id'] as string) ??
    `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return id;
}

export function createPaymentsController(): (
  req: Request,
  res: Response,
) => Promise<void> {
  const baseUrl =
    process.env.PASSPORT_BASE_URL ??
    process.env.PASSPORT_API_URL?.replace(/\/v1\/?$/, '') ??
    'https://api.paas.sandbox.co.passportfintech.com';
  const clientId = process.env.PASSPORT_CLIENT_ID ?? process.env.PASSPORT_API_KEY ?? '';
  const clientSecret = process.env.PASSPORT_CLIENT_SECRET ?? process.env.SECRET_API_KEY ?? '';

  return async (req: Request, res: Response) => {
    const correlationId = getCorrelationId(req);
    const log = createLogger(correlationId);

    try {
      const body = req.body as Record<string, unknown>;
      console.log('[request]', JSON.stringify({ body, correlationId }, null, 2));
      const service = new PassportPaymentService(
        { baseUrl, clientId, clientSecret },
        log,
      );

      const result = await service.execute(body as unknown as Parameters<typeof service.execute>[0]);
      console.log('[response]', JSON.stringify(result, null, 2));
      res.status(200).json(result);
    } catch (e) {
      if (e instanceof AppError) {
        res.status(e.statusCode).json(e.toJson());
        return;
      }
      log.error('Unhandled error', { error: String(e) });
      res.status(500).json({
        error: 'Internal server error',
        trace_id: correlationId,
      });
    }
  };
}
