# ✅ cURL para Crear Individuo en Passport

## 📋 Endpoint

```
POST /api/v1/passport/individuals
```

## 🔥 cURL Completo

```bash
curl -X POST http://localhost:3000/api/v1/passport/individuals \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Juan",
    "second_name": "Carlos",
    "first_last_name": "Pérez",
    "second_last_name": "González",
    "email": "juan.perez@example.com",
    "mobile_phone_number": "+573001112233",
    "identification_type": "CC",
    "identification_number": "1234567890"
  }'
```

**⚠️ NOTA:** El campo `address` NO se envía al crear el customer. Si necesitas agregar una dirección, debes hacerlo mediante un endpoint de actualización de perfil después de crear el customer.

## 📝 Campos Requeridos

- `first_name` (string, requerido)
- `first_last_name` (string, requerido)
- `second_last_name` (string, requerido)
- `email` (string, requerido, formato email válido)
- `mobile_phone_number` (string, requerido, formato internacional: +573001112233)
- `identification_type` (string, requerido): Valores válidos: `CC`, `CE`, `NUIP`, `PPT`, `PEP`, `PAS`, `TDI`
- `identification_number` (string, requerido)

## 📝 Campos Opcionales

- `second_name` (string, opcional)

**⚠️ NOTA sobre `address`:** 
El campo `address` está disponible en el DTO pero **NO se envía** a la API de Passport al crear el customer. La API de Passport no acepta este campo en el endpoint `/v1/customers`. Si necesitas agregar una dirección, debes hacerlo mediante un endpoint de actualización de perfil después de crear el customer.

## 🔄 Ejemplo Mínimo (sin campos opcionales)

```bash
curl -X POST http://localhost:3000/api/v1/passport/individuals \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "María",
    "first_last_name": "Rodríguez",
    "second_last_name": "López",
    "email": "maria.rodriguez@example.com",
    "mobile_phone_number": "+573009998877",
    "identification_type": "CC",
    "identification_number": "9876543210"
  }'
```

## ✅ Tipos de Identificación Válidos

- `CC` - Cédula de Ciudadanía
- `CE` - Cédula de Extranjería
- `NUIP` - Número Único de Identificación Personal
- `PPT` - Pasaporte
- `PEP` - Permiso Especial de Permanencia
- `PAS` - Pasaporte
- `TDI` - Tarjeta de Identidad

## ❌ Errores Comunes

### 400 Bad Request
- Campos requeridos faltantes
- Formato de email inválido
- Formato de teléfono inválido (debe ser internacional: +573001112233)
- Tipo de identificación inválido

### 401 Unauthorized
- Token de autenticación inválido o expirado
- El servicio automáticamente obtiene un nuevo token, pero si falla la autenticación, verifica las credenciales en `.env`

### 409 Conflict
- El email ya está registrado
- El número de identificación ya existe

## 📤 Respuesta Exitosa

```json
{
  "id": "ind_abc123...",
  "type": "INDIVIDUAL",
  "first_name": "Juan",
  "second_name": "Carlos",
  "first_last_name": "Pérez",
  "second_last_name": "González",
  "email": "juan.perez@example.com",
  "mobile_phone_number": "+573001112233",
  "identification_type": "CC",
  "identification_number": "1234567890",
  "status": "ACTIVE",
  "created_at": "2024-01-01T00:00:00Z"
}
```

