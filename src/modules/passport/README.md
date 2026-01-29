### Passport Module (Spike)

Este módulo implementa un Spike técnico para integrar el ecosistema Bre-B con el proveedor Passport PaaS usando NestJS.

#### Endpoints

**Autenticación:**
- `GET /api/v1/passport/auth/token` - Obtiene el access token de Passport (OAuth2)

**Clientes:**
- `POST /api/v1/passport/business/link` - Crea/vincula un cliente tipo BUSINESS (Link a Merchant)
- `POST /api/v1/passport/accounts/link` - Vincula una cuenta bancaria a un cliente existente
- `POST /api/v1/passport/individuals` - ⚠️ Deprecated: No implementado en Passport sandbox

**Pagos:**
- `POST /api/v1/passport/payment/simulate` - Simula un pago usando OAuth token
- `POST /api/v1/passport/payment` - Crea un pago sandbox en Passport (legacy)
- `GET /api/v1/passport/payment/:paymentId` - Consulta el estado actual del pago

**Webhooks:**
- `POST /api/v1/passport/webhook` - Recibe eventos enviados por Passport

#### Cómo probar

1. Definir variables en `.env`:
   ```
   PASSPORT_API_URL=https://api.paas.sandbox.co.passportfintech.com/v1/
   PASSPORT_CLIENT_ID=tu_client_id
   PASSPORT_CLIENT_SECRET=tu_client_secret
   PASSPORT_WEBHOOK_SECRET=xxxx
   ```
2. Ejecutar la API (`npm run start:dev`) y usar herramientas como Postman/Insomnia:

   **Crear Business (Link a Merchant):**
   ```
   POST /api/v1/passport/business/link
   {
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
   }
   ```

   **Vincular cuenta bancaria:**
   ```
   POST /api/v1/passport/accounts/link
   {
     "customer_id": "customer_uuid_from_step_1",
     "account_type": "ORDINARY",
     "account_number": "123456789012"
   }
   ```

   **Obtener token de autenticación:**
   ```
   GET /api/v1/passport/auth/token
   ```
   Respuesta:
   ```json
   {
     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "message": "Token retrieved successfully"
   }
   ```

   **Crear pago (endpoint legacy actualizado):**
   ```
   POST /api/v1/passport/payment
   {
     "individual_id": "ind_123",
     "account_id": "acc_123",
     "amount": 1200,
     "currency": "MXN",
     "reference": "order-123",
     "description": "Pago de prueba",
     "recipient_id": "rec_456"
   }
   ```
   
   **Simular pago (endpoint nuevo):**
   ```
   POST /api/v1/passport/payment/simulate
   {
     "customer_type": "individual",
     "customer_id": "ind_123",
     "account_id": "acc_123",
     "amount": 1200,
     "currency": "MXN",
     "reference": "order-123",
     "description": "Pago de prueba",
     "recipient_id": "rec_456"
   }
   ```
   
   **Notas importantes:**
   - `individual_id`: ID del individuo (requerido para endpoint legacy)
   - `account_id`: ID de la cuenta (requerido)
   - `recipient_id` o `breb_key`: Debes proporcionar uno de estos dos campos
     - `recipient_id`: ID de un destinatario previamente creado
     - `breb_key`: Bre-B Key resuelto (para pagos inmediatos)

   **Consultar estado de pago:**
   ```
   GET /api/v1/passport/payment/{individual_id}/{account_id}/{paymentId}
   ```

   **Webhook:**
   ```
   POST /api/v1/passport/webhook
   {
     "id": "evt_123",
     "type": "payment.completed",
     "signature": "abc",
     "createdAt": "2024-01-01T00:00:00Z",
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
   }
   ```

#### Ejemplo de respuesta de token

```json
{
  "access_token": "17d5cc1adb6f6c90d5aa73f74b38f9fa3336d04aee6cf8121a3cf19f190e6213",
  "message": "Token retrieved successfully"
}
```

#### Ejemplo de respuesta de pago

```json
{
  "id": "pay_123",
  "status": "processing",
  "amount": {
    "value": 1200,
    "currency": "MXN"
  },
  "reference": "order-123",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:05Z"
}
```

#### Manejo de errores

- **401 Unauthorized**: Token inválido o expirado. Obtén un nuevo token.
- **403 Forbidden**: Permisos insuficientes para la operación.
- **404 Not Found**: Recurso no encontrado (cliente, cuenta o destinatario).
- **400 Bad Request**: Faltan campos requeridos o formato incorrecto.

