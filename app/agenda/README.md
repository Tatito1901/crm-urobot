# 📅 Agenda de Consultas - Urobot CRM

## 📋 Descripción General

Interfaz profesional para la visualización y gestión de citas médicas del Dr. Mario Martínez Thomas. Diseñada con enfoque médico, mobile-first y optimizada para rendimiento.

---

## ✨ Características Principales

### 🎯 Funcionalidades Core

1. **Visualización Dual**
   - Vista de Calendario (Semana, Día, Mes)
   - Vista de Lista (optimizada para mobile)

2. **Búsqueda y Filtros Avanzados**
   - Búsqueda por nombre de paciente en tiempo real
   - Filtro por sede (Polanco, Satélite, Todas)
   - Filtro por estado de cita (Programada, Confirmada, Reagendada, Cancelada)
   - Filtros rápidos: "Solo hoy", "Pendientes de confirmar"

3. **Información Detallada**
   - Modal completo con todos los detalles de la cita
   - Estadísticas en tiempo real
   - Próximas 5 citas destacadas
   - Indicadores de urgencia (< 2h, < 24h)

4. **Sincronización en Tiempo Real**
   - Actualización automática vía Supabase Realtime
   - Indicador visual de sincronización activa

### 🎨 Diseño UI/UX

- **Dark Theme Profesional**: Paleta optimizada para uso prolongado
- **Mobile-First**: Diseño responsivo con breakpoints optimizados
- **Accesibilidad**: WCAG 2.1 AA compliant
- **Jerarquía Visual Clara**: Información priorizada por importancia
- **Micro-interacciones**: Transiciones suaves y feedback visual

---

## 📂 Arquitectura de Componentes

```
app/agenda/
├── page.tsx                          # Página principal (orquestador)
├── components/
│   ├── AppointmentCard.tsx           # Tarjeta de cita (variantes: default, compact)
│   ├── AppointmentListView.tsx       # Vista lista con agrupación por día
│   ├── AppointmentModal.tsx          # Modal con detalles completos + acciones
│   ├── FilterBar.tsx                 # Búsqueda y filtros avanzados
│   ├── QuickStats.tsx                # Estadísticas en tiempo real
│   ├── StatusBadge.tsx               # Badge de estado consistente
│   └── UpcomingAppointments.tsx      # Lista de próximas citas
└── lib/
    └── agenda-utils.ts               # Utilidades (formateo, filtrado, stats)
```

---

## 🔧 Componentes Principales

### 1. **AppointmentCard**

Tarjeta de cita reutilizable con dos variantes.

**Props:**
```typescript
{
  consulta: Consulta;              // Datos de la cita
  onClick?: () => void;            // Handler de click
  variant?: 'default' | 'compact'; // Variante visual
}
```

**Variantes:**
- `default`: Tarjeta completa con avatar, horario, ubicación y estado
- `compact`: Versión reducida para listas densas

**Características:**
- Avatar con iniciales del paciente
- Indicador de urgencia visual (< 2h → pulsante)
- Badge de estado con colores semánticos
- Alerta de confirmación pendiente

---

### 2. **AppointmentModal**

Modal completo con toda la información de la cita.

**Props:**
```typescript
{
  consulta: Consulta | null;  // Cita seleccionada
  isOpen: boolean;            // Estado de visibilidad
  onClose: () => void;        // Handler de cierre
}
```

**Secciones:**
1. **Header**: Avatar + Nombre completo + ID
2. **Información Principal**: Fecha, hora, sede, estado
3. **Detalles de Consulta**: Tipo, motivo, canal, confirmación
4. **Google Calendar**: Event ID + Link (si aplica)
5. **Info de Cancelación**: Motivo + Responsable (si aplica)
6. **Metadata**: Fechas de creación y actualización
7. **Footer Acciones**: Llamar, Email, Editar

**Accesibilidad:**
- Cierre con `Escape`
- Backdrop con click-away
- Focus trap interno

---

### 3. **AppointmentListView**

Vista de lista con agrupación automática por día.

**Props:**
```typescript
{
  events: CalendarEvent[];                 // Lista de eventos
  onAppointmentClick: (c: Consulta) => void; // Handler de click
  emptyMessage?: string;                   // Mensaje personalizado
}
```

**Características:**
- Agrupación automática por día
- Headers de día destacados (HOY, MAÑANA)
- Contador de citas por día
- Estado vacío con ilustración

---

### 4. **FilterBar**

Barra de búsqueda y filtros avanzados.

**Props:**
```typescript
{
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSede: 'ALL' | 'POLANCO' | 'SATELITE';
  onSedeChange: (sede) => void;
  selectedEstados: string[];
  onEstadosChange: (estados: string[]) => void;
  onlyToday: boolean;
  onOnlyTodayChange: (value: boolean) => void;
  onlyPendingConfirmation: boolean;
  onOnlyPendingConfirmationChange: (value: boolean) => void;
  totalResults: number;
}
```

**Características:**
- Campo de búsqueda con debounce automático
- Panel de filtros expandible
- Indicador de filtros activos
- Botón "Limpiar todo"
- Contador de resultados

---

### 5. **QuickStats**

Panel de estadísticas en tiempo real.

**Props:**
```typescript
{
  consultas: Consulta[];  // Lista de consultas filtradas
}
```

**Métricas mostradas:**
- Total de citas
- Confirmadas (con %)
- Programadas
- Canceladas (con %)
- Distribución por sede (con %)
- Próximas 24 horas
- Pendientes de confirmar

**Optimización:**
- Memoizado con React.memo
- Cálculo eficiente con función pura

---

### 6. **StatusBadge**

Badge consistente para estados de cita.

**Props:**
```typescript
{
  status: string;                              // Estado de la cita
  variant?: 'default' | 'compact' | 'dot-only'; // Variante visual
  className?: string;                          // Clases adicionales
}
```

**Estados soportados:**
- Programada → Azul
- Confirmada → Verde
- Reagendada → Amarillo
- Cancelada → Rojo
- Completada → Gris

---

## 🛠️ Utilidades (`agenda-utils.ts`)

### Formateo de Fechas

```typescript
formatShortTime(date)      // "09:00"
formatTimeRange(start, end) // "09:00 - 09:45"
formatLongDate(date)       // "Lunes 15 de mayo, 2025"
formatShortDate(date)      // "15/05"
formatMediumDate(date)     // "15 may"
```

### Cálculos de Tiempo

```typescript
getTimeUntil(appointmentDate)
// Returns: {
//   urgency: 'urgent' | 'soon' | 'normal' | 'past',
//   text: string,
//   totalMinutes: number,
//   isToday: boolean,
//   isTomorrow: boolean
// }
```

### Filtrado

```typescript
filterAppointments(consultas, {
  searchQuery?: string;
  sede?: 'ALL' | 'POLANCO' | 'SATELITE';
  estados?: string[];
  onlyToday?: boolean;
  onlyPendingConfirmation?: boolean;
})
```

### Estadísticas

```typescript
calculateStats(consultas)
// Returns: {
//   total, confirmadas, programadas, canceladas,
//   polanco, satelite, proximas24h, pendientesConfirmar,
//   confirmationRate, cancellationRate
// }
```

---

## 🎯 Flujo de Uso

### Escenario 1: Buscar paciente específico

1. Usuario escribe nombre en barra de búsqueda
2. Filtrado en tiempo real con debounce
3. Resultados actualizados instantáneamente
4. Click en cita → Modal con detalles completos

### Escenario 2: Ver solo citas de hoy pendientes

1. Click en botón "Filtros"
2. Activar "Solo citas de hoy"
3. Activar "Pendientes de confirmar"
4. Vista filtrada con contador actualizado

### Escenario 3: Navegación mobile

1. Vista lista activada por defecto en mobile
2. Scroll por días agrupados
3. Click en cita → Modal full-screen
4. Acciones rápidas: Llamar, Email

---

## 📱 Diseño Responsivo

### Breakpoints

| Dispositivo | Rango       | Layout                          |
|-------------|-------------|---------------------------------|
| Mobile      | < 640px     | Lista + Menú compacto           |
| Tablet      | 640-1024px  | Calendario + Sidebar colapsable |
| Desktop     | > 1024px    | Layout completo 3 columnas      |

### Estrategia Mobile-First

1. **Vista por defecto**: Lista (más usable en touch)
2. **Toggle Vista**: Cambio fácil a calendario
3. **Filtros**: Drawer expandible
4. **Acciones**: Botones grandes (44x44px mínimo)
5. **Tipografía**: Escalada responsiva

---

## ⚡ Optimizaciones de Rendimiento

### 1. Memoización Estratégica

```typescript
// Componentes memoizados
const AppointmentCard = React.memo(/* ... */)
const QuickStats = React.memo(/* ... */)
const UpcomingAppointments = React.memo(/* ... */)

// Valores calculados memoizados
const events = useMemo(() => /* transformación */, [filteredConsultas])
const upcomingEvents = useMemo(() => /* filtrado */, [events, timezone])
```

### 2. Callbacks Optimizados

```typescript
const handleAppointmentClick = useCallback((consulta) => {
  setSelectedAppointment(consulta);
  setIsModalOpen(true);
}, []);

const navigateDate = useCallback((direction) => {
  // navegación de fechas
}, [calendarApp, vistaCalendario]);
```

### 3. Filtrado Eficiente

- Función pura `filterAppointments` (sin side effects)
- Un solo paso de filtrado para todos los criterios
- Normalización de strings en minúsculas

### 4. Actualización Selectiva

- Sincronización en tiempo real con Supabase
- Solo re-render de componentes afectados
- Actualizaciones silenciosas en background

---

## 🎨 Sistema de Diseño

### Paleta de Colores

```css
/* Backgrounds */
--bg-primary: #0b0f16
--bg-secondary: #0d1118
--bg-tertiary: #111820

/* Borders */
--border-primary: #1e293b (slate-800)
--border-secondary: #334155 (slate-700)

/* Estados */
--status-programada: #60a5fa (blue-400)
--status-confirmada: #34d399 (green-400)
--status-reagendada: #fbbf24 (yellow-400)
--status-cancelada: #f87171 (red-400)

/* Texto */
--text-primary: #f1f5f9 (slate-100)
--text-secondary: #cbd5e1 (slate-300)
--text-tertiary: #94a3b8 (slate-400)
```

### Tipografía

```css
/* Headings */
h1: 2xl/3xl font-semibold
h2: xl font-semibold
h3: lg font-semibold

/* Body */
body: sm/base
small: xs text-slate-400
```

### Espaciado

- Base: 4px (0.25rem)
- Gaps: 12px (gap-3), 16px (gap-4), 24px (gap-6)
- Padding contenedores: 20px (p-5), 24px (p-6)
- Bordes redondeados: 16px (rounded-xl), 24px (rounded-2xl)

---

## ♿ Accesibilidad

### WCAG 2.1 AA Compliance

✅ **Contraste**: Mínimo 4.5:1 en todos los textos
✅ **Navegación por teclado**: Tab, Enter, Escape
✅ **ARIA labels**: Todos los iconos y acciones
✅ **Focus visible**: Anillo azul en elementos interactivos
✅ **Semántica HTML**: Headers, sections, buttons apropiados

### Características Específicas

- Labels descriptivos en inputs
- `aria-label` en botones de navegación
- Roles ARIA en modales
- Mensajes de estado para screen readers
- Texto alternativo en iconos

---

## 🧪 Testing (Recomendaciones)

### Unit Tests

```typescript
// Utilidades de formateo
describe('formatTimeRange', () => {
  it('formatea correctamente rango de 45 minutos', () => {
    // ...
  })
})

// Cálculos de estadísticas
describe('calculateStats', () => {
  it('calcula porcentaje de confirmación correcto', () => {
    // ...
  })
})
```

### Component Tests

```typescript
// AppointmentCard
describe('AppointmentCard', () => {
  it('muestra alerta de confirmación pendiente', () => {
    // ...
  })

  it('aplica clase de urgencia para citas < 2h', () => {
    // ...
  })
})
```

### Integration Tests

```typescript
// Flujo completo
describe('Agenda Page', () => {
  it('filtra citas por búsqueda y actualiza contador', () => {
    // ...
  })

  it('abre modal al hacer click en cita', () => {
    // ...
  })
})
```

---

## 🚀 Escalabilidad

### Para > 100 citas

1. **Virtualización**
   ```typescript
   import { useVirtualizer } from '@tanstack/react-virtual'

   const virtualizer = useVirtualizer({
     count: events.length,
     getScrollElement: () => parentRef.current,
     estimateSize: () => 120,
   })
   ```

2. **Paginación**
   - Cargar 50 citas iniciales
   - Infinite scroll para cargar más
   - Cache de resultados previos

3. **Índices de búsqueda**
   - Crear índice de nombres de pacientes
   - Búsqueda con Fuse.js para fuzzy matching

---

## 📝 Próximas Mejoras

### Prioridad Alta
- [ ] Virtualización para listas grandes
- [ ] Exportar agenda a PDF/Excel
- [ ] Notificaciones push para recordatorios
- [ ] Integración con WhatsApp para confirmaciones

### Prioridad Media
- [ ] Drag & drop para reagendar
- [ ] Vista de Timeline
- [ ] Filtro por rango de fechas personalizado
- [ ] Historial de cambios de cita

### Prioridad Baja
- [ ] Tema claro (light mode)
- [ ] Personalización de colores por usuario
- [ ] Atajos de teclado avanzados
- [ ] Sincronización offline

---

## 🤝 Contribuir

### Convenciones de Código

1. **Componentes**: PascalCase con React.FC
2. **Funciones**: camelCase con JSDoc
3. **Constantes**: UPPER_SNAKE_CASE
4. **Archivos**: kebab-case.tsx

### Estructura de Commits

```
tipo(alcance): descripción corta

Descripción detallada del cambio...

- Punto 1
- Punto 2
```

**Tipos**: feat, fix, refactor, docs, style, test, perf

---

## 📞 Soporte

Para preguntas o issues:
- GitHub Issues: [repo-url]
- Email: soporte@urobot.com
- Documentación: [docs-url]

---

## 📄 Licencia

Copyright © 2025 Urobot CRM. Todos los derechos reservados.
