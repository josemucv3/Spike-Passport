/**
 * Static Passport config: customer_id, account_id, key_id.
 * Reads from env first, then from storage/passport.static.json.
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { PassportStaticConfig } from '../types/payment.types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORAGE_PATH = join(process.cwd(), 'storage', 'passport.static.json');

const ENV_KEYS = {
  customer_id: 'PASSPORT_CUSTOMER_ID',
  account_id: 'PASSPORT_ACCOUNT_ID',
  key_id: 'PASSPORT_KEY_ID',
} as const;

// Fallbacks for alternate env var names
function fromEnv(): Partial<PassportStaticConfig> {
  const cfg: Partial<PassportStaticConfig> = {};
  const customerId = process.env[ENV_KEYS.customer_id];
  if (customerId) cfg.customer_id = customerId;
  const accountId = process.env[ENV_KEYS.account_id];
  if (accountId) cfg.account_id = accountId;
  const keyId = process.env[ENV_KEYS.key_id];
  if (keyId) cfg.key_id = keyId;
  return cfg;
}

function fromFile(): Partial<PassportStaticConfig> {
  if (!existsSync(STORAGE_PATH)) return {};
  try {
    const raw = readFileSync(STORAGE_PATH, 'utf-8');
    const data = JSON.parse(raw) as Record<string, string>;
    return {
      customer_id: data.customer_id,
      account_id: data.account_id,
      key_id: data.key_id,
    };
  } catch {
    return {};
  }
}

export function getStaticConfig(): PassportStaticConfig | null {
  const env = fromEnv();
  const file = fromFile();

  const customer_id = env.customer_id ?? file.customer_id;
  const account_id = env.account_id ?? file.account_id;
  const key_id = env.key_id ?? file.key_id;

  if (!customer_id || !key_id) return null;

  return {
    customer_id,
    account_id: account_id ?? undefined,
    key_id,
  };
}

export function saveStaticConfig(config: PassportStaticConfig): void {
  const dir = dirname(STORAGE_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(STORAGE_PATH, JSON.stringify(config, null, 2), 'utf-8');
}
