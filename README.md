# Passport Bre-B DYNAMIC QR Spike

Minimal Node.js (native) spike that exposes a single endpoint `POST /payments` to generate Passport Bre-B **DYNAMIC QR** codes.

## Quick start

```bash
npm install
cp .env.example .env
# Fill .env with your Passport credentials and static IDs (see below)
npm run dev
```

## Static data setup

The service requires these **bootstrap once per environment** values to create DYNAMIC QR codes:

| Variable | Description |
|----------|-------------|
| `PASSPORT_CUSTOMER_ID` | Customer ID from Passport (create via Postman) |
| `PASSPORT_ACCOUNT_ID` | Account ID (optional; used for key discovery) |
| `PASSPORT_KEY_ID` | Key ID from `POST /v1/account_keys` (breb_key) |

**How to obtain them:**

1. Use Postman to call Passport APIs:
   - Create customer → get `customer_id`
   - Create account → get `account_id`
   - Create account key (`POST /v1/account_keys`) → get `key_id` (e.g. `bb0666bb-ffe7-4985-b2d6-b312a44f315a`)

2. Set them either:
   - **Env vars** (preferred): `PASSPORT_CUSTOMER_ID`, `PASSPORT_KEY_ID`, optionally `PASSPORT_ACCOUNT_ID`
   - **File**: `storage/passport.static.json`:
     ```json
     {
       "customer_id": "...",
       "account_id": "...",
       "key_id": "..."
     }
     ```

If `key_id` is missing but `account_id` is set, the service will attempt to discover keys via `GET /v1/account_keys?account_id=...` and use the first ACTIVE key.

## Endpoint

### POST /payments

Creates a Passport Bre-B DYNAMIC QR and returns the QR artifacts.

**Request:**

```json
{
  "amount": "10000.00",
  "currency": "COP",
  "type": "DYNAMIC",
  "channel": "MPOS",
  "qrReference": "7856912312384",
  "additionalInfo": {
    "transaction_purpose": "02",
    "invoice_number": "123",
    "terminal_label": "01",
    "store_label": "sasc0193",
    "mobile_phone_number": "3503503456"
  },
  "vat": { "vat_type": "FIXED", "vat_value": "100.00", "vat_base_value": "100.0" },
  "inc": { "inc_type": "FIXED", "inc_value": "10.00" }
}
```

- `amount`, `currency`: required
- `type`: default `DYNAMIC`
- `channel`: default `MPOS`
- `qrReference`: optional; if omitted, a deterministic short reference is generated
- `vat`, `inc`: optional; if omitted, defaults are sent (Passport requires both):
  - vat: `{ vat_type: "FIXED", vat_value: "100.00", vat_base_value: "100.0" }`
  - inc: `{ inc_type: "FIXED", inc_value: "10.00" }`
- `additionalInfo`: optional; pass-through to Passport `additional_info`

**Response:**

```json
{
  "passport": {
    "qr_id": "...",
    "qr_code_reference": "...",
    "status": "ACTIVE",
    "is_paid": false
  },
  "qr": {
    "qr_code_data": "...",
    "qr_code_image_base64": "..."
  },
  "amount": { "value": "10000.00", "currency": "COP" }
}
```

## Example curl

```bash
curl -X POST http://localhost:3000/payments \
  -H "Content-Type: application/json" \
  -H "x-request-id: my-trace-123" \
  -d '{
    "amount": "10000.00",
    "currency": "COP"
  }'
```

## Project structure

```
src/
├── server.ts
├── routes/payments.routes.ts
├── controllers/payments.controller.ts
├── services/passport-payment.service.ts
├── clients/passport-api.client.ts
├── storage/static-config.store.ts
├── types/payment.types.ts
├── utils/logger.ts
├── utils/errors.ts
└── utils/qr-sanitizer.ts
```

## Tech stack

- Express
- TypeScript
- Zod (validation)
- Node 18+ fetch with AbortController
