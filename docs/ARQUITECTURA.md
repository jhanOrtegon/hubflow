# 📐 Documentación de Arquitectura

## 🎯 Visión General

Este proyecto es un **dashboard administrativo frontend** construido con **Next.js 16 (App Router)**, **Shadcn UI** y **TypeScript**. Está diseñado como una plantilla starter para aplicaciones SaaS, herramientas internas y paneles de administración empresariales.

> **⚠️ Nota Importante**: Este es el **repositorio frontend**. El backend/API REST está en un repositorio separado, permitiendo una arquitectura desacoplada y escalable.

### Características Principales
- ✅ Arquitectura basada en **features** para escalabilidad
- ✅ Sistema de **autenticación** y organizaciones multi-tenant con Clerk
- ✅ **RBAC** (Control de Acceso Basado en Roles) completamente client-side
- ✅ Componentes de UI reutilizables con Shadcn UI
- ✅ Manejo de estado con Zustand
- ✅ Tablas de datos con filtrado y paginación server-side
- ✅ Sistema de temas (light/dark/custom)
- ✅ Monitoreo de errores con Sentry
- ✅ **Arquitectura desacoplada** - Frontend independiente del backend

---

## � Arquitectura Frontend/Backend Separada

### Diagrama de Arquitectura

```
┌────────────────────────────────────────────────────┐
│                  FRONTEND (Este Repo)              │
├────────────────────────────────────────────────────┤
│  Next.js 16 App Router                             │
│  • Server Components (SSR)                         │
│  • Client Components (CSR)                         │
│  • Server Actions (Form handling)                  │
│  • Middleware (Auth, redirects)                    │
└────────────────┬───────────────────────────────────┘
                 │
                 │ HTTP/HTTPS
                 │ REST API calls
                 │ JWT/Bearer tokens
                 │
┌────────────────▼───────────────────────────────────┐
│              BACKEND (Repo Separado)               │
├────────────────────────────────────────────────────┤
│  API REST                                          │
│  • Autenticación & JWT                             │
│  • Business Logic                                  │
│  • Database (PostgreSQL/MySQL/MongoDB)             │
│  • File Storage                                    │
│  • Background Jobs                                 │
│  • Webhooks                                        │
└────────────────────────────────────────────────────┘
```

### Ventajas de Esta Arquitectura

#### ✅ **Escalabilidad Independiente**
- Frontend y Backend pueden escalar por separado
- Deploy independiente sin afectar el otro
- Diferentes estrategias de caching

#### ✅ **Tecnologías Especializadas**
- Frontend: Optimizado para UI/UX (Next.js, React)
- Backend: Optimizado para lógica de negocio (Node, Python, Go, etc.)

#### ✅ **Equipos Independientes**
- Team Frontend puede iterar rápido en UI
- Team Backend puede refactorizar sin romper frontend
- Contratos claros via API specs (OpenAPI/Swagger)

#### ✅ **Multi-Plataforma**
- Mismo backend puede servir:
  - Web app (este dashboard)
  - Mobile apps (React Native, Flutter)
  - Desktop apps (Electron)
  - Third-party integrations

#### ✅ **Seguridad Mejorada**
- Backend protegido, no expuesto directamente
- Frontend solo hace requests autorizados
- Separación de secrets y variables de entorno

### Desafíos y Soluciones

| Desafío | Solución Implementada |
|---------|----------------------|
| **CORS** | Backend debe configurar CORS para permitir el dominio del frontend |
| **Type Safety** | Compartir types via npm package privado o generarlos desde OpenAPI |
| **Auth Tokens** | Clerk maneja tokens JWT automáticamente en requests |
| **Error Handling** | Sentry en ambos lados para tracking completo |
| **Testing** | Contract testing con Pact o MSW para mock del backend |

### Flujo de Comunicación

#### 1. **Autenticación**
```typescript
// Frontend (Next.js)
import { auth } from '@clerk/nextjs';

export async function getProducts() {
  const { getToken } = auth();
  const token = await getToken();
  
  const response = await fetch(`${process.env.API_URL}/products`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
}
```

#### 2. **Server Actions → Backend API**
```typescript
// app/actions/products.ts
'use server';

import { auth } from '@clerk/nextjs';

export async function createProduct(formData: FormData) {
  const { getToken } = auth();
  const token = await getToken();
  
  const response = await fetch(`${process.env.API_URL}/products`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Failed to create product');
  }
  
  revalidatePath('/dashboard/product');
  return response.json();
}
```

#### 3. **Client-Side Fetching**
```typescript
// features/products/hooks/use-products.ts
'use client';

import { useAuth } from '@clerk/nextjs';

export function useProducts() {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.json();
    }
  });
}
```

### Recomendaciones de Implementación

#### 1. **API Client Centralizado**
```typescript
// lib/api-client.ts
import { auth } from '@clerk/nextjs';

class ApiClient {
  private baseURL: string;
  
  constructor() {
    this.baseURL = process.env.API_URL || '';
  }
  
  async request<T>(
    endpoint: string, 
    options?: RequestInit
  ): Promise<T> {
    const { getToken } = auth();
    const token = await getToken();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }
  
  post<T>(endpoint: string, data: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  put<T>(endpoint: string, data: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
```

#### 2. **Type Sharing Strategy**

**Opción A: Package Compartido**
```json
// packages/shared-types/package.json
{
  "name": "@company/shared-types",
  "version": "1.0.0",
  "types": "./index.d.ts"
}
```

**Opción B: Generar desde OpenAPI**
```bash
# Generar types desde schema del backend
npx openapi-typescript http://api.example.com/openapi.json --output ./types/api.ts
```

**Opción C: tRPC (si backend es Node.js)**
```typescript
// Compartir types automáticamente entre frontend y backend
import { createTRPCProxyClient } from '@trpc/client';
import type { AppRouter } from '@backend/router';

const client = createTRPCProxyClient<AppRouter>({...});
```

#### 3. **Environment Variables**

```bash
# .env.local (Frontend)
# Public - Expuesto al cliente
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...

# Private - Solo servidor
API_URL=http://backend:3001  # Para server-side calls
CLERK_SECRET_KEY=sk_...
```

#### 4. **Error Handling Unificado**

```typescript
// lib/api-error.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Hook para manejar errores
export function useApiErrorHandler() {
  return (error: unknown) => {
    if (error instanceof ApiError) {
      switch (error.status) {
        case 401:
          toast.error('No autorizado. Por favor inicia sesión.');
          redirect('/auth/sign-in');
          break;
        case 403:
          toast.error('No tienes permisos para esta acción.');
          break;
        case 404:
          toast.error('Recurso no encontrado.');
          break;
        case 500:
          toast.error('Error del servidor. Intenta más tarde.');
          break;
        default:
          toast.error(error.message);
      }
    }
    
    // Log a Sentry
    captureException(error);
  };
}
```

#### 5. **Caching Strategy**

```typescript
// Usar Next.js fetch con cache
export async function getProducts() {
  const token = await getToken();
  
  const response = await fetch(`${API_URL}/products`, {
    headers: { 'Authorization': `Bearer ${token}` },
    next: { 
      revalidate: 60, // Cache por 60 segundos
      tags: ['products'] // Tag para revalidación selectiva
    }
  });
  
  return response.json();
}

// Revalidar cuando cambian los datos
export async function createProduct(data: any) {
  // ... crear producto
  revalidateTag('products'); // Invalida cache de productos
}
```

### Variables de Entorno Necesarias

```bash
# Frontend (.env.local)
# ===================================

# API Backend
API_URL=http://localhost:3001                    # Server-side
NEXT_PUBLIC_API_URL=https://api.example.com     # Client-side

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Sentry
SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=...
NEXT_PUBLIC_SENTRY_DSN=https://...

# Analytics (opcional)
NEXT_PUBLIC_GA_ID=G-...
```

### Testing con Backend Separado

#### **Mock Service Worker (MSW)**
```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('https://api.example.com/products', () => {
    return HttpResponse.json([
      { id: 1, name: 'Product 1' },
      { id: 2, name: 'Product 2' },
    ]);
  }),
  
  http.post('https://api.example.com/products', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 3, ...body });
  }),
];

// tests/setup.ts
import { setupServer } from 'msw/node';
import { handlers } from '../mocks/handlers';

export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## �🏗️ Stack Tecnológico

### Core Framework
- **Next.js 16** - App Router, Server Components, Server Actions
- **React 19** - UI Library
- **TypeScript** - Type safety

### UI & Styling
- **Shadcn UI** - Componentes de UI pre-construidos
- **Tailwind CSS v4** - Utility-first CSS
- **Radix UI** - Primitivos accesibles
- **Lucide React** + **Tabler Icons** - Iconografía
- **Motion** (Framer Motion) - Animaciones

### Autenticación & Autorización
- **Clerk** - Autenticación, organizaciones, RBAC, billing

### Manejo de Estado
- **Zustand** - Estado global (Kanban board)
- **Nuqs** - Gestión de search params con type-safety
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de schemas

### Data Tables
- **Tanstack Table v8** - Tablas interactivas
- **Nuqs** - Sincronización de filtros/paginación con URL

### Utilidades
- **date-fns** - Manipulación de fechas
- **kbar** - Command palette (Cmd+K)
- **cmdk** - Command menu
- **dnd-kit** - Drag and drop
- **react-dropzone** - File uploads

### DevOps & Monitoreo
- **Sentry** - Error tracking y performance monitoring
- **ESLint** + **Prettier** - Code quality
- **Husky** - Git hooks pre-commit

---

## 📁 Estructura de Carpetas

```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Layout raíz con providers
│   ├── page.tsx             # Landing page
│   ├── globals.css          # Estilos globales
│   ├── theme.css            # CSS variables para temas
│   ├── auth/                # Rutas de autenticación
│   │   ├── sign-in/
│   │   └── sign-up/
│   └── dashboard/           # Rutas del dashboard
│       ├── layout.tsx       # Layout con sidebar
│       ├── page.tsx         # Overview
│       ├── billing/         # Gestión de planes
│       ├── exclusive/       # Contenido premium
│       ├── kanban/          # Tablero Kanban
│       ├── overview/        # Analytics
│       ├── product/         # CRUD de productos
│       ├── profile/         # Perfil de usuario
│       └── workspaces/      # Organizaciones/Equipos
│
├── components/              # Componentes React
│   ├── ui/                 # Shadcn UI components (primitivos)
│   ├── layout/             # Componentes de layout
│   │   ├── app-sidebar.tsx
│   │   ├── header.tsx
│   │   ├── providers.tsx
│   │   └── user-nav.tsx
│   ├── forms/              # Form field components
│   ├── kbar/               # Command palette
│   └── modal/              # Modales reutilizables
│
├── features/               # 🎯 Lógica de negocio por feature
│   ├── auth/              # Autenticación
│   ├── kanban/            # Tablero Kanban
│   ├── overview/          # Analytics/Dashboard
│   ├── products/          # Gestión de productos
│   └── profile/           # Perfil de usuario
│
├── hooks/                  # Custom React hooks
│   ├── use-nav.ts         # RBAC navigation filtering
│   ├── use-data-table.ts  # Lógica de tablas
│   ├── use-breadcrumbs.tsx
│   └── use-mobile.tsx
│
├── config/                 # Archivos de configuración
│   ├── nav-config.ts      # Configuración de navegación
│   ├── data-table.ts      # Config de tablas
│   └── infoconfig.ts      # Configuración del infobar
│
├── lib/                    # Utilidades y helpers
│   ├── utils.ts           # Helpers generales (cn, etc)
│   ├── data-table.ts      # Utilidades de tablas
│   ├── parsers.ts         # Parsers para URL params
│   └── format.ts          # Formateo de datos
│
├── types/                  # TypeScript types
│   ├── index.ts           # Types globales
│   ├── base-form.ts       # Types para formularios
│   └── data-table.ts      # Types para tablas
│
└── constants/              # Constantes y mock data
    ├── data.ts
    └── mock-api.ts
```

---

## 🎨 Arquitectura Basada en Features

### Principios

Este proyecto sigue una **arquitectura basada en features** (feature-based architecture), donde cada funcionalidad del negocio vive en su propia carpeta autocontenida.

### Estructura de un Feature

```
src/features/[feature-name]/
├── components/          # Componentes específicos del feature
├── hooks/              # Hooks específicos del feature
├── utils/              # Utilidades específicas
├── types.ts            # Types del feature
├── store.ts            # Estado (Zustand) si es necesario
└── api.ts              # Llamadas a API
```

### Ejemplo: Feature Kanban

```
src/features/kanban/
├── components/
│   ├── board-column.tsx
│   ├── new-task-dialog.tsx
│   └── task-card.tsx
├── data/
│   └── tasks.ts
├── hooks/
│   └── use-tasks.ts
└── store.ts            # Zustand store para el estado del board
```

### Ventajas

1. **Cohesión**: Todo lo relacionado con una feature está junto
2. **Escalabilidad**: Fácil agregar/remover features
3. **Mantenibilidad**: Cambios aislados a features específicos
4. **Testing**: Tests organizados por feature
5. **Onboarding**: Nuevos developers encuentran código más fácil

---

## 🔐 Sistema de Autenticación (Clerk)

### Arquitectura

```
┌─────────────────────────────────────────────────┐
│            Clerk Authentication                  │
├─────────────────────────────────────────────────┤
│  • User Management                              │
│  • Organizations (Multi-tenant)                 │
│  • Role-Based Access Control                    │
│  • Billing & Subscriptions                      │
└─────────────────────────────────────────────────┘
         ↓                    ↓                ↓
    ┌────────┐          ┌──────────┐     ┌─────────┐
    │  User  │          │   Org    │     │  Plans  │
    │Profile │          │ Teams    │     │ Billing │
    └────────┘          └──────────┘     └─────────┘
```

### Componentes Clave

**1. Root Layout Provider**
```tsx
// src/app/layout.tsx
<Providers activeThemeValue={activeThemeValue}>
  <ClerkProvider>
    {children}
  </ClerkProvider>
</Providers>
```

**2. Páginas Protegidas**
```tsx
// src/app/dashboard/layout.tsx
// Clerk protege automáticamente rutas bajo /dashboard
```

**3. Hooks de Clerk**
```typescript
// En componentes client-side
const { user } = useUser();
const { organization } = useOrganization();
const { membership } = useOrganization();
```

### Multi-Tenant (Organizaciones)

- Cada usuario puede pertenecer a múltiples organizaciones
- Cada organización tiene roles y permisos
- Billing está ligado a organizaciones, no usuarios individuales

---

## 🛡️ Sistema RBAC (Control de Acceso)

### Arquitectura Completamente Client-Side

```
┌─────────────────────────────────────────────┐
│       nav-config.ts                         │
│  (Configuración de navegación + access)     │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│           use-nav.ts hook                   │
│  (Filtra items según access control)        │
├─────────────────────────────────────────────┤
│  Checks:                                    │
│  • requireOrg (tiene org activa?)           │
│  • permission (tiene permiso específico?)   │
│  • role (tiene rol específico?)             │
│  • plan (tiene plan específico?)            │
│  • feature (tiene feature habilitado?)      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│       app-sidebar.tsx                       │
│  (Renderiza solo items permitidos)          │
└─────────────────────────────────────────────┘
```

### Ejemplo de Configuración

```typescript
// src/config/nav-config.ts
{
  title: 'Teams',
  url: '/dashboard/workspaces/team',
  icon: 'teams',
  access: { requireOrg: true }  // Solo visible si tiene org activa
},
{
  title: 'Exclusive',
  url: '/dashboard/exclusive',
  icon: 'exclusive',
  access: { plan: 'pro' }  // Solo visible para plan Pro
}
```

### Performance

- ✅ **Zero llamadas al servidor** - Todo es client-side
- ✅ **Instantáneo** - Sin loading states
- ✅ **Sincrónico** - Usa hooks de Clerk que ya tienen los datos

**⚠️ Importante**: Este sistema es solo para UX (mostrar/ocultar navegación). La seguridad real debe implementarse en:
- Server Actions
- API Routes  
- Protección de páginas con `<Protect>` de Clerk

---

## 📊 Sistema de Data Tables

### Arquitectura

```
┌──────────────────────────────────────────────┐
│         use-data-table.ts hook               │
│  (Manejo de estado de tabla + URL sync)     │
├──────────────────────────────────────────────┤
│  • Paginación                                │
│  • Sorting                                   │
│  • Filtros                                   │
│  • Column visibility                         │
│  • Row selection                             │
│  • Search                                    │
└──────────────────────────────────────────────┘
         ↓ Sincroniza con ↓
┌──────────────────────────────────────────────┐
│              URL Search Params               │
│  ?page=2&perPage=10&sort=name.desc           │
│  (Gestionado por Nuqs)                       │
└──────────────────────────────────────────────┘
         ↓ Renderiza ↓
┌──────────────────────────────────────────────┐
│         Tanstack Table Component             │
│  (UI de tabla con Shadcn components)         │
└──────────────────────────────────────────────┘
```

### Características

1. **Server-Side Processing**: Filtrado y paginación en el servidor
2. **URL Sync**: Estado sincronizado con query params (compartible via URL)
3. **Debouncing**: Optimización de búsquedas con debounce
4. **Type-Safe**: Search params tipados con Nuqs
5. **Persistencia**: Estado preservado en navegación

### Ejemplo de Uso

```typescript
const { table } = useDataTable({
  data,
  columns,
  pageCount,
  defaultPerPage: 10,
  defaultSort: [{ id: 'createdAt', desc: true }]
});
```

---

## 🎨 Sistema de Temas

### Arquitectura

```
┌─────────────────────────────────────────────┐
│           theme-provider.tsx                │
│  (next-themes + custom theme system)        │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         active-theme.tsx                    │
│  (Gestiona tema activo: default, scaled)    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│            theme.css                        │
│  (CSS Variables para colores)               │
├─────────────────────────────────────────────┤
│  • Default theme                            │
│  • Default-scaled (más espaciado)           │
│  • Modos: light / dark                      │
└─────────────────────────────────────────────┘
```

### Temas Disponibles

1. **Default** - Tema estándar
2. **Default-scaled** - Versión con más espaciado

Cada tema soporta:
- Light mode
- Dark mode
- System preference

### Implementación

```tsx
// Cookies para SSR sin flash
const activeThemeValue = cookieStore.get('active_theme')?.value;

// Providers anidados
<ThemeProvider>
  <ActiveThemeProvider initialTheme={activeThemeValue}>
    {children}
  </ActiveThemeProvider>
</ThemeProvider>
```

---

## 📝 Sistema de Formularios

### Arquitectura

```
┌─────────────────────────────────────────────┐
│         React Hook Form + Zod               │
│  (Validación + manejo de estado)            │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         base-form.ts                        │
│  (Types base para form components)          │
├─────────────────────────────────────────────┤
│  • BaseFormFieldProps<T>                    │
│  • FormOption                               │
│  • FileUploadConfig                         │
│  • DatePickerConfig                         │
│  • SliderConfig                             │
│  • TextareaConfig                           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         src/components/forms/               │
│  (Form field components reutilizables)      │
├─────────────────────────────────────────────┤
│  • form-input.tsx                           │
│  • form-select.tsx                          │
│  • form-checkbox.tsx                        │
│  • form-date-picker.tsx                     │
│  • form-file-upload.tsx                     │
│  • form-textarea.tsx                        │
│  • form-switch.tsx                          │
│  • form-slider.tsx                          │
│  • form-radio-group.tsx                     │
└─────────────────────────────────────────────┘
```

### Características

1. **Type-Safe**: Props tipados con generics
2. **Consistencia**: Todos los campos comparten base props
3. **Reutilizables**: Componentes modulares
4. **Validación**: Integración con Zod schemas
5. **Accesibilidad**: Basados en Radix UI

### Ejemplo

```typescript
interface BaseFormFieldProps<TFieldValues, TName> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}
```

---

## 🎯 Manejo de Estado

### Estrategia Multi-Layer

```
┌─────────────────────────────────────────────┐
│      URL State (Nuqs)                       │
│  • Filtros de tablas                        │
│  • Paginación                               │
│  • Search queries                           │
│  • Shareable state                          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│      Global State (Zustand)                 │
│  • Kanban board tasks                       │
│  • UI preferences                           │
│  • Persistent data                          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│      Form State (React Hook Form)           │
│  • Form inputs                              │
│  • Validation errors                        │
│  • Submit handling                          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│      Server State (Next.js)                 │
│  • Server Components                        │
│  • Server Actions                           │
│  • API Routes                               │
└─────────────────────────────────────────────┘
```

### Cuándo Usar Cada Uno

| Estado | Herramienta | Caso de Uso |
|--------|-------------|-------------|
| URL Params | Nuqs | Filtros, paginación, búsqueda |
| UI Global | Zustand | Preferencias, modales, caches |
| Formularios | React Hook Form | Inputs, validación |
| Server Data | Next.js | Fetch, mutations, auth |

---

## 🚀 Patrones de Renderizado

### Server Components por Defecto

```tsx
// app/dashboard/page.tsx
export default async function DashboardPage() {
  // Fetch directo en Server Component
  const data = await fetchData();
  
  return <Dashboard data={data} />;
}
```

### Client Components Cuando Necesario

```tsx
'use client';

// Solo cuando necesitas:
// - useState, useEffect
// - Event handlers
// - Browser APIs
// - Context providers
```

### Composición Híbrida

```tsx
// Server Component (padre)
export default async function Page() {
  const data = await fetchData();
  
  return (
    <div>
      <StaticHeader />
      <InteractiveTable data={data} /> {/* Client Component */}
    </div>
  );
}
```

---

## 🔍 Command Palette (Cmd+K)

### Arquitectura

```
┌─────────────────────────────────────────────┐
│              kbar library                   │
│  (Sistema de comandos)                      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         src/components/kbar/                │
├─────────────────────────────────────────────┤
│  • index.tsx (Provider)                     │
│  • render-result.tsx (UI)                   │
│  • result-item.tsx (Items)                  │
│  • use-theme-switching.tsx (Themes)         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│           nav-config.ts                     │
│  (Comandos sincronizados con navegación)    │
└─────────────────────────────────────────────┘
```

### Funcionalidades

1. **Navegación rápida**: Acceso directo a cualquier página
2. **Theme switching**: Cambiar temas desde el palette
3. **Shortcuts**: Atajos de teclado personalizados
4. **Búsqueda**: Filtrado fuzzy de comandos
5. **Accesibilidad**: Navegación completa por teclado

---

## 🐛 Monitoreo de Errores (Sentry)

### Integración

```
┌─────────────────────────────────────────────┐
│      instrumentation.ts (Server)            │
│  • Server-side error tracking               │
│  • API route monitoring                     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│   instrumentation-client.ts (Client)        │
│  • Client-side error tracking               │
│  • User session replay                      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│       global-error.tsx                      │
│  • Error boundary UI                        │
│  • User-friendly error page                 │
└─────────────────────────────────────────────┘
```

### Características

- ✅ Error tracking automático
- ✅ Performance monitoring
- ✅ Session replay
- ✅ Source maps para debugging
- ✅ Integration con Next.js

---

## 📦 Componentes UI (Shadcn)

### Filosofía

Shadcn UI **NO es una librería npm**. Los componentes se copian al proyecto y son tuyos para modificar.

### Estructura

```
src/components/ui/
├── button.tsx
├── input.tsx
├── dialog.tsx
├── dropdown-menu.tsx
├── table.tsx
├── card.tsx
├── badge.tsx
├── avatar.tsx
└── ... (50+ componentes)
```

### Ventajas

1. **Customización total**: Código en tu proyecto
2. **No lock-in**: Sin dependencias de librería
3. **Type-safe**: TypeScript nativo
4. **Accesible**: Basado en Radix UI
5. **Themeable**: CSS variables para colores

### Instalación de Nuevos Componentes

```bash
npx shadcn-ui@latest add [component-name]
```

---

## 🔄 Flujo de Datos

### Lectura (Server → Client)

```
┌─────────────────┐
│  Server Action  │
│  o API Route    │
└────────┬────────┘
         ↓
┌─────────────────┐
│  Server Comp.   │
│  (fetch data)   │
└────────┬────────┘
         ↓
┌─────────────────┐
│  Client Comp.   │
│  (props)        │
└─────────────────┘
```

### Escritura (Client → Server)

```
┌─────────────────┐
│  Client Comp.   │
│  (form submit)  │
└────────┬────────┘
         ↓
┌─────────────────┐
│  Server Action  │
│  (mutation)     │
└────────┬────────┘
         ↓
┌─────────────────┐
│   Revalidate    │
│   (cache)       │
└─────────────────┘
```

---

## 🧪 Mejores Prácticas

### 1. Organización de Código

```typescript
// ✅ BIEN: Feature-based
src/features/products/
  components/
  hooks/
  utils/

// ❌ MAL: Type-based
src/
  components/
    product-list.tsx
    user-profile.tsx
    kanban-board.tsx
```

### 2. Server vs Client Components

```typescript
// ✅ BIEN: Server Component por defecto
export default async function Page() {
  const data = await fetchData();
  return <View data={data} />;
}

// ❌ MAL: Client Component innecesario
'use client';
export default function Page() {
  const [data, setData] = useState(null);
  useEffect(() => { ... }, []);
}
```

### 3. Type Safety

```typescript
// ✅ BIEN: Types explícitos
interface User {
  id: string;
  name: string;
  email: string;
}

// ❌ MAL: Any types
const user: any = ...
```

### 4. Manejo de Errores

```typescript
// ✅ BIEN: Error boundaries + try/catch
try {
  await serverAction();
} catch (error) {
  // Log a Sentry
  console.error(error);
  toast.error('Failed to save');
}

// ❌ MAL: Sin manejo de errores
await serverAction();
```

---

## 🚀 Comandos de Desarrollo

```bash
# Desarrollo
bun dev

# Build de producción
bun build

# Start en producción
bun start

# Linting
bun lint
bun lint:fix

# Formateo
bun format
bun format:check

# Pre-commit hooks
bun prepare
```

---

## 📚 Recursos Adicionales

### Documentación Relacionada

- `docs/clerk_setup.md` - Configuración de Clerk
- `docs/nav-rbac.md` - Sistema RBAC detallado
- `README.md` - Guía de inicio rápido

### Enlaces Externos

- [Next.js Docs](https://nextjs.org/docs)
- [Shadcn UI](https://ui.shadcn.com)
- [Clerk Docs](https://clerk.com/docs)
- [Tanstack Table](https://tanstack.com/table)
- [Nuqs](https://nuqs.47ng.com)

---

## 🎓 Convenciones del Proyecto

### Nomenclatura

- **Archivos**: kebab-case (`user-profile.tsx`)
- **Componentes**: PascalCase (`UserProfile`)
- **Funciones**: camelCase (`getUserData`)
- **Constantes**: UPPER_SNAKE_CASE (`API_URL`)
- **Types**: PascalCase (`interface UserData`)

### Estructura de Archivos

```typescript
// 1. Imports
import { ... } from 'react';
import { ... } from 'third-party';
import { ... } from '@/components';
import { ... } from '@/lib';

// 2. Types
interface Props { ... }

// 3. Component
export function Component({ ... }: Props) {
  // 3.1 Hooks
  // 3.2 State
  // 3.3 Effects
  // 3.4 Handlers
  // 3.5 Render
}
```

### Exports

```typescript
// ✅ Named exports (preferido)
export function Component() { ... }

// ✅ Default export para pages
export default function Page() { ... }
```

---

## 🔐 Seguridad

### Checklist

- ✅ Autenticación en todas las rutas del dashboard
- ✅ Validación de permisos en Server Actions
- ✅ Sanitización de inputs con Zod
- ✅ CORS configurado correctamente
- ✅ Variables de entorno protegidas
- ✅ Rate limiting en API routes (considerar)
- ✅ CSP headers (considerar)

### Variables de Entorno

```bash
# Public (expuestas al cliente)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=
NEXT_PUBLIC_CLERK_SIGN_UP_URL=

# Private (solo servidor)
CLERK_SECRET_KEY=
SENTRY_AUTH_TOKEN=
DATABASE_URL=
```

---

## 🎯 Roadmap de Extensión

### Ideas para Extender el Frontend

1. **Optimizaciones de Performance**
   - Implementar React Server Components donde sea posible
   - Image optimization con next/image
   - Code splitting estratégico
   - Service Worker para offline support

2. **Testing**
   - Jest + React Testing Library
   - Playwright para E2E
   - MSW para mock del backend API
   - Visual regression testing con Chromatic

3. **I18n**
   - next-intl
   - Múltiples idiomas
   - RTL support

4. **PWA**
   - Convertir en Progressive Web App
   - Offline mode
   - Push notifications

5. **Analytics Avanzado**
   - Google Analytics 4
   - Hotjar/Posthog para session replay
   - Custom events tracking

6. **Accessibility**
   - Auditoría completa WCAG 2.1
   - Screen reader optimization
   - Keyboard navigation mejorada

### Coordinación con Backend

#### **API Contract First**
- Definir APIs con OpenAPI/Swagger ANTES de implementar
- Generar types automáticamente desde el schema
- Contract testing para asegurar compatibilidad

#### **Versionado de API**
```typescript
// Soportar múltiples versiones del API
const API_VERSION = process.env.API_VERSION || 'v1';
const apiClient = new ApiClient(`${API_URL}/${API_VERSION}`);
```

#### **Feature Flags**
```typescript
// Activar features que dependen de backend deployado
if (features.newProductsEndpoint) {
  // Usar nuevo endpoint
} else {
  // Fallback al endpoint antiguo
}
```

---

## 📋 Checklist de Integración Frontend/Backend

### Durante Desarrollo

- [ ] **API Client** centralizado implementado
- [ ] **Error handling** unificado con códigos HTTP estándar
- [ ] **Loading states** en todas las llamadas async
- [ ] **Retry logic** para requests fallidos
- [ ] **Rate limiting** respetado (headers del backend)
- [ ] **Types compartidos** entre frontend y backend
- [ ] **Environment variables** configuradas correctamente
- [ ] **CORS** configurado en backend para dominio del frontend

### Testing

- [ ] **MSW** configurado para tests unitarios
- [ ] **Integration tests** con backend en staging
- [ ] **E2E tests** con Playwright
- [ ] **Error scenarios** testeados (401, 403, 404, 500)
- [ ] **Performance testing** con backend real

### Producción

- [ ] **Monitoring** con Sentry en ambos lados
- [ ] **Logs** correlacionados (request IDs)
- [ ] **Health checks** del backend monitoreados
- [ ] **Fallbacks** para cuando backend está down
- [ ] **Cache strategy** implementada
- [ ] **CDN** configurado para assets estáticos
- [ ] **SSL/TLS** en todas las comunicaciones

### Documentación

- [ ] **API documentation** actualizada (Swagger/Postman)
- [ ] **Types/Interfaces** documentados
- [ ] **Environment variables** documentadas
- [ ] **Error codes** documentados
- [ ] **Runbook** para issues comunes
- [ ] **Arquitectura diagram** actualizado

---

## 📝 Conclusión

Esta arquitectura está diseñada para:

- ✅ **Escalabilidad**: Fácil agregar features
- ✅ **Mantenibilidad**: Código organizado y limpio
- ✅ **Performance**: SSR, caching, optimizaciones
- ✅ **Developer Experience**: TypeScript, linting, hot reload
- ✅ **User Experience**: Temas, navegación, feedback

Es una base sólida para construir aplicaciones enterprise-grade con Next.js.

---

**Última actualización**: Enero 2026  
**Versión**: 1.0.0  
**Autor**: Dashboard Starter Template Team
