# Sistema de Autenticación - CRM UROBOT

## 📋 Índice
- [Arquitectura](#arquitectura)
- [Mejores Prácticas Implementadas](#mejores-prácticas-implementadas)
- [Flujo de Autenticación](#flujo-de-autenticación)
- [Seguridad](#seguridad)
- [Uso](#uso)

---

## 🏗️ Arquitectura

El sistema de autenticación está construido con **Supabase Auth** y sigue las mejores prácticas oficiales para **Next.js 15 App Router**.

### Componentes Principales

```
app/
├── auth/
│   ├── page.tsx          # UI de autenticación (login/registro/reset)
│   ├── actions.ts        # Server Actions para auth
│   └── state.ts          # Estado y tipos de formularios
lib/
└── supabase/
    ├── client.ts         # Cliente Supabase para navegador
    ├── server.ts         # Cliente Supabase para servidor
    └── middleware.ts     # Utilidad para middleware
middleware.ts             # Middleware de Next.js
```

---

## ✅ Mejores Prácticas Implementadas

### 1. **Cliente Servidor Async/Await**
```typescript
// ✅ CORRECTO - Next.js 15+
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(...)
}
```

**Por qué:** Next.js 15 requiere que `cookies()` se use con `await` para garantizar la correcta gestión de cookies del lado del servidor.

### 2. **Validación con `getUser()` en Middleware**
```typescript
// ✅ CORRECTO - Seguro
const { data: { user } } = await supabase.auth.getUser()

// ❌ INCORRECTO - Inseguro
const { data: { session } } = await supabase.auth.getSession()
```

**Por qué:** 
- `getUser()` valida el token con el servidor de Supabase Auth
- `getSession()` solo lee cookies, que pueden ser falsificadas
- **Siempre usa `getUser()` para protección de rutas**

### 3. **Refreshing de Tokens en Middleware**
El middleware automáticamente:
- Refresca tokens expirados
- Pasa el token actualizado a Server Components
- Actualiza cookies en el navegador

### 4. **Server Actions para Mutaciones**
```typescript
'use server'

export async function signInAction(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({...})
  
  if (error) return buildErrorState(error.message)
  
  redirect('/dashboard')
}
```

**Ventajas:**
- No expone lógica de autenticación al cliente
- Manejo seguro de cookies del lado del servidor
- Mejor DX con `useActionState`

---

## 🔄 Flujo de Autenticación

### Login
1. Usuario envía formulario → `signInAction`
2. Server Action valida credenciales con Supabase
3. Si es exitoso, Supabase crea sesión (cookies)
4. Middleware detecta sesión y permite acceso
5. Redirect automático a `/dashboard`

### Registro
1. Usuario envía formulario → `signUpAction`
2. Server Action crea cuenta en Supabase
3. Supabase envía email de confirmación (opcional)
4. Usuario queda autenticado automáticamente
5. Redirect a `/dashboard`

### Logout
1. Usuario hace click en "Cerrar sesión"
2. `signOutAction` elimina sesión de Supabase
3. Middleware detecta ausencia de sesión
4. Redirect automático a `/auth`

### Recuperación de Contraseña
1. Usuario solicita reset → `resetPasswordAction`
2. Supabase envía email con enlace mágico
3. Usuario hace click → redirigido a `/auth/reset`
4. Nueva contraseña → `updatePasswordAction`
5. Redirect a `/dashboard`

---

## 🔒 Seguridad

### Protección de Rutas
El middleware protege automáticamente estas rutas:

```typescript
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/leads',
  '/pacientes',
  '/consultas',
  '/confirmaciones',
  '/metricas',
  '/agenda',
]
```

**Comportamiento:**
- Sin sesión → Redirect a `/auth`
- Con sesión → Acceso permitido
- Ya autenticado + visita `/auth` → Redirect a `/dashboard`

### Validación de Tokens
- **Servidor:** Siempre usa `getUser()` para validar
- **Cliente:** Los hooks usan el cliente del navegador
- **Middleware:** Refresca tokens automáticamente

### Cookies Seguras
- `httpOnly`: No accesibles desde JavaScript
- `secure`: Solo HTTPS en producción
- `sameSite`: Protección CSRF
- Auto-refresh: Tokens refrescados antes de expirar

---

## 📖 Uso

### En Server Components
```tsx
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth')
  }
  
  return <div>Hola {user.email}</div>
}
```

### En Client Components
```tsx
'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function ClientComponent() {
  const [user, setUser] = useState(null)
  const supabase = createClient()
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])
  
  return <div>{user?.email}</div>
}
```

### En Server Actions
```typescript
'use server'
import { createClient } from '@/lib/supabase/server'

export async function myAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('No autenticado')
  }
  
  // Hacer algo con el usuario
}
```

### Cerrar Sesión
```tsx
'use client'
import { signOutAction } from '@/app/auth/actions'

export function LogoutButton() {
  return (
    <form action={signOutAction}>
      <button type="submit">Cerrar sesión</button>
    </form>
  )
}
```

---

## 🚀 Próximos Pasos

### Mejoras Recomendadas

1. **Row Level Security (RLS)**
   - Habilitar políticas RLS en Supabase
   - Asegurar que los usuarios solo vean sus datos

2. **Roles y Permisos**
   - Implementar sistema de roles (admin, doctor, asistente)
   - Proteger rutas según rol

3. **Email Templates**
   - Personalizar emails de Supabase
   - Agregar logo y branding

4. **OAuth Providers**
   - Agregar login con Google
   - Agregar login con Microsoft

5. **Auditoría**
   - Registrar intentos fallidos de login
   - Monitorear sesiones activas

---

## 📚 Referencias

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js App Router Auth](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase SSR Package](https://supabase.com/docs/guides/auth/server-side/creating-a-client)

---

## ⚠️ Importante

### NO hacer:
- ❌ Usar `getSession()` en middleware o server code
- ❌ Confiar en cookies del cliente sin validar
- ❌ Exponer lógica de auth en el cliente
- ❌ Guardar tokens en localStorage

### SÍ hacer:
- ✅ Usar `getUser()` para validar usuarios
- ✅ Usar Server Actions para mutaciones
- ✅ Dejar que Supabase maneje cookies
- ✅ Confiar en el middleware para refresh
