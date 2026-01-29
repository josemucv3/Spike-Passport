# ✅ cURL para Crear Pago con Breb Key

## 📋 Endpoint

```
POST /api/v1/passport/payment
```

## ⚠️ IMPORTANTE - Cambios en la estructura

- `amount` ahora es un **objeto** con `value` y `currency` (no un número plano)
- `breb_key` es **obligatorio** (ya no opcional)
- `description` es **obligatorio** (ya no opcional)
- Puedes usar `individual_id` O `business_id` (al menos uno requerido)
- El response retorna tal cual la respuesta de Passport (passthrough)

## 🔥 cURL con individual_id

```bash
curl -X POST http://localhost:3000/api/v1/passport/payment \
  -H "Content-Type: application/json" \
  -d '{
    "individual_id": "ind_uuid_123",
    "account_id": "acc_uuid_456",
    "amount": {
      "value": 1200,
      "currency": "MXN"
    },
    "reference": "order-123",
    "description": "Pago de prueba con Breb Key",
    "breb_key": "breb_key_123"
  }'
```

## 🔥 cURL con business_id

```bash
curl -X POST http://localhost:3000/api/v1/passport/payment \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": "business_uuid_123",
    "account_id": "acc_uuid_456",
    "amount": {
      "value": 1200,
      "currency": "MXN"
    },
    "reference": "order-123",
    "description": "Pago de prueba con Breb Key",
    "breb_key": "breb_key_123"
  }'
```

## 📝 Campos Requeridos

- `individual_id` O `business_id` (UUID, al menos uno requerido)
- `account_id` (UUID, requerido)
- `amount` (objeto, requerido):
  - `value` (number, positivo)
  - `currency` (string, código ISO 4217: "MXN", "COP", "USD", etc.)
- `reference` (string, requerido, max 64 caracteres)
- `description` (string, requerido, max 255 caracteres)
- `breb_key` (string, requerido)

## 📝 Campos Opcionales

Ninguno. Todos los campos son requeridos.

## 🔍 Estructura del request

```json
{
  "business_id": "business_uuid_123",  // O "individual_id"
  "account_id": "acc_uuid_456",
  "amount": {
    "value": 1200,
    "currency": "MXN"
  },
  "reference": "order-123",
  "description": "Pago de prueba con Breb Key",
  "breb_key": "breb_key_123"
}
```

## 📤 Respuesta

La respuesta se devuelve **tal cual** desde Passport (passthrough), sin modificaciones:

```json
{
  "id": "payment_uuid_789",
  "status": "processing",
  "amount": {
    "value": 1200,
    "currency": "MXN"
  },
  "reference": "order-123",
  "description": "Pago de prueba con Breb Key",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:05Z"
}
```

## ❌ Errores Comunes

### 400 Bad Request
- Faltan campos requeridos
- `amount` no es un objeto
- `amount.value` no es positivo
- `amount.currency` no es código ISO 4217 válido
- No se proporcionó `individual_id` ni `business_id`
- Se proporcionaron ambos `individual_id` y `business_id` (solo uno permitido)

### 401 Unauthorized
- Token de autenticación inválido o expirado

### 404 Not Found
- El `business_id` o `individual_id` no existe
- El `account_id` no pertenece al cliente
- El `breb_key` no es válido
