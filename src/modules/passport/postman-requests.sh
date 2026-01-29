#!/bin/bash
# Ejemplos de cURL para probar el módulo Passport
# Base URL: http://localhost:3000/api/v1

echo "=== 1. Crear un pago ==="
curl -X POST http://localhost:3000/api/v1/passport/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1200,
    "currency": "MXN",
    "reference": "order-123",
    "description": "Pago de prueba"
  }'

echo -e "\n\n=== 2. Consultar estado de pago (reemplaza pay_123 con un ID real) ==="
curl -X GET http://localhost:3000/api/v1/passport/payment/pay_123 \
  -H "Content-Type: application/json"

echo -e "\n\n=== 3. Webhook - Payment Completed ==="
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

echo -e "\n\n=== 4. Webhook - Payment Created ==="
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

