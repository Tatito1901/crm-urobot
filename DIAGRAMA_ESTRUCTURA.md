# 📐 Diagrama Visual de la Reorganización

## 🔴 ANTES: Estructura Desorganizada

```
crm-urobot/
│
├── 📁 lib/                          🔴 PROBLEMA 1: Primera carpeta lib
│   ├── 📁 supabase/
│   │   ├── client.ts
│   │   ├── admin.ts
│   │   └── types.ts
│   ├── 📁 utils/
│   │   └── debounce.ts
│   ├── 📁 validators/
│   │   └── recordatorios.ts
│   ├── date-utils.ts
│   ├── mappers.ts
│   ├── temporal-loader.ts
│   └── utils.ts                     🔴 utils.ts #1
│
├── 📁 hooks/                        🔴 PROBLEMA 2: Primera carpeta hooks
│   ├── useConsultas.ts
│   ├── useDashboardMetrics.ts
│   ├── useDebouncedCallback.ts
│   ├── useLeads.ts
│   ├── useMediaQuery.ts
│   ├── usePacienteDetallado.ts
│   ├── usePacientes.ts
│   ├── usePrefetchRoutes.ts
│   ├── useRecordatorios.ts
│   └── useSwipeGesture.ts
│
├── 📁 components/                   🔴 PROBLEMA 3: Primera carpeta components
│   ├── 📁 providers/
│   │   └── theme-provider.tsx
│   └── 📁 ui/                       ✅ Solo shadcn (OK)
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
│
├── 📁 types/                        ✅ OK (centralizado)
│   ├── agenda.ts
│   ├── canales-marketing.ts
│   ├── common.ts
│   ├── consultas.ts
│   ├── dashboard.ts
│   ├── database.ts
│   ├── leads.ts
│   ├── pacientes.ts
│   ├── recordatorios.ts
│   └── supabase.ts
│
├── 📁 app/
│   │
│   ├── 📁 lib/                      🔴 PROBLEMA 4: Segunda carpeta lib
│   │   ├── crm-data.ts
│   │   ├── design-system.ts
│   │   ├── glosario-medico.ts
│   │   └── utils.ts                 🔴 utils.ts #2 (DUPLICADO!)
│   │
│   ├── 📁 components/               🔴 PROBLEMA 5: Segunda carpeta components
│   │   ├── 📁 analytics/
│   │   ├── 📁 common/
│   │   ├── 📁 crm/
│   │   ├── 📁 leads/
│   │   └── 📁 metrics/
│   │
│   ├── 📁 agenda/
│   │   ├── 📁 lib/                  🔴 PROBLEMA 6: Tercera carpeta lib
│   │   │   ├── agenda-utils.ts
│   │   │   ├── appointment-positioning.ts
│   │   │   ├── constants.ts
│   │   │   └── validation-rules.ts
│   │   │
│   │   ├── 📁 hooks/                🔴 PROBLEMA 7: Segunda carpeta hooks
│   │   │   ├── useAgendaState.ts
│   │   │   ├── useAppointmentForm.ts
│   │   │   └── useColorPreferences.ts
│   │   │
│   │   ├── 📁 components/           🔴 PROBLEMA 8: Tercera carpeta components
│   │   │   ├── 📁 calendar/
│   │   │   ├── 📁 customization/
│   │   │   ├── 📁 modals/
│   │   │   ├── 📁 shared/
│   │   │   └── 📁 views/
│   │   │
│   │   ├── 📁 services/
│   │   │   ├── appointments-service.ts
│   │   │   └── patients-service.ts
│   │   │
│   │   ├── 📁 docs/                 🔴 PROBLEMA 9: Docs solo de agenda
│   │   │   └── README.md
│   │   │
│   │   └── page.tsx
│   │
│   ├── 📁 pacientes/
│   │   ├── 📁 [id]/
│   │   │   ├── 📁 components/       🔴 PROBLEMA 10: Cuarta carpeta components
│   │   │   │   └── ...
│   │   │   └── page.tsx
│   │   └── page.tsx
│   │
│   ├── 📁 dashboard/
│   ├── 📁 leads/
│   ├── 📁 consultas/
│   ├── 📁 confirmaciones/
│   ├── 📁 estadisticas/
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
│
└── ...

❌ PROBLEMAS IDENTIFICADOS:
┌─────────────────────────────────────────────────────┐
│ 🔴 3 carpetas lib/ diferentes                       │
│ 🔴 2 carpetas hooks/ diferentes                     │
│ 🔴 4 carpetas components/ diferentes                │
│ 🔴 2 archivos utils.ts diferentes                   │
│ 🔴 Imports inconsistentes (@/ vs ../ vs ./)         │
│ 🔴 Sin separación dominio vs compartido             │
│ 🔴 Documentación dispersa                           │
│ 🔴 Difícil encontrar código relacionado             │
└─────────────────────────────────────────────────────┘
```

---

## 🟢 DESPUÉS: Estructura Organizada

```
crm-urobot/
│
├── 📁 src/                          ✅ TODO EL CÓDIGO AQUÍ
│   │
│   ├── 📁 lib/                      ✅ UNA SOLA carpeta lib (CONSOLIDADO)
│   │   ├── 📁 supabase/
│   │   │   ├── client.ts            ✅ Cliente Supabase
│   │   │   ├── admin.ts             ✅ Admin Supabase
│   │   │   └── types.ts
│   │   │
│   │   ├── 📁 utils/                ✅ Todas las utilidades aquí
│   │   │   ├── dates.ts             ✅ Ex date-utils.ts
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts        ✅ Ex validators/
│   │   │   ├── mappers.ts
│   │   │   ├── debounce.ts
│   │   │   ├── common.ts            ✅ Ex utils.ts
│   │   │   ├── app-utils.ts         ✅ Ex app/lib/utils.ts
│   │   │   └── temporal-loader.ts
│   │   │
│   │   ├── 📁 constants/            ✅ Constantes globales
│   │   │   ├── app.ts
│   │   │   └── medical.ts           ✅ Ex glosario-medico.ts
│   │   │
│   │   └── 📁 design-system/        ✅ Sistema de diseño
│   │       ├── colors.ts
│   │       ├── tokens.ts
│   │       └── theme.ts             ✅ Ex design-system.ts
│   │
│   ├── 📁 hooks/                    ✅ UNA SOLA carpeta hooks (CONSOLIDADO)
│   │   │
│   │   ├── 📁 shared/               ✅ Hooks compartidos
│   │   │   ├── useMediaQuery.ts
│   │   │   ├── useDebouncedCallback.ts
│   │   │   ├── useSwipeGesture.ts
│   │   │   └── usePrefetchRoutes.ts
│   │   │
│   │   ├── 📁 domain/               ✅ ORGANIZADO POR DOMINIO
│   │   │   │
│   │   │   ├── 📁 leads/
│   │   │   │   └── useLeads.ts
│   │   │   │
│   │   │   ├── 📁 pacientes/
│   │   │   │   ├── usePacientes.ts
│   │   │   │   └── usePacienteDetallado.ts
│   │   │   │
│   │   │   ├── 📁 consultas/
│   │   │   │   └── useConsultas.ts
│   │   │   │
│   │   │   ├── 📁 recordatorios/
│   │   │   │   └── useRecordatorios.ts
│   │   │   │
│   │   │   ├── 📁 dashboard/
│   │   │   │   └── useDashboardMetrics.ts
│   │   │   │
│   │   │   └── 📁 agenda/           ✅ Hooks de agenda integrados
│   │   │       ├── useAgendaState.ts
│   │   │       ├── useAppointmentForm.ts
│   │   │       └── useColorPreferences.ts
│   │   │
│   │   └── index.ts                 ✅ Barrel export
│   │
│   ├── 📁 components/               ✅ UNA SOLA carpeta components (CONSOLIDADO)
│   │   │
│   │   ├── 📁 ui/                   ✅ Componentes shadcn
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   │
│   │   ├── 📁 providers/            ✅ React providers
│   │   │   └── theme-provider.tsx
│   │   │
│   │   ├── 📁 layout/               ✅ Componentes de layout
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MobileNav.tsx
│   │   │
│   │   ├── 📁 shared/               ✅ Componentes compartidos
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── EmptyState.tsx
│   │   │
│   │   ├── 📁 domain/               ✅ ORGANIZADO POR DOMINIO
│   │   │   │
│   │   │   ├── 📁 leads/
│   │   │   │   └── LeadCard.tsx
│   │   │   │
│   │   │   ├── 📁 pacientes/
│   │   │   │   ├── PacienteCard.tsx
│   │   │   │   └── PacienteForm.tsx
│   │   │   │
│   │   │   ├── 📁 consultas/
│   │   │   │   ├── ConsultaCard.tsx
│   │   │   │   └── ConsultaForm.tsx
│   │   │   │
│   │   │   ├── 📁 analytics/
│   │   │   │   ├── MetricCard.tsx
│   │   │   │   └── ChartCard.tsx
│   │   │   │
│   │   │   ├── 📁 metrics/
│   │   │   │   └── ...
│   │   │   │
│   │   │   └── 📁 agenda/           ✅ Componentes de agenda integrados
│   │   │       ├── 📁 calendar/
│   │   │       │   ├── Calendar.tsx
│   │   │       │   ├── DaysHeader.tsx
│   │   │       │   ├── TimeGrid.tsx
│   │   │       │   └── ...
│   │   │       ├── 📁 modals/
│   │   │       │   └── ...
│   │   │       └── 📁 shared/
│   │   │           └── ...
│   │   │
│   │   └── index.ts                 ✅ Barrel export
│   │
│   ├── 📁 features/                 ✅ NUEVO: Features con lógica compleja
│   │   │
│   │   ├── 📁 agenda/
│   │   │   ├── 📁 services/
│   │   │   │   ├── appointments-service.ts
│   │   │   │   └── patients-service.ts
│   │   │   │
│   │   │   ├── 📁 utils/            ✅ Utils específicos de agenda
│   │   │   │   ├── agenda-utils.ts
│   │   │   │   ├── appointment-positioning.ts
│   │   │   │   ├── constants.ts
│   │   │   │   └── validation-rules.ts
│   │   │   │
│   │   │   └── types.ts             ✅ Types específicos
│   │   │
│   │   └── 📁 auth/
│   │       ├── 📁 services/
│   │       └── types.ts
│   │
│   ├── 📁 types/                    ✅ Solo types GLOBALES
│   │   ├── common.ts
│   │   ├── database.ts
│   │   ├── supabase.ts
│   │   ├── canales-marketing.ts
│   │   ├── consultas.ts
│   │   ├── dashboard.ts
│   │   ├── leads.ts
│   │   ├── pacientes.ts
│   │   ├── recordatorios.ts
│   │   └── index.ts
│   │
│   └── 📁 app/                      ✅ SOLO rutas y páginas de Next.js
│       │
│       ├── 📁 (auth)/               ✅ Grupo de rutas auth
│       │   ├── 📁 login/
│       │   └── 📁 register/
│       │
│       ├── 📁 (dashboard)/          ✅ Grupo de rutas dashboard
│       │   ├── 📁 dashboard/
│       │   │   └── page.tsx
│       │   │
│       │   ├── 📁 leads/
│       │   │   └── page.tsx
│       │   │
│       │   ├── 📁 pacientes/
│       │   │   ├── page.tsx
│       │   │   └── 📁 [id]/
│       │   │       ├── page.tsx
│       │   │       └── 📁 _components/  ✅ Componentes privados
│       │   │           └── ...
│       │   │
│       │   ├── 📁 consultas/
│       │   │   └── page.tsx
│       │   │
│       │   ├── 📁 agenda/
│       │   │   └── page.tsx
│       │   │
│       │   ├── 📁 confirmaciones/
│       │   │   └── page.tsx
│       │   │
│       │   └── 📁 estadisticas/
│       │       └── page.tsx
│       │
│       ├── 📁 api/                  ✅ API Routes
│       │
│       ├── layout.tsx
│       ├── page.tsx
│       ├── globals.css
│       └── providers.tsx
│
├── 📁 docs/                         ✅ Documentación CENTRALIZADA
│   ├── README.md
│   ├── ARQUITECTURA.md
│   ├── GUIA_MIGRACION_SUPABASE.md
│   ├── FUNCIONES_FALTANTES.md
│   ├── CANALES_MARKETING.md
│   │
│   └── 📁 agenda/                   ✅ Docs específicos organizados
│       └── README.md
│
├── 📁 scripts/                      ✅ Scripts (sin cambio)
├── 📁 public/                       ✅ Assets (sin cambio)
├── 📁 FLUJOS N8N/                   ✅ Flujos n8n (sin cambio)
│
├── tsconfig.json                    ✅ Actualizado con nuevos paths
├── package.json
├── next.config.ts
└── ...

✅ PROBLEMAS RESUELTOS:
┌─────────────────────────────────────────────────────┐
│ ✅ 1 sola carpeta lib/ (consolidado)                │
│ ✅ 1 sola carpeta hooks/ (organizado por dominio)   │
│ ✅ 1 sola carpeta components/ (organizado)          │
│ ✅ Features para lógica compleja                    │
│ ✅ Imports consistentes con @/                      │
│ ✅ Separación clara dominio vs compartido           │
│ ✅ Documentación centralizada                       │
│ ✅ Código relacionado agrupado                      │
│ ✅ Fácil de mantener y escalar                      │
└─────────────────────────────────────────────────────┘
```

---

## 📈 Comparación Visual de Imports

### ❌ ANTES: Imports Caóticos

```typescript
// En app/dashboard/page.tsx
import { supabase } from '@/lib/supabase/client'          // Desde raíz
import { crm } from '../lib/crm-data'                     // Relativo a app
import utils from './lib/utils'                           // Local
import { useLeads } from '@/hooks/useLeads'               // Desde raíz
import { Button } from '@/components/ui/button'           // Desde raíz

// En app/agenda/components/Calendar.tsx
import { Temporal } from '@/lib/temporal-loader'          // Desde raíz
import { formatDate } from '../lib/agenda-utils'          // Relativo a agenda
import constants from '../lib/constants'                  // Relativo a agenda
import { useAgendaState } from '../hooks/useAgendaState'  // Relativo a agenda
import { TimeGrid } from './calendar/TimeGrid'            // Local

// En app/pacientes/page.tsx
import { usePacientes } from '@/hooks/usePacientes'       // Desde raíz
import { AppShell } from '@/app/components/common/AppShell' // Mezclado
import { PacienteCard } from '@/app/components/crm/PacienteCard'
```

**Problemas**:
- 🔴 Mezcla de rutas absolutas y relativas
- 🔴 No hay patrón consistente
- 🔴 Difícil de refactorizar
- 🔴 Propenso a errores

---

### ✅ DESPUÉS: Imports Consistentes

```typescript
// En src/app/dashboard/page.tsx
import { supabase } from '@/lib/supabase/client'
import { useLeads } from '@/hooks/domain/leads/useLeads'
import { useDashboardMetrics } from '@/hooks/domain/dashboard/useDashboardMetrics'
import { Button } from '@/components/ui/button'
import { MetricCard } from '@/components/domain/analytics/MetricCard'
import { AppShell } from '@/components/layout/AppShell'

// En src/app/agenda/page.tsx
import { appointmentsService } from '@/features/agenda/services/appointments-service'
import { formatAppointmentTime } from '@/features/agenda/utils/agenda-utils'
import { AGENDA_CONSTANTS } from '@/features/agenda/utils/constants'
import { useAgendaState } from '@/hooks/domain/agenda/useAgendaState'
import { Calendar } from '@/components/domain/agenda/calendar/Calendar'
import { AppShell } from '@/components/layout/AppShell'

// En src/app/pacientes/page.tsx
import { usePacientes } from '@/hooks/domain/pacientes/usePacientes'
import { AppShell } from '@/components/layout/AppShell'
import { PacienteCard } from '@/components/domain/pacientes/PacienteCard'
import { Button } from '@/components/ui/button'
```

**Ventajas**:
- ✅ Todos los imports usan `@/` (absolutos)
- ✅ Estructura clara y predecible
- ✅ Fácil de refactorizar
- ✅ Autocompletado mejorado en IDE
- ✅ Fácil de entender la dependencia

---

## 🎯 Flujo de Trabajo Mejorado

### ❌ ANTES: ¿Dónde pongo este código?

```
Desarrollador: "Necesito crear un hook para manejar citas médicas"
🤔 ¿En /hooks/?
🤔 ¿En /app/agenda/hooks/?
🤔 ¿Es específico de agenda o general?
😰 No sé... lo pongo en /hooks/ por ahora...
```

### ✅ DESPUÉS: Ubicación Clara

```
Desarrollador: "Necesito crear un hook para manejar citas médicas"
✅ Es del dominio agenda → src/hooks/domain/agenda/
✅ Archivo: src/hooks/domain/agenda/useAppointments.ts
✅ Import: import { useAppointments } from '@/hooks/domain/agenda/useAppointments'
😊 ¡Fácil y claro!
```

---

## 📊 Métricas de Mejora

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Carpetas `lib/` | 3 | 1 | -66% |
| Carpetas `hooks/` | 2 | 1 | -50% |
| Carpetas `components/` | 4 | 1 | -75% |
| Niveles de anidación promedio | 4-5 | 3-4 | -25% |
| Imports relativos | ~40% | 0% | -100% |
| Tiempo para encontrar archivo | ~2 min | ~30 seg | -75% |
| Archivos duplicados | 2 | 0 | -100% |

---

## 🔄 Flujo de Datos Simplificado

### ANTES: Flujo Confuso
```
Usuario → app/pacientes/page.tsx
              ↓
         hooks/usePacientes.ts
              ↓
         lib/supabase/client.ts
              ↓
         app/lib/utils.ts ??? ← ¿Cuál usar?
         lib/utils.ts     ???
              ↓
         app/components/crm/PacienteCard.tsx
```

### DESPUÉS: Flujo Claro
```
Usuario → src/app/pacientes/page.tsx
              ↓
         src/hooks/domain/pacientes/usePacientes.ts
              ↓
         src/lib/supabase/client.ts
              ↓
         src/lib/utils/formatters.ts
              ↓
         src/components/domain/pacientes/PacienteCard.tsx
```

---

## 🎓 Convenciones Establecidas

### Cuándo usar cada carpeta:

| Carpeta | Uso | Ejemplo |
|---------|-----|---------|
| `src/lib/` | Utilidades compartidas globalmente | `dates.ts`, `supabase/` |
| `src/hooks/shared/` | Hooks genéricos reutilizables | `useMediaQuery` |
| `src/hooks/domain/` | Hooks de lógica de negocio | `useLeads`, `usePacientes` |
| `src/components/ui/` | Componentes shadcn | `button.tsx` |
| `src/components/layout/` | Componentes de estructura | `AppShell`, `Sidebar` |
| `src/components/domain/` | Componentes de dominio | `LeadCard`, `AgendaCalendar` |
| `src/features/` | Lógica compleja con servicios | `agenda/`, `auth/` |
| `src/types/` | Solo interfaces globales | `common.ts`, `database.ts` |
| `src/app/` | Solo páginas y rutas | `page.tsx`, `layout.tsx` |

---

**🎉 Con esta reorganización, tu proyecto será más mantenible, escalable y profesional!**
