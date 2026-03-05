/**
 * Orchestrates the full flow: token -> static config -> create DYNAMIC QR.
 */

import { z } from 'zod';
import { PassportApiClient, PassportApiError } from '../clients/passport-api.client.js';
import { getStaticConfig } from '../storage/static-config.store.js';
import { sanitizeQrImageBase64 } from '../utils/qr-sanitizer.js';
import { AppError } from '../utils/errors.js';
import type {
  CreatePaymentRequest,
  PaymentResponse,
  PassportQrRequest,
} from '../types/payment.types.js';
import type { Logger } from '../utils/logger.js';

const PaymentInputSchema = z.object({
  amount: z.string().min(1, 'amount is required'),
  currency: z.string().length(3, 'currency must be 3 chars'),
  type: z.enum(['DYNAMIC', 'STATIC']).default('DYNAMIC'),
  channel: z.string().default('MPOS'),
  qrReference: z.string().max(21).optional(),
  additionalInfo: z.record(z.unknown()).optional(),
  vat: z.record(z.unknown()).optional(),
  inc: z.record(z.unknown()).optional(),
});

function buildQrReference(provided?: string): string {
  if (provided && /^[0-9]+$/.test(provided) && provided.length <= 21) {
    return provided;
  }
  return Date.now().toString().slice(-12) + Math.floor(Math.random() * 1000);
}

export interface PassportPaymentServiceConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
}

export class PassportPaymentService {
  constructor(
    private readonly config: PassportPaymentServiceConfig,
    private readonly log: Logger,
  ) {}

  async execute(input: CreatePaymentRequest): Promise<PaymentResponse> {
    const parsed = PaymentInputSchema.safeParse(input);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('; ');
      throw new AppError(msg, 400);
    }

    const {
      amount,
      currency,
      type,
      channel,
      qrReference,
      additionalInfo,
      vat,
      inc,
    } = parsed.data;

    console.log('[parsed-input]', JSON.stringify(parsed.data, null, 2));

    const staticConfig = getStaticConfig();
    console.log('[static-config]', JSON.stringify(staticConfig, null, 2));

    if (!staticConfig) {
      throw new AppError(
        'Missing static Passport config: customer_id/account_id/key_id. Provide env vars (PASSPORT_CUSTOMER_ID, PASSPORT_KEY_ID) or fill storage/passport.static.json. See README.',
        400,
      );
    }

    let keyId = staticConfig.key_id;
    let accountId = staticConfig.account_id;

    const client = new PassportApiClient(
      {
        baseUrl: this.config.baseUrl,
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
      },
      this.log,
    );

    const tokenRes = await client.getToken();
    const accessToken = tokenRes.access_token;
    const { access_token: _at, ...tokenSafe } = tokenRes;
    console.log('[auth]', JSON.stringify(tokenSafe, null, 2));

    if (!keyId && accountId) {
      try {
        console.log('[client] GET /account_keys (discovery)', JSON.stringify({ account_id: accountId }, null, 2));
        const keys = await client.listAccountKeys(accountId, accessToken);
        console.log('[client] account_keys-response', JSON.stringify(keys, null, 2));
        const active = keys.find((k) => k.status === 'ACTIVE');
        if (active) {
          keyId = active.id;
          console.log('[key-discovery]', JSON.stringify({ key_id: keyId }, null, 2));
        }
      } catch (e) {
        console.log('[key-discovery-error]', JSON.stringify({ error: String(e) }, null, 2));
      }
    }

    if (!keyId) {
      throw new AppError(
        'Missing key_id. Set PASSPORT_KEY_ID in env or storage file. See README.',
        400,
      );
    }

    const qrCodeRef = buildQrReference(qrReference);

    const defaultVat = {
      vat_type: 'FIXED',
      vat_value: '100.00',
      vat_base_value: '100.0',
    };
    const defaultInc = {
      inc_type: 'FIXED',
      inc_value: '10.00',
    };

    const qrPayload: PassportQrRequest = {
      key_id: keyId,
      customer_id: staticConfig.customer_id,
      type,
      channel,
      vat: vat ? { ...defaultVat, ...vat } : defaultVat,
      inc: inc ? { ...defaultInc, ...inc } : defaultInc,
      amount: { value: amount, currency },
      qr_code_reference: qrCodeRef,
    };

    if (additionalInfo) qrPayload.additional_info = additionalInfo;

    console.log('[qr-request]', JSON.stringify(qrPayload, null, 2));

    try {
      const qrRes = await client.createQr(qrPayload, accessToken);
      console.log('[passport-qr-response]', JSON.stringify(qrRes, null, 2));
      const imageBase64 = sanitizeQrImageBase64(qrRes.qr_code_image);

      const normalized = {
        passport: {
          qr_id: qrRes.id,
          qr_code_reference: qrRes.qr_code_reference,
          status: qrRes.status ?? 'ACTIVE',
          is_paid: qrRes.is_paid ?? false,
        },
        qr: {
          qr_code_data: qrRes.qr_code_data ?? '',
          qr_code_image_base64: imageBase64,
        },
        amount: {
          value: qrRes.amount?.value ?? amount,
          currency: qrRes.amount?.currency ?? currency,
        },
      };
      console.log('[normalized-response]', JSON.stringify(normalized, null, 2));
      return normalized;
    } catch (e) {
      console.log('[error]', JSON.stringify({ message: e instanceof Error ? e.message : String(e) }, null, 2));
      if (e instanceof PassportApiError) {
        console.log('[passport-error]', JSON.stringify(e.passport, null, 2));
        throw new AppError(
          e.passport.message ?? e.message,
          e.statusCode,
          e.passport.code,
          e.passport.trace_id,
          e.passport.resource,
        );
      }
      throw e;
    }
  }
}
