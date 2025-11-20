# Clientes de Supabase

Este directorio contiene tres clientes de Supabase optimizados para diferentes contextos de ejecución.

## 📋 Guía Rápida

| Cliente | Archivo | Contexto | Respeta RLS | Cuándo usar |
|---------|---------|----------|-------------|-------------|
| **Browser Client** | `client.ts` | Cliente (Browser) | ✅ Sí | Componentes React, Hooks |
| **Server Client** | `server.ts` | Servidor (SSR) | ✅ Sí | Server Components, Server Actions |
| **Admin Client** | `admin.ts` | Servidor (Admin) | ❌ **NO** | API Routes, Webhooks, Cron Jobs |

---

## 🌐 Browser Client (`client.ts`)

**Uso:** Componentes del cliente, Custom Hooks

```tsx
"use client"
import { createClient } from "@/lib/supabase/client";

export function MyComponent() {
  const supabase = createClient();
  
  // Operaciones del usuario autenticado
  const { data } = await supabase.from('leads').select('*');
}
```

**Características:**
- ✅ Singleton pattern (una sola instancia)
- ✅ Respeta RLS y permisos del usuario
- ✅ Maneja sesiones automáticamente
- ⚠️ Solo usa `NEXT_PUBLIC_*` variables (seguro para el browser)

---

## 🖥️ Server Client (`server.ts`)

**Uso:** Server Components, Server Actions

```tsx
// app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // Datos del usuario actual respetando RLS
  const { data } = await supabase.from('leads').select('*');
  
  return <div>{/* ... */}</div>;
}
```

**Características:**
- ✅ Respeta RLS y contexto del usuario
- ✅ Mantiene cookies de sesión
- ✅ Seguro para Server Components
- ⚠️ Requiere `await` al crear el cliente

---

## 🔑 Admin Client (`admin.ts`)

**Uso:** API Routes, Webhooks, Operaciones Administrativas

```tsx
// app/api/admin/route.ts
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = createAdminClient();
  
  // ⚠️ Bypasea RLS - usar con precaución
  const { data } = await supabase.from('leads').select('*');
  
  return Response.json(data);
}
```

**Características:**
- ❌ **BYPASEA Row Level Security (RLS)**
- ✅ Acceso total a todas las tablas
- ✅ Ideal para webhooks de n8n
- ⚠️ **NUNCA** usar en componentes del cliente
- ⚠️ Requiere `SUPABASE_SERVICE_ROLE_KEY`

---

## 🚨 Reglas de Seguridad

### ✅ Correcto

```tsx
// ✅ Browser client en hook
"use client"
import { createClient } from "@/lib/supabase/client";

// ✅ Server client en Server Component
import { createClient } from "@/lib/supabase/server";

// ✅ Admin client en API Route
import { createAdminClient } from "@/lib/supabase/admin";
export async function POST() { /* ... */ }
```

### ❌ Incorrecto

```tsx
// ❌ Admin client en componente del cliente
"use client"
import { createAdminClient } from "@/lib/supabase/admin"; // ¡PELIGRO!

// ❌ Service role key en variable NEXT_PUBLIC_*
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=... // ¡NUNCA!

// ❌ Usar admin client sin validar input del usuario
const { userId } = await request.json(); // input del usuario
const supabase = createAdminClient();
await supabase.from('users').delete().eq('id', userId); // ¡PELIGROSO!
```

---

## 🔐 Variables de Entorno

```env
# Públicas (seguras para el browser)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJhbGc...

# Privadas (SOLO servidor)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUz... # ⚠️ NUNCA exponer al cliente
```

---

## 📚 Casos de Uso Comunes

### Dashboard de usuario (RLS)
```tsx
// Server Component
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
const { data } = await supabase.from('leads').select('*'); // Solo del usuario actual
```

### Webhook de n8n (Sin RLS)
```tsx
// app/api/webhooks/n8n/route.ts
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = createAdminClient();
  // Crear lead desde webhook sin restricciones RLS
  await supabase.from('leads').insert({ ... });
}
```

### Autenticación en el cliente
```tsx
"use client"
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
await supabase.auth.signInWithPassword({ email, password });
```

---

## 🛠️ Helper: executeAdminOperation

Para operaciones admin con manejo de errores:

```tsx
import { executeAdminOperation } from "@/lib/supabase/admin";

const leads = await executeAdminOperation(async (client) => {
  return await client.from('leads').select('*');
});
```
