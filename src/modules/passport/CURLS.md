# 🚀 cURLs para Postman - Passport Module

## 📋 Instrucciones rápidas

### Opción 1: Importar colección de Postman (RECOMENDADO)
1. Abre Postman
2. Click en `Import` (arriba izquierda)
3. Selecciona el archivo: `Passport.postman_collection.json`
4. ¡Listo! Tendrás todas las requests listas para usar

### Opción 2: Copiar y pegar cURLs individuales
Copia cualquiera de los curls de abajo y pégalo en Postman:
- `Import` → `Raw text` → Pega el curl → `Continue` → `Import`

---

## 🔥 cURLs listos para copiar

### 1️⃣ Obtener token de autenticación

```bash
curl -X GET http://localhost:3000/api/v1/passport/auth/token \
  -H "Content-Type: application/json"
```

### 2️⃣ Crear un pago (con individual_id)

```bash
curl -X POST http://localhost:3000/api/v1/passport/payment \
  -H "Content-Type: application/json" \
  -d '{
    "individual_id": "ind_123",
    "account_id": "acc_123",
    "amount": 1200,
    "currency": "MXN",
    "reference": "order-123",
    "description": "Pago de prueba",
    "recipient_id": "rec_456"
  }'
```

### 2️⃣b Crear un pago (con business_id)

```bash
curl -X POST http://localhost:3000/api/v1/passport/payment \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": "business_uuid_123",
    "account_id": "acc_123",
    "amount": 1200,
    "currency": "MXN",
    "reference": "order-123",
    "description": "Pago de prueba",
    "recipient_id": "rec_456"
  }'
```

**Con Bre-B Key (alternativa a recipient_id):**
```bash
curl -X POST http://localhost:3000/api/v1/passport/payment \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": "business_uuid_123",
    "account_id": "acc_123",
    "amount": 1200,
    "currency": "MXN",
    "reference": "order-123",
    "description": "Pago de prueba",
    "breb_key": "breb_key_123"
  }'
```

**⚠️ NOTA:** Debes proporcionar **solo uno** de estos campos:
- `individual_id` → Usa endpoint `/v1/individuals/{individual_id}/accounts/{account_id}/payments`
- `business_id` → Usa endpoint `/v1/businesses/{business_id}/accounts/{account_id}/payments`

### 3️⃣ Consultar estado de pago

```bash
curl -X GET http://localhost:3000/api/v1/passport/payment/ind_123/acc_123/pay_123 \
  -H "Content-Type: application/json"
```

**Nota:** Reemplaza `pay_123` con el ID real que obtengas del endpoint de crear pago.

### 4️⃣ Simular pago (endpoint nuevo)

```bash
curl -X POST http://localhost:3000/api/v1/passport/payment/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "customer_type": "individual",
    "customer_id": "ind_123",
    "account_id": "acc_123",
    "amount": 1200,
    "currency": "MXN",
    "reference": "order-123",
    "description": "Pago de prueba",
    "recipient_id": "rec_456"
  }'
```

### 5️⃣ Webhook - Payment Completed

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
      "description": "Pago de prueba",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:05:00Z"
    }
  }'
```

### 4️⃣ Webhook - Payment Created

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

### 5️⃣ Webhook - Payment Failed

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

### 6️⃣ Crear pago (sin descripción)

```bash
curl -X POST http://localhost:3000/api/v1/passport/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "currency": "MXN",
    "reference": "test-ref-456"
  }'
```

---

## ⚠️ Validaciones a probar (deberían fallar)

### ❌ Amount negativo
```bash
curl -X POST http://localhost:3000/api/v1/passport/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": -100,
    "currency": "MXN",
    "reference": "test"
  }'
```

### ❌ Currency inválida
```bash
curl -X POST http://localhost:3000/api/v1/passport/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "currency": "INVALID",
    "reference": "test"
  }'
```

### ❌ Reference vacía
```bash
curl -X POST http://localhost:3000/api/v1/passport/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "currency": "MXN",
    "reference": ""
  }'
```

---

## 📝 Notas

- **Puerto:** Por defecto es `3000`, si cambias el PORT en `.env`, ajusta los curls
- **Base URL:** `http://localhost:3000/api/v1`
- **Headers:** Todos usan `Content-Type: application/json`

