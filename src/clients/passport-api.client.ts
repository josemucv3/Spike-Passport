/**
 * Passport API HTTP client. Uses fetch with AbortController.
 */

import type {
  PassportTokenResponse,
  PassportQrRequest,
  PassportQrResponse,
  PassportErrorShape,
} from '../types/payment.types.js';
import { parsePassportError } from '../utils/errors.js';
import type { Logger } from '../utils/logger.js';

export interface PassportApiClientConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  timeoutMs?: number;
}

export class PassportApiClient {
  constructor(
    private readonly config: PassportApiClientConfig,
    private readonly log: Logger,
  ) {}

  private get baseUrl(): string {
    const url = this.config.baseUrl.replace(/\/$/, '');
    return url.endsWith('/v1') ? url : `${url}/v1`;
  }

  private async fetch<T>(
    path: string,
    options: {
      method?: string;
      headers?: Record<string, string>;
      body?: unknown;
    },
  ): Promise<{ data: T; traceId?: string }> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const { method = 'GET', headers = {}, body } = options;

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.config.timeoutMs ?? 30000,
    );

    const fetchInit: RequestInit = {
      method,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body != null ? JSON.stringify(body) : undefined,
    };

    try {
      const res = await fetch(url, fetchInit);

      clearTimeout(timeout);

      const text = await res.text();
      let json: unknown = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        // non-JSON response
      }

      const traceId = (json as Record<string, unknown> | null)?.trace_id as
        | string
        | undefined;

      this.log.outbound(method, url, res.status, traceId);

      if (!res.ok) {
        const err = parsePassportError(json);
        console.log('[client] error-response', JSON.stringify({ status: res.status, ...err }, null, 2));
        throw new PassportApiError(res.status, err, json);
      }

      return { data: json as T, traceId };
    } catch (e) {
      clearTimeout(timeout);
      if (e instanceof PassportApiError) throw e;
      throw e;
    }
  }

  async getToken(): Promise<PassportTokenResponse> {
    console.log('[client] POST /iam/oauth/tokens (grant_type: client_credentials)');
    const { data } = await this.fetch<PassportTokenResponse>(
      '/iam/oauth/tokens',
      {
        method: 'POST',
        body: {
          grant_type: 'client_credentials',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        },
      },
    );
    const { access_token: _at, ...safe } = data;
    console.log('[client] token-response', JSON.stringify(safe, null, 2));
    return data;
  }

  async createQr(
    payload: PassportQrRequest,
    accessToken: string,
  ): Promise<PassportQrResponse> {
    console.log('[client] POST /qrcodes', JSON.stringify(payload, null, 2));
    const { data } = await this.fetch<PassportQrResponse>('/qrcodes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: payload,
    });
    console.log('[client] qrcodes-response', JSON.stringify(data, null, 2));
    return data;
  }

  async listAccountKeys(
    accountId: string,
    accessToken: string,
  ): Promise<{ id: string; status: string }[]> {
    const path = `/account_keys?account_id=${encodeURIComponent(accountId)}`;
    const { data } = await this.fetch<{ data?: { id: string; status: string }[] }>(
      path,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    const items: { id: string; status: string }[] = Array.isArray(data)
      ? (data as { id: string; status: string }[])
      : (data as { data?: { id: string; status: string }[] })?.data ?? [];
    return items.map((x) => ({ id: x.id, status: x.status }));
  }
}

export class PassportApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly passport: PassportErrorShape,
    public readonly raw?: unknown,
  ) {
    super(passport.message ?? `Passport API error ${statusCode}`);
    this.name = 'PassportApiError';
  }
}
