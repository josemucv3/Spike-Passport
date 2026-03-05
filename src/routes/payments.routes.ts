/**
 * Payments routes. Single endpoint: POST /payments
 */

import type { Router, Request, Response, NextFunction } from 'express';
import { createPaymentsController } from '../controllers/payments.controller.js';

function asyncHandler(
  fn: (req: Request, res: Response) => Promise<void>,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    fn(req, res).catch(next);
  };
}

export function registerPaymentRoutes(router: Router): void {
  router.post('/payments', asyncHandler(createPaymentsController()));
}
