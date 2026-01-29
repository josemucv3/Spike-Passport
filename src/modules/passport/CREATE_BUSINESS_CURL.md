# ✅ cURL para Crear Business (Link a Merchant) en Passport

## ⚠️ IMPORTANTE

El endpoint `/v1/customers` con tipo `INDIVIDUAL` **NO está implementado** en Passport PaaS sandbox y retorna error 500 "Not implemented".

En su lugar, debes usar el flujo **Link a Merchant** que crea clientes tipo `BUSINESS`.

## 📋 Endpoints

### 1. Link a Merchant (Crear Business)
```
POST /api/v1/passport/business/link
```

### 2. Link Account (Vincular cuenta bancaria)
```
POST /api/v1/passport/accounts/link
```

## 🔥 Paso 1: Crear Business (Link a Merchant)

```bash
curl -X POST http://localhost:3000/api/v1/passport/business/link \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "Mi Negocio S.A.S.",
    "email": "negocio@example.com",
    "mobile_phone_number": "+573001112233",
    "identification_type": "NIT",
    "identification_number": "123456789",
    "address": {
      "line_1": "Calle 123 #45-67",
      "city": "Bogotá",
      "state": "Cundinamarca",
      "post_code": "110111",
      "country": "CO"
    },
    "merchant_category_code": "5734"
  }'
```

**Respuesta exitosa:**
```json
{
  "id": "customer_uuid_abc123...",
  "type": "BUSINESS",
  "business_name": "Mi Negocio S.A.S.",
  "email": "negocio@example.com",
  "status": "ACTIVE",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**⚠️ NOTA IMPORTANTE:** El campo `type` NO se envía en el request. El endpoint `/customers/business/link` ya es específico para BUSINESS, por lo que Passport no espera este campo en el payload.

**⚠️ IMPORTANTE:** Guarda el `id` (customer_id) de la respuesta para usarlo en el siguiente paso.

## 🔥 Paso 2: Vincular Cuenta Bancaria (Link Account)

Usa el `customer_id` obtenido en el paso anterior:

```bash
curl -X POST http://localhost:3000/api/v1/passport/accounts/link \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "customer_uuid_abc123...",
    "account_type": "ORDINARY",
    "account_number": "123456789012"
  }'
```

**Respuesta exitosa:**
```json
{
  "id": "account_uuid_xyz789...",
  "customer_id": "customer_uuid_abc123...",
  "account_type": "ORDINARY",
  "account_number": "123456789012",
  "balance": {
    "value": 0,
    "currency": "COP"
  },
  "status": "ACTIVE",
  "created_at": "2024-01-01T00:00:00Z"
}
```

## 📝 Campos Requeridos para Business

- `business_name` (string, requerido, max 255 caracteres)
- `email` (string, requerido, formato email válido)
- `mobile_phone_number` (string, requerido, formato internacional: +573001112233)
- `identification_type` (string, requerido): Solo `"NIT"` está soportado
- `identification_number` (string, requerido): NIT sin dígito verificador
- `address` (objeto, requerido):
  - `line_1` (string, requerido)
  - `city` (string, opcional)
  - `state` (string, opcional)
  - `post_code` (string, opcional)
  - `country` (string, opcional)
- `merchant_category_code` (string, requerido): Código MCC de 4 dígitos (ej: "5734")

## 📝 Campos Requeridos para Link Account

- `customer_id` (string, requerido): UUID del cliente creado en el paso 1
- `account_type` (string, requerido): Solo `"ORDINARY"` está soportado
- `account_number` (string, requerido): Número de cuenta asignado por el banco patrocinador

## 🔄 Flujo Completo

1. **Crear Business** → Obtener `customer_id`
2. **Link Account** → Usar `customer_id` para vincular cuenta → Obtener `account_id`
3. **Listo para usar**: Ahora puedes crear pagos, claves Bre-B, etc.

## 📌 Notas Importantes

- **Para personas naturales**: Si necesitas registrar una persona natural, puedes usar su nombre completo como `business_name` y su identificación personal formateada como NIT (si corresponde).
- **MCC (Merchant Category Code)**: Debe ser un código de 4 dígitos válido. Ejemplos comunes:
  - `5734` - Computadoras y software
  - `5812` - Restaurantes
  - `5999` - Otros comercios
- **Account Number**: En sandbox puedes usar números de cuenta dummy que cumplan con el formato requerido.

## ❌ Errores Comunes

### 400 Bad Request
- Campos requeridos faltantes
- Formato de email inválido
- Formato de teléfono inválido
- MCC no es de 4 dígitos
- Address.line_1 faltante

### 401 Unauthorized
- Token de autenticación inválido o expirado

### 404 Not Found (en Link Account)
- El `customer_id` no existe
- Verifica que hayas creado el business primero

### 409 Conflict
- El email ya está registrado
- El NIT ya existe

