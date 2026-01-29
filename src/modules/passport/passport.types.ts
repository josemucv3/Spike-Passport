export type PassportPaymentStatus =
  | 'pending'
  | 'processing'
  | 'authorized'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface PassportPaymentRequest {
  amount: number;
  currency: string;
  reference: string;
  description?: string;
}

export interface PassportPaymentResponse {
  id: string;
  status: PassportPaymentStatus;
  amount: number;
  currency: string;
  reference: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type PassportWebhookType =
  | 'payment.created'
  | 'payment.updated'
  | 'payment.completed'
  | 'payment.failed';

export interface PassportWebhookEvent {
  id: string;
  type: PassportWebhookType;
  data: PassportPaymentResponse;
  createdAt: string;
  signature: string;
}
