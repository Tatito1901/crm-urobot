# 📅 Calendario tipo Google Calendar / Material Design

## 📋 Descripción

Interfaz profesional de calendario semanal inspirada en Google Calendar con diseño Material Design. Construida con Next.js App Router, TypeScript y Tailwind CSS.

---

## ✨ Características Principales

### 🎨 Diseño Material Design

- **Estética limpia**: Fondo blanco, líneas suaves grises, sin sombras pesadas
- **Tipografía**: Roboto en múltiples pesos (300, 400, 500, 700)
- **Colores**: Paleta Material Design consistente
- **Espaciado**: Generoso y consistente siguiendo guías de Material

### 🎯 Funcionalidades Core

1. **Navegación Semanal**
   - Botón "Esta semana" para volver al presente
   - Chevrons izq/der para navegar semanas
   - Rango visible: "10 - 16 noviembre, 2025"

2. **Mini Calendario (Sidebar)**
   - Grid 7×6 con navegación mensual
   - Hoy resaltado con círculo verde (#2E7D32)
   - Click en día → saltar a esa semana
   - Chevrons para cambiar mes

3. **Grid de Tiempo**
   - Horario: 11:00 - 21:30 cada 30 minutos
   - Altura slot: 48px
   - Líneas horizontales suaves cada 30min
   - Tinte laboral amarillo pálido (LUN-VIE)

4. **Encabezado de Días**
   - DÍA en mayúsculas + número grande
   - Hoy: círculo verde con número blanco
   - Sticky para scroll vertical

---

## 📂 Arquitectura de Componentes

```
app/agenda/calendar/
├── page.tsx                          # Página principal
└── components/calendar/
    ├── MiniMonth.tsx                 # Mini-calendario (7×6 grid)
    ├── Sidebar.tsx                   # Barra lateral (280px)
    ├── HeaderBar.tsx                 # Navegación superior (80px)
    ├── DaysHeader.tsx                # Encabezado de días (sticky)
    └── TimeGrid.tsx                  # Grid de horas y columnas

lib/
└── date-utils.ts                     # Utilidades de fechas (sin dependencias)
```

---

## 🔧 Componentes Detallados

### 1. **MiniMonth**

Grid de calendario mensual con navegación.

**Props:**
```typescript
{
  selectedDate: Date;              // Fecha seleccionada
  onDateSelect: (date: Date) => void; // Handler de selección
  currentMonth: Date;              // Mes actual
  onMonthChange: (date: Date) => void; // Handler de cambio de mes
}
```

**Características:**
- Grid 7 columnas × 6 semanas
- Hoy con círculo verde
- Días fuera del mes en gris claro
- Navegación con chevrons

---

### 2. **Sidebar**

Barra lateral fija con mini-calendario y enlaces.

**Props:**
```typescript
{
  selectedDate: Date;              // Fecha seleccionada
  onDateSelect: (date: Date) => void; // Handler de selección
}
```

**Secciones:**
1. Mini-calendario
2. Enlaces de acción:
   - "Lista de espera" (UI only)
   - "Bloquear fechas" (UI only)
3. Secciones desplegables:
   - "Visitas de hoy"
   - "Servicios"

---

### 3. **HeaderBar**

Barra de navegación superior con controles.

**Props:**
```typescript
{
  currentWeekStart: Date;          // Inicio de semana actual
  onWeekChange: (weekStart: Date) => void; // Handler de cambio
}
```

**Controles izquierda:**
- Botón "Esta semana"
- Chevrons ← →
- Rango de fecha (bold)

**Controles derecha:**
- Buscador (placeholder: "Buscar paciente por nombre, teléfono o CURP")
- Selector "Semana" (UI only)
- Icono configuración
- Icono más opciones

---

### 4. **DaysHeader**

Encabezado de días de la semana (sticky).

**Props:**
```typescript
{
  weekStart: Date;                 // Inicio de la semana
}
```

**Características:**
- Grid: columna vacía + 7 días
- Formato: DÍA (mayúsculas) + número
- Hoy: círculo verde 36px con número blanco
- Border-bottom gris suave

---

### 5. **TimeGrid**

Grid principal con columnas de horas y días.

**Props:**
```typescript
{
  weekStart: Date;                 // Inicio de la semana
  startHour?: number;              // Default: 11
  endHour?: number;                // Default: 21
}
```

**Características:**
- Columna de horas: 80px fija (sticky left)
- 7 columnas de días (ancho igual)
- Slots de 30min: 48px altura
- Hover: bg-blue-50
- Tinte laboral: bg-[#FFFEF7] (LUN-VIE)

---

## 📊 Utilidades de Fechas

### `lib/date-utils.ts`

Funciones puras sin dependencias externas (Date nativo).

**Funciones principales:**

```typescript
startOfWeek(date: Date): Date
// Retorna lunes de la semana

addDays(date: Date, days: number): Date
// Agrega/resta días

addWeeks(date: Date, weeks: number): Date
// Agrega/resta semanas

addMonths(date: Date, months: number): Date
// Agrega/resta meses

isSameDay(date1: Date, date2: Date): boolean
// Compara si son el mismo día

isToday(date: Date): boolean
// Verifica si es hoy

formatWeekRangeMX(startDate: Date): string
// Retorna: "10 - 16 noviembre, 2025"

getMonthMatrix(year: number, month: number): Date[][]
// Retorna matriz 6×7 para el mes

generateTimeSlots(startHour: number, endHour: number): string[]
// Retorna ["11:00", "11:30", ..., "21:30"]

getDayName(day: number, short?: boolean): string
// Retorna: "Lunes" o "Lun"

getMonthName(month: number): string
// Retorna: "Noviembre"
```

---

## 🎨 Tokens de Diseño

### Colores Material Design

```css
--color-green: #2E7D32          /* Verde principal */
--color-blue-light: #E3F2FD     /* Azul claro */
--color-blue-accent: #42A5F5    /* Azul acento */
--color-yellow-light: #FFF8E1   /* Amarillo claro */
--color-yellow-accent: #FFC107  /* Amarillo acento */

/* Grises */
--color-gray-50: #FAFAFA
--color-gray-100: #F5F5F5
--color-gray-200: #EEEEEE
--color-gray-300: #E0E0E0
--color-gray-500: #9E9E9E
--color-gray-700: #616161
--color-gray-900: #111
```

### Layout

```css
--sidebar-w: 280px              /* Ancho sidebar */
--header-h: 80px                /* Altura header */
--slot-h: 48px                  /* Altura slot 30min */
--color-line: #E0E0E0           /* Color líneas grid */
--color-today: #2E7D32          /* Color día actual */
--radius-card: 8px              /* Radio bordes */
```

---

## 🚀 Uso

### Navegación al calendario

```
URL: /agenda/calendar
```

### Estado inicial

- Fecha: 2025-11-11 (hoy por defecto)
- Semana: 10 - 16 noviembre, 2025
- Horario visible: 11:00 - 21:30

### Interacciones

1. **Mini-calendario:**
   - Click en día → salta a esa semana
   - Chevrons → cambia mes

2. **Navegación semanal:**
   - "Esta semana" → vuelve a semana actual
   - Chevrons ← → → cambia semana

3. **Grid:**
   - Hover en slot → resalta con azul claro
   - Click en slot → (preparado para agregar eventos)

---

## 🔄 Próxima Fase: Integración de Eventos

### Extensión recomendada

1. **Agregar componente `EventCard`:**
   ```typescript
   interface EventCardProps {
     event: Consulta;
     startTime: string;
     endTime: string;
     onClick: () => void;
   }
   ```

2. **Modificar `TimeGrid` para renderizar eventos:**
   - Calcular posición vertical basada en hora
   - Calcular altura basada en duración
   - Renderizar `EventCard` posicionado absolutamente

3. **Conectar con datos de Supabase:**
   - Usar hook `useConsultas` existente
   - Filtrar consultas por semana actual
   - Convertir a formato de eventos

4. **Agregar modal de detalles:**
   - Reutilizar `AppointmentModal` existente
   - Click en evento → abrir modal

---

## ♿ Accesibilidad

### WCAG 2.1 AA Compliance

✅ **Navegación por teclado**: Tab, Enter, Escape
✅ **ARIA labels**: Todos los botones e iconos
✅ **Roles**: grid, gridcell, row
✅ **aria-current**: date para día actual
✅ **Contraste**: Mínimo 4.5:1
✅ **Sticky headers**: Para contexto visual
✅ **Focus visible**: Anillo azul estándar

---

## 📱 Diseño Responsivo

**Actualmente optimizado para desktop (>1024px)**

### Mejoras futuras mobile:
- Sidebar colapsable
- Vista día única en mobile
- Gestos swipe para navegación
- Header compacto

---

## 🎯 Estado Actual

✅ Estructura completa implementada
✅ Navegación funcional (semana, mes, día)
✅ Diseño Material Design aplicado
✅ Accesibilidad básica
✅ Sin eventos (ready para integración)

---

## 📝 Notas Técnicas

### Sin dependencias externas de fechas
- No usa date-fns, dayjs, moment
- Todo con Date nativo
- Funciones puras en `lib/date-utils.ts`

### Fuente Roboto
- Cargada vía next/font
- Pesos: 300, 400, 500, 700
- Variable CSS: `--font-roboto`
- Clase utility: `.font-roboto`

### Tailwind CSS
- Sin configuración especial requerida
- Usa Tailwind v4 (@import "tailwindcss")
- Clases completas (no interpolación)

---

## 🔗 Referencias

- [Material Design Guidelines](https://m3.material.io/)
- [Google Calendar UI](https://calendar.google.com/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Creado por**: Claude
**Fecha**: 2025-11-12
**Versión**: 1.0.0
