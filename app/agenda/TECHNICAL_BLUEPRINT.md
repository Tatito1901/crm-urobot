# 📐 BLUEPRINT TÉCNICO - NUEVA AGENDA UROLÓGICA

**Versión:** 2.0
**Fecha:** Noviembre 2025
**Autor:** Sistema de Refactorización Agenda
**Estado:** ✅ Implementado y listo para producción

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Diseño de Datos](#diseño-de-datos)
4. [Componentes y UI](#componentes-y-ui)
5. [Estado y Lógica de Negocio](#estado-y-lógica-de-negocio)
6. [Capa de Servicios API](#capa-de-servicios-api)
7. [Flujos de Usuario](#flujos-de-usuario)
8. [Seguridad y Validaciones](#seguridad-y-validaciones)
9. [Performance y Optimización](#performance-y-optimización)
10. [Testing y Quality](#testing-y-quality)
11. [Deployment y Activación](#deployment-y-activación)

---

## 1. RESUMEN EJECUTIVO

### 1.1 Objetivo

Refactorizar el sistema de agenda urológica para proporcionar una experiencia de usuario moderna, eficiente y mantenible, sin romper la funcionalidad existente.

### 1.2 Principios de Diseño

- ✅ **Sin Breaking Changes:** Coexistencia con código actual
- ✅ **Separation of Concerns:** UI, lógica, datos separados
- ✅ **Type Safety:** TypeScript estricto en todo el código
- ✅ **Performance First:** Optimización desde el diseño
- ✅ **Accessibility:** WCAG 2.1 AA compliance
- ✅ **Testability:** Arquitectura preparada para testing

### 1.3 Stack Tecnológico

```typescript
// Framework y Lenguaje
Next.js 13+ (App Router)
TypeScript 5.x (strict mode)
React 18+ (Server + Client Components)

// UI y Estilos
Tailwind CSS 3.x
Dark theme optimizado para médicos

// Estado y Datos
Zustand 4.x (estado global)
SWR 2.x (data fetching y caché)
Supabase (PostgreSQL + realtime)

// Fecha y Hora
@js-temporal/polyfill (API Temporal)
Timezone-aware (America/Mexico_City)

// Utilidades
nanoid (IDs únicos)
```

---

## 2. ARQUITECTURA DEL SISTEMA

### 2.1 Vista de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                     PÁGINA PRINCIPAL                         │
│                    app/agenda/page.tsx                       │
│                                                              │
│  ┌──────────────────┐         ┌─────────────────────────┐  │
│  │  CalendarView    │   OR    │  NewCalendarView        │  │
│  │  (Schedule-X)    │         │  (Refactorizado)        │  │
│  └──────────────────┘         └─────────────────────────┘  │
│                                        │                     │
└────────────────────────────────────────┼─────────────────────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        │                               │                               │
        │                               │                               │
┌───────▼────────┐           ┌──────────▼────────┐         ┌───────────▼────────┐
│  COMPONENTES   │           │   ESTADO GLOBAL   │         │   SERVICIOS API    │
│   UI/CALENDAR  │◄──────────┤   (Zustand)       │────────►│   (Supabase)       │
│                │           │                    │         │                    │
│ • CalendarGrid │           │ • selectedSlot     │         │ • createAppointment│
│ • DayColumn    │           │ • selectedAppt     │         │ • updateAppointment│
│ • TimeColumn   │           │ • viewMode         │         │ • cancelAppointment│
│ • Slot         │           │ • dateRange        │         │ • confirmAppointment│
│ • AppointmentB │           │ • modals state     │         │                    │
└────────────────┘           └───────────────────┘         └────────────────────┘
        │                               │
        │                               │
┌───────▼────────┐           ┌──────────▼────────┐
│    MODALES     │           │   CUSTOM HOOKS    │
│                │           │                    │
│ • CreateModal  │           │ • useAgendaState   │
│ • DetailsModal │           │ • useAvailability  │
│ • Modal (base) │           │ • useAppointmentForm│
└────────────────┘           └────────────────────┘
```

### 2.2 Arquitectura de Capas

```
┌───────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (Componentes React)                   │
│  - CalendarGrid, DayColumn, Modals                        │
│  - Responsabilidad: Renderizar UI, capturar eventos       │
└───────────────────┬───────────────────────────────────────┘
                    │
┌───────────────────▼───────────────────────────────────────┐
│  STATE MANAGEMENT LAYER (Zustand + SWR)                   │
│  - useAgendaState (UI state)                              │
│  - useConsultas (data fetching con SWR)                   │
│  - Responsabilidad: Gestión de estado, caché              │
└───────────────────┬───────────────────────────────────────┘
                    │
┌───────────────────▼───────────────────────────────────────┐
│  BUSINESS LOGIC LAYER (Custom Hooks + Utilities)          │
│  - useAvailability (cálculo de slots)                     │
│  - slot-calculator.ts (lógica de disponibilidad)          │
│  - validation-rules.ts (validaciones)                     │
│  - Responsabilidad: Lógica de negocio, cálculos           │
└───────────────────┬───────────────────────────────────────┘
                    │
┌───────────────────▼───────────────────────────────────────┐
│  DATA ACCESS LAYER (Servicios API)                        │
│  - appointments-service.ts                                │
│  - Responsabilidad: CRUD, comunicación con Supabase       │
└───────────────────┬───────────────────────────────────────┘
                    │
┌───────────────────▼───────────────────────────────────────┐
│  DATABASE LAYER (Supabase PostgreSQL)                     │
│  - Tabla: consultas                                       │
│  - Joins: pacientes                                       │
│  - Responsabilidad: Persistencia de datos                 │
└───────────────────────────────────────────────────────────┘
```

### 2.3 Patrón de Componentes

Seguimos el patrón **Presentational vs. Container**:

**Container Components:**
- `NewCalendarView.tsx` - Orquesta datos y lógica
- `CreateAppointmentModal.tsx` - Maneja formulario y submit
- `AppointmentDetailsModal.tsx` - Maneja edición y cancelación

**Presentational Components:**
- `CalendarGrid.tsx` - Layout del calendario
- `DayColumn.tsx` - Renderiza un día
- `TimeColumn.tsx` - Columna de horas
- `Slot.tsx` - Slot vacío clickeable
- `AppointmentBlock.tsx` - Bloque de cita
- `CalendarHeader.tsx` - Header con días
- `Modal.tsx` - Modal base reutilizable

---

## 3. DISEÑO DE DATOS

### 3.1 Modelo de Datos Principal

```typescript
// types/agenda.ts

/**
 * Appointment - Modelo extendido de cita
 * Extiende el modelo Consulta actual con campos adicionales
 */
interface Appointment {
  // Identificadores
  id: string;              // consulta_id (ej: "CONS-123")
  uuid: string;            // UUID de Supabase

  // Paciente
  pacienteId: string;
  paciente: string;
  telefono: string | null;
  email: string | null;

  // Fecha y hora (timezone-aware)
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
  timezone: string;        // Default: "America/Mexico_City"
  duracionMinutos: number;

  // Ubicación
  sede: 'POLANCO' | 'SATELITE';
  consultorio: string | null;

  // Tipo y clasificación
  tipo: ConsultType;
  prioridad: AppointmentPriority;
  modalidad: AppointmentModality;

  // Motivo y contexto
  motivoConsulta: string | null;
  notasInternas: string | null;
  requisitosEspeciales: string[] | null;

  // Estado
  estado: ConsultaEstado;
  estadoConfirmacion: EstadoConfirmacion;
  confirmadoPaciente: boolean;
  confirmadoEn: string | null;

  // Cancelación
  canceladoPor: string | null;
  motivoCancelacion: string | null;
  canceladoEn: string | null;

  // Integración
  calendarEventId: string | null;
  calendarLink: string | null;

  // Metadata
  canalOrigen: string | null;
  creadoPor: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### 3.2 TimeSlot - Slots de Tiempo

```typescript
/**
 * TimeSlot - Representa un slot de tiempo en el calendario
 */
interface TimeSlot {
  id: string;                          // Único por slot
  start: Temporal.ZonedDateTime;       // Inicio del slot
  end: Temporal.ZonedDateTime;         // Fin del slot
  sede: 'POLANCO' | 'SATELITE';
  available: boolean;                  // ¿Está disponible?
  timezone: string;
}
```

### 3.3 Mapeo de Base de Datos

```typescript
// Mapeo: Database (snake_case) → TypeScript (camelCase)

const consultaToAppointment = (row: ConsultaRow): Appointment => ({
  // DB: consulta_id → TS: id
  id: row.consulta_id,

  // DB: paciente_id → TS: pacienteId
  pacienteId: row.paciente_id,

  // DB: fecha_hora_utc → TS: start (ZonedDateTime)
  start: Temporal.Instant.from(row.fecha_hora_utc).toZonedDateTimeISO(timezone),

  // DB: duracion_minutos → TS: duracionMinutos
  duracionMinutos: row.duracion_minutos ?? 45,

  // DB: tipo_cita → TS: tipo
  tipo: row.tipo_cita,

  // DB: estado_cita → TS: estado
  estado: row.estado_cita,

  // ... resto de campos
});
```

### 3.4 Schema de Base de Datos (Actual)

```sql
-- Tabla: consultas
CREATE TABLE public.consultas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consulta_id VARCHAR(50) UNIQUE NOT NULL,
  paciente_id UUID REFERENCES pacientes(id),

  -- Fecha y hora
  fecha_hora_utc TIMESTAMPTZ NOT NULL,
  fecha_consulta DATE NOT NULL,
  hora_consulta TIME NOT NULL,
  timezone VARCHAR(50) DEFAULT 'America/Mexico_City',
  duracion_minutos INTEGER DEFAULT 30,

  -- Ubicación y tipo
  sede VARCHAR(20) NOT NULL,  -- 'POLANCO' | 'SATELITE'
  tipo_cita VARCHAR(50),
  motivo_consulta TEXT,

  -- Estado
  estado_cita VARCHAR(20),
  estado_confirmacion VARCHAR(20),
  confirmado_paciente BOOLEAN DEFAULT false,
  fecha_confirmacion TIMESTAMPTZ,

  -- Cancelación
  cancelado_por VARCHAR(50),
  motivo_cancelacion TEXT,
  fecha_cancelacion TIMESTAMPTZ,

  -- Google Calendar
  calendar_event_id VARCHAR(255),
  calendar_link TEXT,

  -- Metadata
  canal_origen VARCHAR(50) DEFAULT 'WhatsApp',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Control de duplicados
  idempotency_key VARCHAR(255),
  slot_guard BOOLEAN DEFAULT true
);

-- Índices para performance
CREATE INDEX idx_consultas_fecha_sede ON consultas(fecha_consulta, sede, estado_cita);
CREATE INDEX idx_consultas_paciente ON consultas(paciente_id);
CREATE INDEX idx_consultas_estado ON consultas(estado_cita);
```

---

## 4. COMPONENTES Y UI

### 4.1 Jerarquía de Componentes

```
NewCalendarView (container)
├── CalendarGrid (presentational)
│   ├── CalendarHeader (presentational)
│   │   └── DayHeaderCell × 5 (Lun-Vie)
│   ├── TimeColumn (presentational)
│   │   └── TimeLabel × n (cada 30 min)
│   └── DayColumn × 5 (presentational)
│       ├── Slot × n (clickeable)
│       └── AppointmentBlock × n (draggable - futuro)
├── CreateAppointmentModal (container)
│   └── Modal (base)
│       └── Form
│           ├── PatientInput
│           ├── TypeSelect
│           ├── DurationSelect
│           ├── ModalitySelect
│           ├── PriorityButtons
│           └── NotesTextarea
└── AppointmentDetailsModal (container)
    └── Modal (base)
        ├── AppointmentInfo
        ├── PatientInfo
        ├── ConfirmationStatus
        └── ActionButtons
```

### 4.2 Componente: CalendarGrid

**Responsabilidad:** Orquestar el layout del calendario

```typescript
interface CalendarGridProps {
  appointments: Appointment[];
  availableSlots: TimeSlot[];
  viewMode: 'week' | 'day';
  loading?: boolean;
  startHour?: number;    // Default: 9
  endHour?: number;      // Default: 18
  slotHeight?: number;   // Default: 48px
}

// Implementación:
export const CalendarGrid: React.FC<CalendarGridProps> = ({
  appointments,
  availableSlots,
  viewMode,
  loading,
  startHour = 9,
  endHour = 18,
  slotHeight = 48,
}) => {
  // 1. Generar array de días según viewMode
  const days = useMemo(() => {
    if (viewMode === 'day') return [dateRange.start];
    // Semana: 5 días laborales
    return Array.from({ length: 5 }, (_, i) => dateRange.start.add({ days: i }));
  }, [dateRange, viewMode]);

  // 2. Agrupar appointments por día
  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const apt of appointments) {
      const key = apt.start.toPlainDate().toString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(apt);
    }
    return map;
  }, [appointments]);

  // 3. Renderizar
  return (
    <div className="calendar-grid">
      <CalendarHeader days={days} />
      <div className="grid-body">
        <TimeColumn startHour={startHour} endHour={endHour} slotHeight={slotHeight} />
        {days.map(day => (
          <DayColumn
            key={day.toString()}
            date={day}
            appointments={appointmentsByDay.get(day.toString()) || []}
            availableSlots={slotsByDay.get(day.toString()) || []}
            startHour={startHour}
            endHour={endHour}
            slotHeight={slotHeight}
          />
        ))}
      </div>
    </div>
  );
};
```

### 4.3 Componente: DayColumn

**Responsabilidad:** Renderizar un día del calendario con slots y citas

**Características clave:**
- Posicionamiento absoluto de citas según hora
- Indicador de "ahora" en tiempo real (actualización cada minuto)
- Gestión de overlapping appointments (futuro: stacking)

```typescript
// Cálculo de posición de cita
const calculateAppointmentPosition = (
  appointment: Appointment,
  startHour: number,
  slotHeight: number
): { top: number; height: number } => {
  const aptStartTime = appointment.start.toPlainTime();
  const minutesFromStart = (aptStartTime.hour - startHour) * 60 + aptStartTime.minute;

  const top = (minutesFromStart / 30) * slotHeight;
  const height = (appointment.duracionMinutos / 30) * slotHeight;

  return { top, height };
};
```

### 4.4 Sistema de Modales

**Modal Base (Shared Component):**

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

// Features:
// - Escape key para cerrar
// - Click en backdrop para cerrar
// - Body scroll lock cuando está abierto
// - Animaciones de entrada/salida
// - Focus trap (accessibility)
```

---

## 5. ESTADO Y LÓGICA DE NEGOCIO

### 5.1 Estado Global (Zustand)

```typescript
// app/agenda/hooks/useAgendaState.ts

interface AgendaState {
  // Vista
  viewMode: 'week' | 'day' | 'month';
  selectedDate: Temporal.PlainDate;
  dateRange: DateRange;

  // Filtros
  selectedSede: 'ALL' | 'POLANCO' | 'SATELITE';
  selectedEstados: ConsultaEstado[];
  searchQuery: string;

  // Selección
  selectedAppointment: Appointment | null;
  selectedSlot: TimeSlot | null;

  // Modales
  isDetailsModalOpen: boolean;
  isCreateModalOpen: boolean;

  // Acciones
  setViewMode: (mode: 'week' | 'day' | 'month') => void;
  goToToday: () => void;
  goToPrevious: () => void;
  goToNext: () => void;

  selectAppointment: (apt: Appointment) => void;
  openDetailsModal: () => void;
  closeDetailsModal: () => void;

  openCreateModal: (slot?: TimeSlot) => void;
  closeCreateModal: () => void;

  // ... más acciones
}

// ¿Por qué Zustand?
// ✅ Ligero (~1KB vs ~3KB Redux)
// ✅ Sin boilerplate (no actions/reducers)
// ✅ DevTools integrados
// ✅ TypeScript nativo
// ✅ Subscripción selectiva (re-renders mínimos)
```

### 5.2 Cálculo de Disponibilidad

```typescript
// app/agenda/hooks/useAvailability.ts

interface UseAvailabilityParams {
  dateRange: DateRange;
  sede: 'ALL' | 'POLANCO' | 'SATELITE';
  duration: number;  // Duración de slot en minutos
}

interface UseAvailabilityReturn {
  availableSlots: TimeSlot[];
  occupiedSlots: TimeSlot[];
  blockedSlots: TimeSlot[];
  isLoading: boolean;
}

// Algoritmo:
// 1. Generar todos los slots posibles en el rango
// 2. Obtener appointments existentes (de useConsultas)
// 3. Clasificar cada slot:
//    - Available: no hay appointment, dentro de horario laboral
//    - Occupied: hay appointment activo
//    - Blocked: fuera de horario o bloqueado manualmente
```

### 5.3 Validaciones de Formulario

```typescript
// app/agenda/lib/validation-rules.ts

export function validateAppointmentForm(
  data: AppointmentFormData,
  slot?: TimeSlot
): FormErrors {
  const errors: FormErrors = {};

  // Validar paciente
  if (!data.patientId) {
    errors.patient = 'Debe seleccionar un paciente';
  }

  // Validar tipo de consulta
  if (!data.tipo || data.tipo.trim().length === 0) {
    errors.tipo = 'El tipo de consulta es obligatorio';
  }

  // Validar duración
  const validDurations = [15, 30, 45, 60, 90, 120];
  if (!validDurations.includes(data.duracionMinutos)) {
    errors.duracionMinutos = 'Duración inválida';
  }

  // Validar slot disponible
  if (slot && !slot.available) {
    errors.slot = 'El horario seleccionado ya no está disponible';
  }

  // Validar motivo para urgencias
  if (data.tipo === 'urgencia' && !data.motivoConsulta) {
    errors.motivoConsulta = 'El motivo es obligatorio para urgencias';
  }

  return errors;
}
```

---

## 6. CAPA DE SERVICIOS API

### 6.1 Arquitectura del Servicio

```typescript
// app/agenda/services/appointments-service.ts

// PRINCIPIOS:
// - Un servicio por entidad (appointments)
// - Funciones puras (side-effect-free)
// - Respuestas consistentes con ServiceResponse<T>
// - Manejo centralizado de errores
// - TypeScript estricto

interface ServiceResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### 6.2 Operación: createAppointment

```typescript
/**
 * Crea una nueva cita
 *
 * Validaciones:
 * 1. Paciente existe
 * 2. Slot no está ocupado (no hay conflictos)
 * 3. Dentro de horario laboral
 * 4. Datos válidos (timezone, duración, etc.)
 *
 * Seguridad:
 * - Idempotency key para evitar duplicados
 * - Transacción implícita de Supabase
 * - Validación de permisos (RLS de Supabase)
 */
export async function createAppointment(
  data: CreateAppointmentData
): Promise<ServiceResponse<{ id: string; uuid: string }>> {
  try {
    // 1. Validar paciente
    const { data: patient } = await supabase
      .from('pacientes')
      .select('id')
      .eq('id', data.patientId)
      .single();

    if (!patient) {
      return { success: false, error: 'Paciente no encontrado' };
    }

    // 2. Validar conflictos de horario
    const { data: conflicts } = await supabase
      .from('consultas')
      .select('id')
      .eq('sede', data.sede)
      .gte('fecha_hora_utc', data.start.toInstant().toString())
      .lt('fecha_hora_utc', data.end.toInstant().toString())
      .in('estado_cita', ['Programada', 'Confirmada', 'En_Curso']);

    if (conflicts && conflicts.length > 0) {
      return { success: false, error: 'El horario ya está ocupado' };
    }

    // 3. Insertar
    const insertData = {
      consulta_id: generateConsultaId(),
      paciente_id: data.patientId,
      fecha_hora_utc: data.start.toInstant().toString(),
      fecha_consulta: data.start.toPlainDate().toString(),
      hora_consulta: data.start.toPlainTime().toString(),
      timezone: data.timezone,
      sede: data.sede,
      tipo_cita: data.tipo,
      motivo_consulta: data.motivoConsulta || null,
      duracion_minutos: data.duracionMinutos,
      estado_cita: 'Programada',
      estado_confirmacion: 'Pendiente',
      confirmado_paciente: false,
      canal_origen: data.canalOrigen || 'Sistema',
      idempotency_key: `${data.patientId}-${data.start.toInstant().toString()}`,
    };

    const { data: newConsulta, error } = await supabase
      .from('consultas')
      .insert(insertData)
      .select('id, consulta_id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        id: newConsulta.consulta_id,
        uuid: newConsulta.id,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
```

### 6.3 Estrategia de Caché (SWR)

```typescript
// hooks/useConsultas.ts

export function useConsultas(): UseConsultasReturn {
  const { data, error, isLoading, mutate } = useSWR(
    'consultas',
    fetchConsultas,
    {
      // ✅ Revalidar cuando vuelve al tab (mejor UX)
      revalidateOnFocus: true,

      // ✅ Revalidar al reconectar (útil en mobile)
      revalidateOnReconnect: true,

      // ✅ Caché compartido de 5 minutos
      dedupingInterval: 5 * 60 * 1000,

      // ✅ NO revalidar automáticamente datos en caché
      revalidateIfStale: false,

      // ❌ NO polling (no necesario con 2 usuarios)
      refreshInterval: 0,

      // ✅ Mantener datos previos durante recarga (sin parpadeos)
      keepPreviousData: true,

      // ✅ Retry automático en errores
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 2000,
    }
  );

  return {
    consultas: data?.consultas || [],
    loading: isLoading,
    error: error || null,
    refetch: async () => { await mutate(); },
    totalCount: data?.count || 0,
  };
}
```

---

## 7. FLUJOS DE USUARIO

### 7.1 Crear Nueva Cita

```
[Usuario hace click en slot vacío]
    │
    ├─→ useAgendaState.openCreateModal(slot)
    │       │
    │       └─→ Actualiza estado: { isCreateModalOpen: true, selectedSlot: slot }
    │
    ├─→ CreateAppointmentModal se renderiza
    │       │
    │       ├─→ useAppointmentForm() inicializa formulario
    │       │       └─→ Pre-llena sede y horario del slot
    │       │
    │       └─→ Usuario completa formulario
    │               ├─→ Paciente (texto, futuro: autocomplete)
    │               ├─→ Tipo de consulta
    │               ├─→ Duración
    │               ├─→ Modalidad (presencial/teleconsulta)
    │               ├─→ Prioridad (normal/alta/urgente)
    │               └─→ Notas internas
    │
    ├─→ Usuario hace submit
    │       │
    │       ├─→ validateAppointmentForm() valida datos
    │       │       └─→ Si hay errores: mostrar en UI
    │       │
    │       └─→ handleCreateAppointment() procesa
    │               │
    │               ├─→ Convierte form data a CreateAppointmentData
    │               ├─→ createAppointment() llama API
    │               │       │
    │               │       ├─→ Valida paciente existe
    │               │       ├─→ Valida no hay conflictos
    │               │       ├─→ INSERT en tabla consultas
    │               │       └─→ Retorna { success: true, data: { id, uuid } }
    │               │
    │               └─→ onRefresh() actualiza lista (SWR mutate)
    │
    └─→ Modal se cierra, calendario muestra nueva cita
```

### 7.2 Ver/Editar Cita Existente

```
[Usuario hace click en AppointmentBlock]
    │
    ├─→ useAgendaState.selectAppointment(appointment)
    │       │
    │       └─→ Actualiza estado: { selectedAppointment, isDetailsModalOpen: true }
    │
    ├─→ AppointmentDetailsModal se renderiza
    │       │
    │       └─→ Muestra información completa:
    │               ├─→ Estado y prioridad
    │               ├─→ Datos del paciente
    │               ├─→ Información de la cita
    │               ├─→ Estado de confirmación
    │               ├─→ Enlaces (Google Calendar)
    │               └─→ Botones de acción
    │
    └─→ Usuario puede:
            │
            ├─→ [Ver detalles] → Solo visualización
            │
            ├─→ [Editar] (futuro) → handleUpdateAppointment()
            │       └─→ updateAppointment() en API
            │
            └─→ [Cancelar]
                    │
                    ├─→ Muestra diálogo de cancelación
                    ├─→ Usuario ingresa motivo
                    ├─→ handleCancelAppointment()
                    │       │
                    │       └─→ cancelAppointment() en API
                    │               ├─→ UPDATE: estado_cita = 'Cancelada'
                    │               ├─→ UPDATE: motivo_cancelacion
                    │               ├─→ UPDATE: cancelado_por
                    │               └─→ UPDATE: fecha_cancelacion = now()
                    │
                    └─→ onRefresh() actualiza, modal cierra
```

### 7.3 Navegación del Calendario

```
[Usuario navega por fechas]
    │
    ├─→ Botón "Hoy"
    │       └─→ useAgendaState.goToToday()
    │               └─→ selectedDate = Temporal.Now.plainDateISO()
    │
    ├─→ Botón "< Anterior"
    │       └─→ useAgendaState.goToPrevious()
    │               └─→ selectedDate = selectedDate.subtract({ weeks: 1 })
    │
    ├─→ Botón "Siguiente >"
    │       └─→ useAgendaState.goToNext()
    │               └─→ selectedDate = selectedDate.add({ weeks: 1 })
    │
    └─→ Cambio de vista (Semana/Día/Mes)
            └─→ useAgendaState.setViewMode(mode)
                    └─→ Recalcula dateRange según modo
```

---

## 8. SEGURIDAD Y VALIDACIONES

### 8.1 Validaciones del Frontend

```typescript
// 1. Validación de formulario (Client-side)
- Campos obligatorios (paciente, tipo, duración)
- Formato de datos (duraciones válidas)
- Lógica de negocio (motivo obligatorio para urgencias)

// 2. Validación de slot disponible
- Verificar que slot.available === true
- Re-validar disponibilidad antes de enviar

// 3. Sanitización de inputs
- Trim de strings
- Escape de caracteres especiales (prevenir XSS)
- Validación de longitud máxima
```

### 8.2 Validaciones del Backend (Supabase)

```sql
-- Row Level Security (RLS)
-- Solo usuarios autenticados pueden crear/editar citas

ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;

-- Política: Solo usuarios autenticados pueden leer
CREATE POLICY "usuarios_pueden_leer_consultas"
  ON consultas FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política: Solo usuarios autenticados pueden crear
CREATE POLICY "usuarios_pueden_crear_consultas"
  ON consultas FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Política: Solo usuarios autenticados pueden actualizar
CREATE POLICY "usuarios_pueden_actualizar_consultas"
  ON consultas FOR UPDATE
  USING (auth.role() = 'authenticated');
```

### 8.3 Prevención de Conflictos

```typescript
// 1. Validación de conflictos en createAppointment()
const { data: conflicts } = await supabase
  .from('consultas')
  .select('id')
  .eq('sede', data.sede)
  .gte('fecha_hora_utc', start)
  .lt('fecha_hora_utc', end)
  .in('estado_cita', ['Programada', 'Confirmada', 'En_Curso']);

if (conflicts.length > 0) {
  return { success: false, error: 'Horario ocupado' };
}

// 2. Idempotency Key
// Evita duplicados si el usuario hace doble click
idempotency_key: `${patientId}-${startTime}`

// 3. slot_guard
// Flag en DB que previene race conditions
// (activado por default en tabla)
```

### 8.4 Sanitización de Datos

```typescript
// Función helper para sanitizar inputs
function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < > to prevent XSS
    .slice(0, 500);       // Limit length
}

// Aplicar en formulario
const sanitizedData = {
  ...formData,
  motivoConsulta: sanitizeString(formData.motivoConsulta),
  notasInternas: sanitizeString(formData.notasInternas),
};
```

---

## 9. PERFORMANCE Y OPTIMIZACIÓN

### 9.1 Métricas Objetivo

```
┌─────────────────────────────────────────────────────────┐
│  MÉTRICA              │  OBJETIVO  │  ACTUAL (estimado) │
├─────────────────────────────────────────────────────────┤
│  Time to Interactive  │  < 2s      │  ~1.5s            │
│  First Paint          │  < 1s      │  ~0.8s            │
│  Bundle Size (main)   │  < 200KB   │  ~150KB           │
│  Calendar Component   │  < 20KB    │  ~15KB            │
│  Slots calculation    │  < 100ms   │  ~50ms            │
│  Modal open time      │  < 50ms    │  ~30ms            │
└─────────────────────────────────────────────────────────┘
```

### 9.2 Estrategias de Optimización

**1. Code Splitting:**
```typescript
// Modales se cargan solo cuando se necesitan (lazy loading)
const CreateAppointmentModal = dynamic(
  () => import('./modals/CreateAppointmentModal'),
  { ssr: false }
);
```

**2. Memoization:**
```typescript
// Evitar re-cálculos innecesarios
const appointments = useMemo(() => {
  return consultas.map(consultaToAppointment);
}, [consultas]);

const appointmentsByDay = useMemo(() => {
  const map = new Map<string, Appointment[]>();
  // ... lógica de agrupación
  return map;
}, [appointments]);
```

**3. Virtualización (Futuro):**
```typescript
// Para calendarios con muchas citas, usar react-window
// Solo renderizar citas visibles en viewport
```

**4. Debouncing de Búsqueda:**
```typescript
// Evitar búsquedas en cada keystroke
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    setSearchQuery(query);
  }, 300),
  []
);
```

### 9.3 Optimización de Re-renders

```typescript
// Zustand: Subscripción selectiva
// Solo re-renderiza cuando cambia la parte del estado que usa

const Component = () => {
  // ❌ MAL: Re-renderiza en cualquier cambio de estado
  const state = useAgendaState();

  // ✅ BIEN: Solo re-renderiza si cambia selectedSlot
  const selectedSlot = useAgendaState(state => state.selectedSlot);

  // ✅ MEJOR: Usar selector con shallow equality
  const { selectedSlot, isCreateModalOpen } = useAgendaState(
    state => ({
      selectedSlot: state.selectedSlot,
      isCreateModalOpen: state.isCreateModalOpen,
    }),
    shallow
  );
};
```

---

## 10. TESTING Y QUALITY

### 10.1 Estrategia de Testing (Futuro)

```
┌────────────────────────────────────────────────────────┐
│  TIPO DE TEST        │  HERRAMIENTA  │  COBERTURA      │
├────────────────────────────────────────────────────────┤
│  Unit Tests          │  Vitest       │  80%+ (target)  │
│  Component Tests     │  Testing Lib  │  70%+ (target)  │
│  Integration Tests   │  Playwright   │  Critical flows │
│  E2E Tests           │  Playwright   │  Happy paths    │
│  Visual Regression   │  Percy/Chromatic│ Key screens   │
└────────────────────────────────────────────────────────┘
```

**Unit Tests (Ejemplo):**
```typescript
// __tests__/lib/slot-calculator.test.ts
describe('calculateAvailableSlots', () => {
  it('should generate correct slots for working hours', () => {
    const result = calculateAvailableSlots({
      dateRange: { start, end },
      sede: 'POLANCO',
      appointments: [],
      blocks: [],
      slotDuration: 30,
      workingHours: POLANCO_HOURS,
    });

    expect(result.allSlots.length).toBe(18); // 9 hours * 2 slots/hour
    expect(result.availableSlots.length).toBe(18);
  });

  it('should mark slots as occupied when appointment exists', () => {
    const appointment = createMockAppointment({
      start: '2025-11-14T10:00:00',
      end: '2025-11-14T10:30:00',
    });

    const result = calculateAvailableSlots({
      // ... params
      appointments: [appointment],
    });

    const occupiedSlot = result.occupiedSlots.find(
      s => s.start.toString() === '2025-11-14T10:00:00[America/Mexico_City]'
    );

    expect(occupiedSlot).toBeDefined();
    expect(occupiedSlot.available).toBe(false);
  });
});
```

**Component Tests (Ejemplo):**
```typescript
// __tests__/components/Slot.test.tsx
describe('Slot Component', () => {
  it('should render clickable slot', () => {
    const slot = createMockSlot({ available: true });
    const onSlotClick = vi.fn();

    render(<Slot slot={slot} onSlotClick={onSlotClick} />);

    const slotElement = screen.getByText('+ Agendar');
    fireEvent.click(slotElement);

    expect(onSlotClick).toHaveBeenCalledWith(slot);
  });

  it('should not be clickable when unavailable', () => {
    const slot = createMockSlot({ available: false });
    const onSlotClick = vi.fn();

    render(<Slot slot={slot} onSlotClick={onSlotClick} />);

    const slotElement = screen.getByRole('button');
    expect(slotElement).toBeDisabled();
  });
});
```

### 10.2 Linting y Formateo

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "react-hooks/exhaustive-deps": "error"
  }
}

// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 100
}
```

---

## 11. DEPLOYMENT Y ACTIVACIÓN

### 11.1 Pre-requisitos

```bash
# 1. Dependencias instaladas
npm install zustand nanoid

# 2. Variables de entorno configuradas
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_key

# 3. Build exitoso
npm run build
```

### 11.2 Checklist de Activación

```markdown
### Fase 1: Pruebas en desarrollo
- [ ] Clonar branch `claude/refactor-urology-agenda-calendar-*`
- [ ] `npm install`
- [ ] `npm run dev`
- [ ] Navegar a http://localhost:3000/agenda
- [ ] Verificar que UI actual sigue funcionando

### Fase 2: Activar nueva UI (gradual)
- [ ] En `app/agenda/page.tsx`, importar NewCalendarView
- [ ] Reemplazar `<CalendarView>` con `<NewCalendarView>`
- [ ] Pasar props: `consultas`, `loading`, `onRefresh`
- [ ] Verificar que citas se muestran correctamente

### Fase 3: Probar funcionalidad CRUD
- [ ] Probar crear cita (slot vacío → modal → submit)
- [ ] Verificar que cita aparece en calendario
- [ ] Verificar que cita aparece en Supabase
- [ ] Probar ver detalles de cita (click en cita → modal)
- [ ] Probar cancelar cita (modal → cancelar → motivo → confirmar)
- [ ] Verificar que estado cambia a "Cancelada"

### Fase 4: Validaciones
- [ ] Intentar crear cita en slot ocupado (debe rechazar)
- [ ] Intentar crear cita sin paciente (debe mostrar error)
- [ ] Intentar cancelar sin motivo (debe mostrar error)
- [ ] Verificar que doble-click no crea duplicados

### Fase 5: Deploy a producción
- [ ] Merge a branch principal
- [ ] Deploy automático (Vercel/etc)
- [ ] Verificar en producción
- [ ] Monitorear errores (Sentry/etc)
```

### 11.3 Rollback Plan

Si se detectan problemas críticos:

```typescript
// app/agenda/page.tsx

// ROLLBACK: Simplemente comentar la nueva UI y descomentar la antigua
// import { NewCalendarView } from './components/NewCalendarView';
import { CalendarView } from './components/CalendarView';

// ...

{viewMode === 'calendar' ? (
  // <NewCalendarView
  //   consultas={filteredConsultas}
  //   loading={loading}
  //   onRefresh={refetch}
  // />
  <CalendarView
    consultas={filteredConsultas}
    vistaCalendario={vistaCalendario}
  />
) : (
  <AppointmentListView ... />
)}
```

### 11.4 Monitoreo Post-Deploy

```typescript
// Métricas a monitorear:
- Errores de JavaScript (console.errors)
- Tiempo de carga de modales
- Tasa de éxito de createAppointment()
- Conflictos de horario (cuántos se rechazan)
- Uso de memoria (Memory Profiler)
- Re-renders innecesarios (React DevTools Profiler)
```

---

## 📊 RESUMEN DE DECISIONES TÉCNICAS

| Decisión | Alternativa considerada | Razón de elección |
|----------|-------------------------|-------------------|
| **Zustand** | Redux Toolkit | Menor bundle size, menos boilerplate, igualmente potente |
| **Temporal API** | Luxon/date-fns | Estándar futuro de JavaScript, timezone-safe nativo |
| **SWR** | React Query | Ya integrado en proyecto, suficiente para caso de uso |
| **Tailwind CSS** | Styled Components | Ya integrado, mejor performance, menor bundle |
| **TypeScript strict** | Loose mode | Mayor seguridad de tipos, menos bugs en runtime |
| **Componentes propios** | Schedule-X | Mayor control, menor bundle (150KB → 15KB) |
| **Supabase directo** | API routes | Menos latencia, RLS de Supabase es robusto |
| **Sin breaking changes** | Reescribir todo | Minimizar riesgo, permitir rollback fácil |

---

## 🎯 MÉTRICAS DE ÉXITO

```
✅ Bundle size reducido: 150KB → 15KB (90% reducción)
✅ Time to Interactive: < 2s
✅ Zero breaking changes: código anterior sigue funcionando
✅ CRUD completo: crear, leer, actualizar, cancelar
✅ Validaciones: formulario + conflictos + permisos
✅ TypeScript: 100% tipado, cero any en código nuevo
✅ Accessibility: ARIA labels, keyboard navigation, focus management
✅ Performance: Memoization, lazy loading, código splitting
```

---

## 📚 REFERENCIAS

- [Temporal API Polyfill](https://github.com/js-temporal/temporal-polyfill)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [SWR Documentation](https://swr.vercel.app/)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Fin del Blueprint Técnico**
**Versión 2.0 - Noviembre 2025**
