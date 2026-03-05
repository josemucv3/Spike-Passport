/**
 * Payment request and response types for Passport Bre-B DYNAMIC QR
 */

export interface CreatePaymentRequest {
  amount: string;
  currency: string;
  type?: 'DYNAMIC' | 'STATIC';
  channel?: string;
  qrReference?: string;
  additionalInfo?: Record<string, unknown>;
  vat?: Record<string, unknown>;
  inc?: Record<string, unknown>;
}

export interface PaymentResponse {
  passport: {
    qr_id: string;
    qr_code_reference: string;
    status: string;
    is_paid: boolean;
  };
  qr: {
    qr_code_data: string;
    qr_code_image_base64: string;
  };
  amount: {
    value: string;
    currency: string;
  };
}

export interface PassportStaticConfig {
  customer_id: string;
  account_id?: string;
  key_id: string;
}

export interface PassportTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  account_id?: string;
}

export interface PassportQrRequest {
  key_id: string;
  customer_id: string;
  type: string;
  channel: string;
  vat: Record<string, unknown>;
  inc: Record<string, unknown>;
  amount: { value: string; currency: string };
  qr_code_reference: string;
  additional_info?: Record<string, unknown>;
}

export interface PassportQrResponse {
  id: string;
  qr_code_reference: string;
  qr_code_data: string;
  qr_code_image?: string;
  is_paid: boolean;
  status: string;
  amount?: { value: string; currency: string };
}

export interface PassportErrorShape {
  message?: string;
  http_code?: number;
  type?: string;
  trace_id?: string;
  code?: string;
  resource?: string;
  url?: string;
}
