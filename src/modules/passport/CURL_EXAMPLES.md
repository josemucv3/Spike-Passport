# Ejemplos de cURL para probar Passport Module

## Configuración base
- **Base URL**: `http://localhost:3000/api/v1`
- **Content-Type**: `application/json`

---

## 1. Crear un pago (POST /passport/payment)

```bash
curl -X POST http://localhost:3000/api/v1/passport/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1200,
    "currency": "MXN",
    "reference": "order-123",
    "description": "Pago de prueba para spike"
  }'
```

**Ejemplo con descripción opcional:**
```bash
curl -X POST http://localhost:3000/api/v1/passport/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "currency": "MXN",
    "reference": "test-ref-456"
  }'
```

**Respuesta esperada:**
```json
{
  "id": "pay_123",
  "status": "processing",
  "amount": 1200,
  "currency": "MXN",
  "reference": "order-123",
  "description": "Pago de prueba para spike",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:05Z"
}
```

---

## 2. Consultar estado de pago (GET /passport/payment/:paymentId)

```bash
curl -X GET http://localhost:3000/api/v1/passport/payment/pay_123 \
  -H "Content-Type: application/json"
```

**Ejemplo con otro ID:**
```bash
curl -X GET http://localhost:3000/api/v1/passport/payment/pay_abc456 \
  -H "Content-Type: application/json"
```

**Respuesta esperada:**
```json
{
  "id": "pay_123",
  "status": "completed",
  "amount": 1200,
  "currency": "MXN",
  "reference": "order-123",
  "description": "Pago de prueba para spike",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:05:00Z"
}
```

---

## 3. Webhook (POST /passport/webhook)

```bash
curl -X POST http://localhost:3000/api/v1/passport/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "id": "evt_123",
    "type": "payment.completed",
    "signature": "abc123signature",
    "createdAt": "2024-01-01T00:05:00Z",
    "data": {
      "id": "pay_123",
      "status": "completed",
      "amount": 1200,
      "currency": "MXN",
      "reference": "order-123",
      "description": "Pago de prueba para spike",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:05:00Z"
    }
  }'
```

**Ejemplo con evento de pago creado:**
```bash
curl -X POST http://localhost:3000/api/v1/passport/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "id": "evt_456",
    "type": "payment.created",
    "signature": "def456signature",
    "createdAt": "2024-01-01T00:00:00Z",
    "data": {
      "id": "pay_789",
      "status": "pending",
      "amount": 2500,
      "currency": "MXN",
      "reference": "order-789",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }'
```

**Ejemplo con evento de pago fallido:**
```bash
curl -X POST http://localhost:3000/api/v1/passport/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "id": "evt_789",
    "type": "payment.failed",
    "signature": "ghi789signature",
    "createdAt": "2024-01-01T00:10:00Z",
    "data": {
      "id": "pay_999",
      "status": "failed",
      "amount": 3000,
      "currency": "MXN",
      "reference": "order-999",
      "description": "Pago rechazado",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:10:00Z"
    }
  }'
```

**Respuesta esperada:**
```json
{
  "received": true
}
```

---

## Notas para Postman

1. **Importar a Postman:**
   - Copia el comando curl completo
   - En Postman: `Import` → `Raw text` → Pega el curl
   - Postman convertirá automáticamente el curl a una request

2. **Variables de entorno en Postman:**
   - Crea variables: `base_url` = `http://localhost:3000/api/v1`
   - Usa: `{{base_url}}/passport/payment`

3. **Validaciones a probar:**
   - **amount negativo** → Error 400
   - **currency inválida** → Error 400
   - **reference vacía** → Error 400
   - **reference > 64 caracteres** → Error 400
   - **description > 255 caracteres** → Error 400

---

## Ejemplos de errores esperados

**Validación fallida:**
```bash
curl -X POST http://localhost:3000/api/v1/passport/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": -100,
    "currency": "INVALID",
    "reference": ""
  }'
```

**Respuesta de error:**
```json
{
  "statusCode": 400,
  "message": [
    "amount must be a positive number",
    "currency must be a valid ISO 4217 currency code",
    "reference should not be empty"
  ],
  "error": "Bad Request"
}
```

