/**
 * Minimal Express server. Single endpoint: POST /payments
 */

import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import { registerPaymentRoutes } from './routes/payments.routes.js';

const app = express();
app.use(express.json());

registerPaymentRoutes(app);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

const port = Number(process.env.PORT) || 3002;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
  console.log('POST /payments - Create Passport Bre-B DYNAMIC QR');
});
