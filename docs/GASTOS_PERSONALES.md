# Módulo de Gastos Personales

## Descripción

Aplicación personal para controlar gastos e ingresos en pesos colombianos (COP). Permite registrar transacciones, categorizarlas y ver estadísticas de tus finanzas personales.

## Características

### 1. **Moneda Fija: Pesos Colombianos (COP)**
- Todos los montos se manejan en pesos colombianos
- Formato de moneda localizado para Colombia (ej: $50.000)
- No es necesario seleccionar moneda, está fija en COP

### 2. **Tipos de Transacción**
- 💰 **Ingreso**: Dinero que recibes (salario, freelance, etc.)
- 💸 **Gasto**: Dinero que gastas

### 3. **Métodos de Pago Colombianos**
- 💵 Efectivo
- 💳 Tarjeta de Débito
- 💳 Tarjeta de Crédito
- 🏦 Transferencia Bancaria
- 📱 Nequi
- 📱 Daviplata
- 🔄 Otro

### 4. **Categorías de Gastos**
- 🍔 Alimentación
- 🚗 Transporte
- 💡 Servicios (luz, agua, internet, etc.)
- 🏥 Salud
- 🎮 Entretenimiento
- 📚 Educación
- 🏠 Vivienda
- 👔 Ropa
- 💻 Tecnología
- ⚽ Deporte
- 🐕 Mascotas
- 💰 Ahorro
- 📦 Otro

### 5. **Estados**
- ✅ Completado: Transacción realizada
- ⏳ Pendiente: Transacción programada o por confirmar

## Formulario de Registro

### Campos Obligatorios:
1. **Tipo**: Ingreso o Gasto
2. **Monto**: Valor en pesos colombianos
3. **Estado**: Completado o Pendiente
4. **Método**: Forma de pago utilizada
5. **Categoría**: Tipo de gasto/ingreso
6. **Descripción**: Breve descripción de la transacción

### Campos Opcionales:
- **Notas**: Información adicional sobre la transacción

## Estadísticas

El módulo muestra 5 tarjetas con información clave:

1. **Total Ingresos**: Suma de todos los ingresos completados
2. **Total Gastos**: Suma de todos los gastos completados
3. **Balance**: Diferencia entre ingresos y gastos
4. **Gastos Pendientes**: Montos de gastos aún pendientes
5. **Transacciones Completadas**: Cantidad total de transacciones realizadas

## Tabla de Transacciones

### Columnas:
- Checkbox de selección
- ID de transacción
- Tipo (Ingreso/Gasto)
- Monto en COP
- Estado
- Método de pago
- Categoría
- Descripción
- Fecha de creación
- Acciones (Ver/Editar/Eliminar)

### Filtros:
- Búsqueda por descripción o categoría
- Filtro por estado
- Filtro por tipo (ingreso/gasto)
- Filtro por método de pago

### Funcionalidades:
- Ordenamiento por columnas
- Paginación
- Selección múltiple
- Visibilidad de columnas configurable

## Uso Típico

### Registrar un Gasto:
1. Click en "Agregar Transacción"
2. Seleccionar tipo: "Gasto"
3. Ingresar monto: ej. 50000
4. Seleccionar método: ej. "Nequi"
5. Seleccionar categoría: ej. "Alimentación"
6. Descripción: ej. "Almuerzo"
7. Estado: "Completado"
8. Click en "Guardar"

### Registrar un Ingreso:
1. Click en "Agregar Transacción"
2. Seleccionar tipo: "Ingreso"
3. Ingresar monto: ej. 2500000
4. Seleccionar método: ej. "Transferencia"
5. Seleccionar categoría: ej. "Ahorro"
6. Descripción: ej. "Salario Enero"
7. Estado: "Completado"
8. Click en "Guardar"

## Datos Mock

El sistema genera 100 transacciones de ejemplo con datos realistas:
- 75% son gastos, 25% son ingresos
- Montos típicos colombianos ($5,000 - $500,000 para gastos)
- Descripciones contextualizadas según la categoría
- Fechas distribuidas en los últimos 90 días

## Acceso

- **Ruta**: `/dashboard/payments`
- **Navegación**: Sidebar > "Mis Gastos"
- **Atajo de teclado**: `g + g`

## Tecnologías

- Next.js 16 (App Router)
- React Hook Form + Zod para validación
- TanStack Table para la tabla de datos
- Shadcn/ui para componentes
- TypeScript para tipado estricto
- Mock API (listo para integrar con backend real)

## Próximos Pasos (Integración Backend)

Cuando conectes con tu backend, reemplaza en:

**`src/features/payments/api/payments-api.ts`**:
```typescript
// Cambiar de:
const payments = generateMockPayments(100);

// A llamadas HTTP reales:
const response = await fetch(`${API_URL}/transactions`);
const payments = await response.json();
```

Asegúrate que tu backend:
- Use el mismo formato de datos (ver `src/types/payment.ts`)
- Devuelva montos en formato numérico (sin formato de moneda)
- Maneje paginación, filtros y ordenamiento
- Use las mismas categorías y métodos de pago
