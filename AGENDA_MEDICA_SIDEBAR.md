# 📅 Agenda Médica Embebida en Sidebar - Urobot CRM

## 📋 Descripción General

La **Agenda Médica Embebida** es un panel lateral siempre visible y accesible desde cualquier parte del sistema Urobot. Permite gestionar citas médicas de forma rápida y eficiente sin abandonar el flujo de trabajo actual.

## ✨ Características Principales

### 1. **Visualización Múltiple**
- 📆 **Vista por Día**: Muestra citas del día seleccionado
- 📅 **Vista por Semana**: Muestra citas de la semana actual
- 🗓️ **Vista por Mes**: Muestra citas del mes completo

### 2. **Gestión de Citas**
- ➕ **Agregar Citas**: Formulario rápido con validación de campos
- ✏️ **Editar Citas**: Modificar detalles de citas existentes
- 🗑️ **Eliminar Citas**: Eliminar citas con confirmación
- ✅ **Confirmar Citas**: Confirmar asistencia del paciente
- ❌ **Cancelar Citas**: Cancelar con motivo

### 3. **Validación de Conflictos**
- ⚠️ **Detección Automática**: Identifica conflictos de horario en tiempo real
- 🚨 **Alertas Visuales**: Notificaciones cuando hay citas solapadas
- ✅ **Confirmación Manual**: Permite override con confirmación del usuario

### 4. **Indicadores Visuales por Estado**
- 🔵 **Programada**: Azul - Cita programada, pendiente de confirmación
- 🟢 **Confirmada**: Verde - Paciente confirmó asistencia
- 🟡 **Reagendada**: Amarillo - Cita reprogramada
- 🔴 **Cancelada**: Rojo - Cita cancelada
- 🟣 **Completada**: Púrpura - Cita realizada
- 🔵 **En Curso**: Cyan - Cita en progreso
- ⚫ **No Acudió**: Gris - Paciente no asistió

### 5. **Filtros y Búsqueda**
- 🔍 **Búsqueda por Paciente**: Busca por nombre o motivo de consulta
- 🏥 **Filtro por Sede**: POLANCO, SATÉLITE o todas
- 📊 **Filtros Rápidos**: Todas, Hoy, Pendientes, Confirmadas

### 6. **Estadísticas en Tiempo Real**
- 📈 **Citas de Hoy**: Contador de citas del día actual
- ⏳ **Pendientes**: Citas sin confirmar
- ✅ **Confirmadas**: Citas confirmadas por pacientes

### 7. **Sincronización con el Sistema**
- 🔄 **Auto-actualización**: Sincronización automática con SWR
- 📁 **Fichas Clínicas**: Integración con historial médico
- 📊 **Pacientes**: Actualización de estadísticas de pacientes
- 📧 **Notificaciones**: Base para recordatorios automáticos

## 🏗️ Arquitectura

### Componentes Principales

```
app/components/medical-agenda-sidebar/
├── MedicalAgendaSidebar.tsx         # Componente principal del panel
├── AgendaAppointmentCard.tsx        # Tarjeta de cita individual
├── QuickAddAppointmentModal.tsx     # Modal para agregar citas
├── QuickAppointmentDetails.tsx      # Modal de detalles de cita
└── index.ts                         # Exports
```

### Hooks y Estado

```
hooks/
└── useMedicalAgendaSidebar.ts       # Hook Zustand para estado global
```

### Servicios

```
app/lib/services/
├── notifications-service.ts         # Servicio de notificaciones y recordatorios
└── medical-sync-service.ts          # Sincronización con fichas clínicas
```

## 🚀 Uso

### Expandir/Contraer la Agenda

La agenda se puede expandir o contraer usando el botón flotante en el borde derecho de la sidebar principal:

- **Colapsada**: Muestra solo un indicador vertical con el texto "AGENDA"
- **Expandida**: Muestra el panel completo con todas las funcionalidades

### Agregar una Cita

1. Click en el botón **"+"** en el header de la agenda
2. Completar el formulario:
   - Seleccionar paciente
   - Fecha y hora
   - Tipo de consulta (primera vez, subsecuente, etc.)
   - Duración (se ajusta automáticamente según el tipo)
   - Sede (POLANCO o SATÉLITE)
   - Motivo de consulta (opcional)
3. El sistema valida conflictos de horario automáticamente
4. Click en **"Crear Cita"**

### Ver Detalles de una Cita

1. Click en cualquier tarjeta de cita
2. Se abre un modal con:
   - Información del paciente
   - Fecha, hora y duración
   - Sede y tipo de consulta
   - Motivo de consulta
   - Estado de confirmación
   - Acciones disponibles (confirmar, editar, cancelar, eliminar)

### Cambiar Vista

Use los toggles en la parte superior para cambiar entre:
- **Día**: Muestra citas del día seleccionado
- **Semana**: Muestra citas de lunes a domingo
- **Mes**: Muestra todas las citas del mes

### Navegar entre Fechas

- **Botones ←/→**: Navega al día/semana/mes anterior o siguiente
- **Click en fecha**: Regresa a hoy

### Filtrar Citas

**Filtros Rápidos:**
- **Todas**: Muestra todas las citas
- **Hoy**: Solo citas del día actual
- **Pendientes**: Citas sin confirmar
- **Confirmadas**: Citas confirmadas

**Filtros Avanzados:**
- Click en el icono de filtro (🔽)
- Selecciona sede: Todas, POLANCO o SATÉLITE

## 🔧 Configuración Técnica

### Estado Global (Zustand)

```typescript
interface MedicalAgendaSidebarState {
  // Expansión
  isExpanded: boolean;
  toggleExpanded: () => void;

  // Vista
  currentView: 'day' | 'week' | 'month';
  setView: (view) => void;

  // Filtros
  currentFilter: 'all' | 'today' | 'pending' | 'confirmed';
  selectedSede: 'ALL' | 'POLANCO' | 'SATELITE';

  // Fecha
  selectedDate: Date;
  goToToday: () => void;
  goToNextDay/Week/Month: () => void;
  goToPreviousDay/Week/Month: () => void;

  // Modales
  isAddModalOpen: boolean;
  isDetailsModalOpen: boolean;
  selectedAppointment: Consulta | null;

  // Búsqueda
  searchQuery: string;
}
```

### Persistencia

El estado se persiste en `localStorage` con la clave `medical-agenda-sidebar`. Solo se guardan:
- `isExpanded`: Estado de expansión
- `currentView`: Vista seleccionada
- `selectedSede`: Sede filtrada
- `showNotifications`: Preferencia de notificaciones

### Datos en Tiempo Real

La agenda utiliza el hook `useConsultas()` que implementa SWR para:
- ✅ Caché compartido de 5 minutos
- ✅ Revalidación al volver a la pestaña
- ✅ Revalidación al reconectar
- ✅ Mantener datos previos durante recarga (sin parpadeos)
- ✅ Retry automático en caso de error

## 📱 Responsive Design

### Desktop (lg+)
- Sidebar principal: 240-320px
- Panel de agenda expandido: 320-384px
- Panel de agenda colapsado: 48px
- Total expandido: ~640-704px

### Mobile
- La agenda embebida no se muestra en móvil
- Los usuarios deben acceder a `/agenda` para la vista completa
- La navegación inferior (BottomNav) permanece funcional

## 🔔 Notificaciones y Recordatorios

### Servicio de Notificaciones

El servicio `notifications-service.ts` proporciona una base extensible para:

#### Funciones Disponibles
- `scheduleAppointmentReminders()`: Programa recordatorios automáticos
- `sendAppointmentConfirmation()`: Envía confirmación de cita
- `sendAppointmentReminder()`: Envía recordatorio antes de la cita
- `sendCancellationNotification()`: Notifica cancelación

#### Canales Soportados
- 📧 **Email**
- 📱 **SMS**
- 💬 **WhatsApp**
- 🔔 **Push Notifications**

#### Timing de Recordatorios
- **Inmediato**: Al crear/confirmar cita
- **1 hora antes**: Recordatorio urgente
- **24 horas antes**: Recordatorio estándar
- **48 horas antes**: Recordatorio anticipado

### Integración Futura

Para activar notificaciones reales, se debe:
1. Configurar credenciales de Twilio/WhatsApp Business API
2. Crear tabla `notification_logs` en Supabase
3. Configurar cron job para `processScheduledReminders()`
4. Actualizar los TODOs en el código marcados con `// TODO:`

## 🔄 Sincronización Médica

### Servicio de Sincronización

El servicio `medical-sync-service.ts` maneja:

#### Sincronización con Fichas Clínicas
```typescript
syncAppointmentWithMedicalRecord(appointment)
```
- Crea ficha clínica si no existe
- Actualiza historial de consultas del paciente
- Registra entrada en historial médico (cuando se completa)

#### Historial del Paciente
```typescript
getPatientMedicalHistory(pacienteId)
```
- Total de consultas realizadas
- Última consulta
- Próxima consulta programada
- Diagnósticos (TODO)
- Alergias (TODO)
- Medicamentos actuales (TODO)

#### Exportación de Datos
```typescript
exportAgendaToFormat('csv' | 'ical', startDate, endDate)
```
- **CSV**: Para análisis en Excel/Google Sheets
- **iCal**: Para sincronización con calendarios externos

#### Detección de Conflictos
```typescript
detectSyncConflicts(appointment)
```
- Verifica solapamiento de horarios
- Identifica citas duplicadas
- Previene doble reserva de slots

## 🎨 Diseño y Estilos

### Paleta de Colores

```css
/* Background */
from-[#0a1429]/95    /* Azul oscuro */
via-[#060b18]/92     /* Azul muy oscuro */
to-[#02040a]/96      /* Casi negro */

/* Estados */
--blue: #60A5FA      /* Programada */
--green: #4ADE80     /* Confirmada */
--yellow: #FBBF24    /* Reagendada */
--red: #F87171       /* Cancelada */
--purple: #C084FC    /* Completada */
--cyan: #22D3EE      /* En Curso */
--gray: #9CA3AF      /* No Acudió */
```

### Animaciones

- **Transición de expansión**: 300ms ease
- **Hover de botones**: 100ms ease
- **Scale activo**: 0.95
- **Fade in de modales**: 200ms ease

## 🛠️ Extensibilidad

### Agregar Nuevo Estado de Cita

1. Actualizar `STATUS_CONFIG` en `AgendaAppointmentCard.tsx`:
```typescript
const STATUS_CONFIG = {
  // ... estados existentes
  NuevoEstado: {
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    icon: AlertCircle,
    label: 'Nuevo Estado',
    dotColor: 'bg-orange-400',
  },
};
```

2. Actualizar tipos en `types/consultas.ts`

### Agregar Nuevo Filtro

1. Actualizar `FILTER_CONFIG` en `MedicalAgendaSidebar.tsx`
2. Agregar lógica de filtrado en `filteredAppointments`
3. Actualizar tipo `AgendaFilter` en el hook

### Agregar Nueva Vista

1. Actualizar `VIEW_CONFIG` en `MedicalAgendaSidebar.tsx`
2. Implementar lógica de filtrado por fecha
3. Actualizar tipo `AgendaView` en el hook

## 📊 Métricas y Monitoreo

### Métricas Disponibles

La agenda proporciona las siguientes métricas en tiempo real:

```typescript
stats = {
  total: number,      // Total de citas en sistema
  today: number,      // Citas del día actual
  pending: number,    // Citas sin confirmar
  confirmed: number   // Citas confirmadas
}
```

### Logging

Todos los servicios implementan logging de consola. Para producción:

1. Implementar tabla `activity_logs` en Supabase
2. Agregar logging a servicio de backend
3. Crear dashboard de métricas

## 🐛 Troubleshooting

### La agenda no se muestra

1. Verificar que estás en vista desktop (lg+)
2. Click en el botón de expansión (flecha)
3. Verificar consola por errores de permisos

### Las citas no se cargan

1. Verificar conexión a Supabase
2. Revisar permisos RLS en tabla `consultas`
3. Verificar que `useConsultas()` no tiene errores

### Conflictos de horario no se detectan

1. Verificar formato de fecha/hora en BD
2. Revisar lógica de validación en `QuickAddAppointmentModal.tsx`
3. Verificar zona horaria configurada

### Modales no se cierran

1. Verificar estado en `useMedicalAgendaSidebar`
2. Click fuera del modal (backdrop)
3. Presionar ESC

## 📚 Recursos Adicionales

- **Temporal API**: Usado para manejo seguro de fechas y timezones
- **Zustand**: Estado global con persistencia
- **SWR**: Data fetching con caché inteligente
- **Supabase**: Base de datos y autenticación
- **Tailwind CSS**: Estilos utilitarios

## 🔐 Seguridad

### Autenticación
- Todas las operaciones requieren autenticación
- Middleware protege rutas
- Tokens manejados por Supabase

### Autorización
- RLS (Row Level Security) en Supabase
- Solo usuarios autorizados pueden modificar citas
- Logs de todas las operaciones (TODO)

### Validación
- Validación de formularios en frontend
- Validación de conflictos antes de insertar
- Sanitización de inputs

## 🚀 Próximas Mejoras

### Corto Plazo
- [ ] Implementar tabla de fichas clínicas
- [ ] Agregar campos de diagnóstico y tratamiento
- [ ] Crear vista de calendario mensual visual
- [ ] Agregar drag & drop para reprogramar

### Mediano Plazo
- [ ] Integración con WhatsApp Business API
- [ ] Recordatorios automáticos por SMS
- [ ] Sincronización con Google Calendar
- [ ] Export a PDF de agenda semanal

### Largo Plazo
- [ ] IA para sugerencia de horarios óptimos
- [ ] Predicción de no-shows
- [ ] Optimización automática de agenda
- [ ] Integración con sistemas de pagos

---

**Desarrollado para Urobot CRM**
**Versión 1.0.0**
**Fecha: Noviembre 2025**
