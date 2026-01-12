# Datos de Usuarios

Este directorio contiene los datos de pagos de cada usuario, separados por su ID de Clerk.

## Estructura

Cada usuario tiene su propio archivo JSON:
- `{userId}.json` - Contiene todos los pagos del usuario

## Formato

Cada archivo JSON contiene un array de objetos Payment:

```json
[
  {
    "id": "TRX-123456789",
    "amount": 50000,
    "currency": "COP",
    "status": "completed",
    "method": "nequi",
    "type": "gasto",
    "description": "Almuerzo",
    "category": "alimentacion",
    "createdAt": "2026-01-12T10:00:00.000Z",
    "updatedAt": "2026-01-12T10:00:00.000Z"
  }
]
```

## Seguridad

- Los archivos están excluidos del control de versiones (.gitignore)
- Cada usuario solo puede acceder a sus propios datos
- La autenticación se maneja mediante Clerk
