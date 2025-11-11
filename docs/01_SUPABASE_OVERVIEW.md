# 📊 Supabase UROBOT - Visión General

## 🔧 Información del Proyecto

### Credenciales de Conexión
```typescript
// Configuración de Supabase
const SUPABASE_URL = "https://uxqksgdpgxkgvasysvsb.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4cWtzZ2RwZ3hrZ3Zhc3lzdnNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MjgyMjEsImV4cCI6MjA2NzAwNDIyMX0.zGJMc8rrhYbxlB9EbiBtf_SPxARfq7Md7NdgGq6TMug"

// Publishable Key (Recomendado para nuevas apps)
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_kQg3eyRqki3kUHJXykYOeQ_L3N9O8O_"
```

### Extensiones Instaladas
- **vector** (0.8.0): Para embeddings y búsqueda semántica
- **uuid-ossp** (1.1): Generación de UUIDs
- **pgcrypto** (1.3): Funciones criptográficas
- **pg_net** (0.14.0): Requests HTTP async
- **pg_graphql** (1.5.11): Soporte GraphQL
- **moddatetime** (1.0): Tracking de modificaciones
- **pg_stat_statements** (1.11): Estadísticas de queries

---

## ⚙️ Configuración del Cliente

### Instalación
```bash
npm install @supabase/supabase-js
```

### Setup Básico
```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})
```

### Variables de Entorno
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://uxqksgdpgxkgvasysvsb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🗄️ Estructura de Base de Datos

### Tablas Principales

| Tabla | Propósito | Filas Actuales | RLS Habilitado |
|-------|-----------|----------------|----------------|
| `leads` | Prospectos del CRM | 0 | ❌ No |
| `pacientes` | Pacientes registrados | 1 | ❌ No |
| `consultas` | Citas médicas | 1 | ❌ No |
| `recordatorios` | Sistema de recordatorios | 2 | ❌ No |
| `conversaciones` | Historial de mensajes | 0 | ❌ No |
| `escalamientos` | Casos que requieren humano | 0 | ❌ No |
| `sedes` | Ubicaciones físicas | 2 | ❌ No |
| `conocimiento_procedimientos_urologia` | Base de conocimiento IA | 0 | ❌ No |

> ⚠️ **IMPORTANTE**: Actualmente NO hay RLS (Row Level Security) habilitado. Se recomienda implementarlo antes de producción.

---

## 🔗 Diagrama de Relaciones

```mermaid
erDiagram
    LEADS ||--o{ CONVERSACIONES : "tiene"
    LEADS ||--o{ CONSULTAS : "genera"
    LEADS ||--o| PACIENTES : "convierte_a"
    LEADS ||--o{ ESCALAMIENTOS : "puede_escalar"
    
    PACIENTES ||--o{ CONSULTAS : "tiene"
    PACIENTES ||--o{ CONVERSACIONES : "tiene"
    PACIENTES ||--o{ ESCALAMIENTOS : "puede_escalar"
    
    CONSULTAS ||--o{ RECORDATORIOS : "genera"
    CONSULTAS ||--o{ CONVERSACIONES : "asocia"
    CONSULTAS ||--o{ ESCALAMIENTOS : "puede_escalar"
    CONSULTAS }o--|| SEDES : "en"
    
    SEDES ||--o{ CONSULTAS : "aloja"
```

---

## 📋 Índice de Documentación

1. **[01_SUPABASE_OVERVIEW.md](./01_SUPABASE_OVERVIEW.md)** - Este archivo
2. **[02_DATABASE_SCHEMA.md](./02_DATABASE_SCHEMA.md)** - Esquema detallado de tablas
3. **[03_FUNCTIONS_AND_TRIGGERS.md](./03_FUNCTIONS_AND_TRIGGERS.md)** - Funciones y triggers
4. **[04_FETCHING_PATTERNS.md](./04_FETCHING_PATTERNS.md)** - Patrones de consulta
5. **[05_PRACTICAL_EXAMPLES.md](./05_PRACTICAL_EXAMPLES.md)** - Ejemplos prácticos
6. **[06_BEST_PRACTICES.md](./06_BEST_PRACTICES.md)** - Mejores prácticas

---

## 🚀 Quick Start

### 1. Obtener todos los leads
```typescript
const { data: leads } = await supabase
  .from('leads')
  .select('*')
  .order('fecha_primer_contacto', { ascending: false })
```

### 2. Consultas de hoy
```typescript
const hoy = new Date().toISOString().split('T')[0]

const { data: consultas } = await supabase
  .from('consultas')
  .select(`
    *,
    pacientes(nombre_completo, telefono)
  `)
  .eq('fecha_consulta', hoy)
```

### 3. Crear lead desde WhatsApp
```typescript
const { data } = await supabase.rpc('upsert_lead_interaction', {
  p_nombre_completo: 'Juan Pérez',
  p_telefono_whatsapp: '+52 624 123 4567',
  p_fuente_lead: 'WhatsApp'
})
```

---

## ⚠️ Notas Importantes

### Seguridad
- ❌ **No hay RLS habilitado**: Todas las tablas son públicamente accesibles con la anon key
- ❌ **No hay autenticación**: El sistema actual no valida usuarios
- ✅ **HTTPS**: Todas las conexiones usan HTTPS

### Triggers Automáticos
- ✅ Normalización de teléfonos a MX10
- ✅ Generación automática de recordatorios al crear consultas
- ✅ Actualización de timestamps `updated_at`
- ✅ Actualización de totales de consultas en pacientes

### Limitaciones Actuales
- Sin autenticación de usuarios
- Sin políticas RLS
- Sin audit logs
- Sin backup automático visible en el panel

---

## 📞 Soporte

Para más información sobre cada tabla y sus campos, consulta:
- [02_DATABASE_SCHEMA.md](./02_DATABASE_SCHEMA.md)

Para funciones disponibles:
- [03_FUNCTIONS_AND_TRIGGERS.md](./03_FUNCTIONS_AND_TRIGGERS.md)
