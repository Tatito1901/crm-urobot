# 📁 Plan de Reorganización del Proyecto CRM-UROBOT

## 🎯 Objetivo
Consolidar carpetas duplicadas y establecer una estructura clara basada en mejores prácticas de Next.js 15 y arquitectura limpia.

---

## 📊 Estado Actual vs Propuesto

### ❌ ESTRUCTURA ACTUAL (DESORGANIZADA)

```
crm-urobot/
├── lib/                         # ❌ Utils generales
│   ├── supabase/
│   ├── utils/
│   ├── validators/
│   ├── date-utils.ts
│   └── mappers.ts
├── hooks/                       # ❌ Hooks globales
│   ├── useConsultas.ts
│   ├── usePacientes.ts
│   └── ... (10 archivos)
├── components/                  # ❌ Solo shadcn
│   ├── ui/
│   └── providers/
├── types/                       # ✅ OK (centralizado)
├── app/
│   ├── lib/                    # ❌ Utils duplicados
│   │   ├── crm-data.ts
│   │   ├── design-system.ts
│   │   └── utils.ts            # ❌ DUPLICADO
│   ├── components/             # ❌ Componentes del dominio mezclados
│   │   ├── analytics/
│   │   ├── common/
│   │   ├── crm/
│   │   ├── leads/
│   │   └── metrics/
│   └── agenda/
│       ├── lib/                # ❌ Utils de agenda aislados
│       ├── hooks/              # ❌ Hooks de agenda aislados
│       ├── components/         # ❌ Componentes de agenda aislados
│       └── docs/               # ❌ Docs solo de agenda
```

**Problemas críticos**:
- 🔴 3 carpetas `lib/` diferentes
- 🔴 2 carpetas `hooks/` diferentes
- 🔴 4 carpetas `components/` diferentes
- 🔴 2 archivos `utils.ts` diferentes
- 🔴 Imports inconsistentes (`@/lib` vs `../lib` vs `./lib`)
- 🔴 No separación clara entre código compartido y código de dominio

---

### ✅ ESTRUCTURA PROPUESTA (ORGANIZADA)

```
crm-urobot/
├── src/                         # 🆕 Todo el código fuente aquí
│   │
│   ├── lib/                     # ✅ Utilidades compartidas (consolidado)
│   │   ├── supabase/
│   │   │   ├── client.ts        # Cliente Supabase
│   │   │   ├── admin.ts         # Admin Supabase
│   │   │   └── types.ts         # Types Supabase
│   │   ├── utils/
│   │   │   ├── dates.ts         # ✅ date-utils.ts renombrado
│   │   │   ├── formatters.ts    # Formateo de datos
│   │   │   ├── validators.ts    # Validaciones generales
│   │   │   └── mappers.ts       # Mapeo de datos
│   │   ├── constants/           # 🆕 Constantes globales
│   │   │   ├── app.ts
│   │   │   └── medical.ts       # ✅ glosario-medico.ts movido
│   │   └── design-system/       # 🆕 Sistema de diseño
│   │       ├── colors.ts
│   │       ├── tokens.ts
│   │       └── theme.ts         # ✅ design-system.ts refactorizado
│   │
│   ├── hooks/                   # ✅ Todos los hooks aquí (consolidado)
│   │   ├── shared/              # 🆕 Hooks compartidos
│   │   │   ├── useMediaQuery.ts
│   │   │   ├── useDebouncedCallback.ts
│   │   │   ├── useSwipeGesture.ts
│   │   │   └── usePrefetchRoutes.ts
│   │   ├── domain/              # 🆕 Hooks por dominio de negocio
│   │   │   ├── leads/
│   │   │   │   └── useLeads.ts
│   │   │   ├── pacientes/
│   │   │   │   ├── usePacientes.ts
│   │   │   │   └── usePacienteDetallado.ts
│   │   │   ├── consultas/
│   │   │   │   └── useConsultas.ts
│   │   │   ├── recordatorios/
│   │   │   │   └── useRecordatorios.ts
│   │   │   ├── dashboard/
│   │   │   │   └── useDashboardMetrics.ts
│   │   │   └── agenda/          # ✅ Hooks de agenda integrados
│   │   │       ├── useAgendaState.ts
│   │   │       ├── useAppointmentForm.ts
│   │   │       └── useColorPreferences.ts
│   │   └── index.ts             # 🆕 Barrel export
│   │
│   ├── components/              # ✅ Todos los componentes aquí (consolidado)
│   │   ├── ui/                  # ✅ Componentes shadcn (sin cambio)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── providers/           # ✅ Providers (sin cambio)
│   │   │   └── theme-provider.tsx
│   │   ├── layout/              # 🆕 Componentes de layout
│   │   │   ├── AppShell.tsx     # ✅ Movido de app/components/common
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── domain/              # 🆕 Componentes por dominio
│   │   │   ├── leads/
│   │   │   │   └── LeadCard.tsx
│   │   │   ├── pacientes/
│   │   │   │   ├── PacienteCard.tsx
│   │   │   │   └── PacienteForm.tsx
│   │   │   ├── consultas/
│   │   │   │   ├── ConsultaCard.tsx
│   │   │   │   └── ConsultaForm.tsx
│   │   │   ├── analytics/       # ✅ Movido de app/components/analytics
│   │   │   │   ├── MetricCard.tsx
│   │   │   │   └── ChartCard.tsx
│   │   │   ├── metrics/         # ✅ Movido de app/components/metrics
│   │   │   │   └── ...
│   │   │   └── agenda/          # ✅ Componentes de agenda integrados
│   │   │       ├── calendar/
│   │   │       │   ├── Calendar.tsx
│   │   │       │   ├── DaysHeader.tsx
│   │   │       │   ├── TimeGrid.tsx
│   │   │       │   └── ...
│   │   │       ├── modals/
│   │   │       │   └── ...
│   │   │       └── shared/
│   │   │           └── ...
│   │   ├── shared/              # 🆕 Componentes compartidos
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── EmptyState.tsx
│   │   └── index.ts             # 🆕 Barrel export
│   │
│   ├── features/                # 🆕 Features con lógica compleja
│   │   ├── agenda/
│   │   │   ├── services/        # ✅ Servicios de agenda
│   │   │   │   ├── appointments-service.ts
│   │   │   │   └── patients-service.ts
│   │   │   ├── utils/           # ✅ Utils específicos de agenda
│   │   │   │   ├── agenda-utils.ts
│   │   │   │   ├── appointment-positioning.ts
│   │   │   │   ├── constants.ts
│   │   │   │   └── validation-rules.ts
│   │   │   └── types.ts         # ✅ types/agenda.ts movido aquí
│   │   └── auth/
│   │       ├── services/
│   │       └── types.ts
│   │
│   ├── types/                   # ✅ Types globales (solo interfaces compartidas)
│   │   ├── common.ts
│   │   ├── database.ts
│   │   ├── supabase.ts
│   │   └── index.ts
│   │
│   └── app/                     # ✅ Solo rutas y páginas de Next.js
│       ├── (auth)/              # 🆕 Grupo de rutas auth
│       │   ├── login/
│       │   └── register/
│       ├── (dashboard)/         # 🆕 Grupo de rutas dashboard
│       │   ├── dashboard/
│       │   │   └── page.tsx
│       │   ├── leads/
│       │   │   └── page.tsx
│       │   ├── pacientes/
│       │   │   ├── page.tsx
│       │   │   └── [id]/
│       │   │       ├── page.tsx
│       │   │       └── _components/  # 🆕 Componentes privados de página
│       │   │           └── ...
│       │   ├── consultas/
│       │   │   └── page.tsx
│       │   ├── agenda/
│       │   │   └── page.tsx
│       │   ├── confirmaciones/
│       │   │   └── page.tsx
│       │   └── estadisticas/
│       │       └── page.tsx
│       ├── api/                 # API Routes
│       ├── layout.tsx
│       ├── page.tsx
│       ├── globals.css
│       └── providers.tsx
│
├── docs/                        # ✅ Documentación centralizada
│   ├── README.md
│   ├── ARQUITECTURA.md
│   ├── GUIA_MIGRACION_SUPABASE.md
│   ├── FUNCIONES_FALTANTES.md
│   ├── CANALES_MARKETING.md
│   ├── agenda/                  # ✅ Docs específicos
│   │   └── README.md
│   └── ...
│
├── scripts/                     # ✅ Scripts (sin cambio)
├── public/                      # ✅ Assets (sin cambio)
├── FLUJOS N8N/                  # ✅ Flujos n8n (sin cambio)
└── [archivos de config]         # ✅ Config (sin cambio)
```

---

## 🔑 Principios de la Nueva Estructura

### 1. **Consolidación**
- ✅ Una sola carpeta `lib/` para utilidades
- ✅ Una sola carpeta `hooks/` para todos los hooks
- ✅ Una sola carpeta `components/` para todos los componentes
- ✅ Una sola carpeta `docs/` para toda la documentación

### 2. **Separación por Dominio**
```
hooks/domain/
  ├── leads/          # Todo sobre leads
  ├── pacientes/      # Todo sobre pacientes
  ├── consultas/      # Todo sobre consultas
  └── agenda/         # Todo sobre agenda
```

### 3. **Features para Lógica Compleja**
```
features/
  └── agenda/
      ├── services/   # Lógica de negocio
      ├── utils/      # Utils específicos
      └── types.ts    # Types específicos
```

### 4. **Imports Consistentes**
```typescript
// ✅ SIEMPRE usar alias desde src/
import { supabase } from '@/lib/supabase/client'
import { useLeads } from '@/hooks/domain/leads/useLeads'
import { Button } from '@/components/ui/button'
import { LeadCard } from '@/components/domain/leads/LeadCard'
import { appointmentsService } from '@/features/agenda/services/appointments-service'
```

### 5. **Componentes Privados de Página**
```
app/(dashboard)/pacientes/[id]/
  ├── page.tsx
  └── _components/        # Solo para esta página
      ├── TabNavigation.tsx
      └── HistoryCard.tsx
```

---

## 🚀 Ventajas de la Nueva Estructura

### ✅ Mantenibilidad
- Código relacionado agrupado por dominio
- Fácil encontrar y modificar funcionalidad
- Menos duplicación de código

### ✅ Escalabilidad
- Agregar nuevos dominios sin afectar existentes
- Estructura clara para nuevos desarrolladores
- Preparado para monorepo si crece

### ✅ Testing
- Tests junto a su código
- Fácil mockear dependencias
- Cobertura por dominio

### ✅ Performance
- Tree-shaking mejorado con barrel exports
- Code-splitting por dominio
- Imports optimizados

---

## 📋 Plan de Migración (3 Fases)

### **FASE 1: Preparación** (1 día)
1. ✅ Crear estructura de carpetas en `src/`
2. ✅ Configurar alias en `tsconfig.json`
3. ✅ Crear barrel exports (`index.ts`)
4. ✅ Actualizar `.gitignore` si es necesario

### **FASE 2: Migración** (2-3 días)
1. ✅ Mover y consolidar `lib/`
2. ✅ Mover y organizar `hooks/` por dominio
3. ✅ Mover y organizar `components/` por dominio
4. ✅ Crear `features/agenda/` con su lógica
5. ✅ Mover `types/` específicos a features
6. ✅ Actualizar imports en toda la app
7. ✅ Mover `docs/` a raíz y organizar

### **FASE 3: Validación** (1 día)
1. ✅ Verificar compilación sin errores
2. ✅ Ejecutar tests
3. ✅ Probar funcionalidad crítica
4. ✅ Actualizar documentación
5. ✅ Eliminar carpetas antiguas
6. ✅ Commit y push

---

## 🔧 Cambios en Configuración

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/components/*": ["./src/components/*"],
      "@/features/*": ["./src/features/*"],
      "@/types/*": ["./src/types/*"],
      "@/app/*": ["./src/app/*"]
    }
  }
}
```

### `next.config.ts`
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Actualizar si hay configuración de paths
}
```

---

## 📝 Checklist de Migración

### Preparación
- [ ] Crear backup del proyecto
- [ ] Crear rama `refactor/reorganize-structure`
- [ ] Crear carpeta `src/` con subcarpetas

### Migración de `lib/`
- [ ] Mover `/lib/supabase/` → `/src/lib/supabase/`
- [ ] Consolidar `/lib/utils/` + `/app/lib/utils.ts` → `/src/lib/utils/`
- [ ] Mover `/lib/validators/` → `/src/lib/utils/validators.ts`
- [ ] Mover `/lib/date-utils.ts` → `/src/lib/utils/dates.ts`
- [ ] Mover `/lib/mappers.ts` → `/src/lib/utils/mappers.ts`
- [ ] Mover `/app/lib/design-system.ts` → `/src/lib/design-system/`
- [ ] Mover `/app/lib/glosario-medico.ts` → `/src/lib/constants/medical.ts`
- [ ] Eliminar `/app/lib/crm-data.ts` (datos mock) o mover a `/scripts/`

### Migración de `hooks/`
- [ ] Crear `/src/hooks/shared/`
- [ ] Crear `/src/hooks/domain/` con subdominios
- [ ] Mover hooks de `/hooks/` según dominio
- [ ] Mover hooks de `/app/agenda/hooks/` → `/src/hooks/domain/agenda/`
- [ ] Crear `index.ts` con barrel exports

### Migración de `components/`
- [ ] Mover `/components/ui/` → `/src/components/ui/`
- [ ] Mover `/components/providers/` → `/src/components/providers/`
- [ ] Crear `/src/components/layout/`
- [ ] Crear `/src/components/domain/` con subdominios
- [ ] Mover componentes de `/app/components/` según dominio
- [ ] Mover componentes de `/app/agenda/components/` → `/src/components/domain/agenda/`
- [ ] Componentes de páginas → `_components/` en la ruta

### Migración de `features/`
- [ ] Crear `/src/features/agenda/`
- [ ] Mover `/app/agenda/services/` → `/src/features/agenda/services/`
- [ ] Mover `/app/agenda/lib/` → `/src/features/agenda/utils/`
- [ ] Mover `/types/agenda.ts` → `/src/features/agenda/types.ts`

### Migración de `types/`
- [ ] Mantener solo types globales en `/src/types/`
- [ ] Mover types específicos a sus features

### Migración de `docs/`
- [ ] Crear `/docs/` en raíz
- [ ] Mover docs de root actual
- [ ] Mover `/app/agenda/docs/` → `/docs/agenda/`

### Actualización de Imports
- [ ] Buscar y reemplazar `from '@/lib'` → nuevas rutas
- [ ] Buscar y reemplazar `from '@/hooks'` → nuevas rutas
- [ ] Buscar y reemplazar `from '@/components'` → nuevas rutas
- [ ] Buscar y reemplazar imports relativos → absolutos
- [ ] Verificar imports en tests

### Validación
- [ ] `npm run build` sin errores
- [ ] `npm run lint` sin errores
- [ ] Ejecutar tests
- [ ] Verificar funcionalidad en desarrollo
- [ ] Revisar que no queden archivos huérfanos

### Limpieza
- [ ] Eliminar carpetas antiguas vacías
- [ ] Actualizar README.md con nueva estructura
- [ ] Actualizar documentación técnica
- [ ] Commit y push

---

## ⚠️ Riesgos y Mitigaciones

### Riesgo 1: Imports rotos
**Mitigación**: Usar búsqueda global y reemplazar con regex, probar compilación frecuentemente

### Riesgo 2: Pérdida de historial Git
**Mitigación**: Usar `git mv` en lugar de mover manualmente

### Riesgo 3: Tiempo de inactividad
**Mitigación**: Hacer en rama separada, merge solo cuando todo funcione

### Riesgo 4: Dependencias circulares
**Mitigación**: Usar barrel exports con cuidado, verificar con herramientas

---

## 🎯 Resultado Esperado

### Antes
```typescript
// ❌ Confuso, inconsistente
import { supabase } from '@/lib/supabase/client'
import { crm } from '../lib/crm-data'
import utils from './lib/utils'
import { useAgendaState } from './hooks/useAgendaState'
```

### Después
```typescript
// ✅ Claro, consistente
import { supabase } from '@/lib/supabase/client'
import { useLeads } from '@/hooks/domain/leads/useLeads'
import { Button } from '@/components/ui/button'
import { LeadCard } from '@/components/domain/leads/LeadCard'
import { appointmentsService } from '@/features/agenda/services/appointments-service'
```

---

## 📚 Referencias

- [Next.js Project Structure](https://nextjs.org/docs/getting-started/project-structure)
- [React Folder Structure](https://react.dev/learn/thinking-in-react)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)

---

**Fecha creación**: 2025-11-19  
**Versión**: 1.0  
**Estado**: Propuesta pendiente de aprobación
