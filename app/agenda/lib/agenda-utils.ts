/**
 * ============================================================
 * UTILIDADES PARA LA AGENDA
 * ============================================================
 * Funciones de formateo, cálculos y helpers para la interfaz de agenda
 */

import { Temporal } from '@js-temporal/polyfill';
import type { Consulta } from '@/types/consultas';

// ========== FORMATEO DE FECHAS Y HORAS ==========

/**
 * Formatea un ZonedDateTime a formato de hora corto (HH:MM)
 */
export const formatShortTime = (date: Temporal.ZonedDateTime): string => {
  return date.toPlainTime().toString().slice(0, 5);
};

/**
 * Formatea un rango de tiempo
 * @example "09:00 - 09:45"
 */
export const formatTimeRange = (start: Temporal.ZonedDateTime, end: Temporal.ZonedDateTime): string => {
  return `${formatShortTime(start)} - ${formatShortTime(end)}`;
};

/**
 * Formatea una fecha completa en español
 * @example "Lunes 15 de mayo, 2025"
 */
export const formatLongDate = (date: Temporal.ZonedDateTime): string => {
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const dayOfWeek = dayNames[date.dayOfWeek % 7];
  const day = date.day;
  const month = monthNames[date.month - 1];
  const year = date.year;

  return `${dayOfWeek} ${day} de ${month}, ${year}`;
};

/**
 * Formatea una fecha corta
 * @example "15/05"
 */
const formatShortDate = (date: Temporal.ZonedDateTime): string => {
  return `${String(date.day).padStart(2, '0')}/${String(date.month).padStart(2, '0')}`;
};

/**
 * Formatea una fecha media
 * @example "15 may"
 */
const formatMediumDate = (date: Temporal.ZonedDateTime): string => {
  const shortMonths = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${date.day} ${shortMonths[date.month - 1]}`;
};

// ========== CÁLCULOS DE TIEMPO ==========

/**
 * Calcula el tiempo relativo hasta una fecha
 * @returns Objeto con información del tiempo relativo
 */
const getTimeUntil = (appointmentDate: Temporal.ZonedDateTime) => {
  const now = Temporal.Now.zonedDateTimeISO(appointmentDate.timeZoneId);
  const duration = appointmentDate.since(now);

  const totalMinutes = duration.total({ unit: 'minutes' });
  const totalHours = duration.total({ unit: 'hours' });
  const totalDays = duration.total({ unit: 'days' });

  // Determinar urgencia
  let urgency: 'urgent' | 'soon' | 'normal' | 'past' = 'normal';
  if (totalMinutes < 0) urgency = 'past';
  else if (totalHours < 2) urgency = 'urgent';
  else if (totalHours < 24) urgency = 'soon';

  // Generar texto descriptivo
  let text = '';
  if (totalMinutes < 0) {
    text = 'Pasada';
  } else if (totalMinutes < 60) {
    text = `En ${Math.floor(totalMinutes)} min`;
  } else if (totalHours < 24) {
    text = `En ${Math.floor(totalHours)}h`;
  } else if (totalDays < 7) {
    text = `En ${Math.floor(totalDays)} días`;
  } else {
    text = formatShortDate(appointmentDate);
  }

  return {
    urgency,
    text,
    totalMinutes,
    totalHours,
    totalDays,
    isPast: totalMinutes < 0,
    isToday: appointmentDate.toPlainDate().equals(now.toPlainDate()),
    isTomorrow: appointmentDate.toPlainDate().equals(now.toPlainDate().add({ days: 1 })),
  };
};

/**
 * Agrupa citas por día
 */
const groupAppointmentsByDay = <T extends { start: Temporal.ZonedDateTime }>(
  appointments: T[]
) => {
  const groups = new Map<string, T[]>();

  for (const appointment of appointments) {
    const dateKey = appointment.start.toPlainDate().toString();
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(appointment);
  }

  return Array.from(groups.entries()).map(([date, items]) => ({
    date: Temporal.PlainDate.from(date),
    appointments: items,
  }));
};

// ========== HELPERS DE ESTADO ==========

type AppointmentStatus = 'programada' | 'confirmada' | 'reagendada' | 'cancelada' | 'completada';

const STATUS_CONFIG = {
  programada: {
    label: 'Programada',
    icon: '',
    color: 'blue',
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500/40',
    textClass: 'text-blue-300',
    dotClass: 'bg-blue-400',
  },
  confirmada: {
    label: 'Confirmada',
    icon: '',
    color: 'green',
    bgClass: 'bg-green-500/10',
    borderClass: 'border-green-500/40',
    textClass: 'text-green-300',
    dotClass: 'bg-green-400',
  },
  reagendada: {
    label: 'Reagendada',
    icon: '',
    color: 'yellow',
    bgClass: 'bg-yellow-500/10',
    borderClass: 'border-yellow-500/40',
    textClass: 'text-yellow-300',
    dotClass: 'bg-yellow-400',
  },
  cancelada: {
    label: 'Cancelada',
    icon: '',
    color: 'red',
    bgClass: 'bg-red-500/10',
    borderClass: 'border-red-500/40',
    textClass: 'text-red-300',
    dotClass: 'bg-red-400',
  },
  completada: {
    label: 'Completada',
    icon: '',
    color: 'gray',
    bgClass: 'bg-gray-500/10',
    borderClass: 'border-gray-500/40',
    textClass: 'text-slate-300',
    dotClass: 'bg-slate-400',
  },
} as const;

export const getStatusConfig = (status: string) => {
  const normalizedStatus = status.toLowerCase() as AppointmentStatus;
  return STATUS_CONFIG[normalizedStatus] ?? STATUS_CONFIG.programada;
};

// ========== HELPERS DE URGENCIA ==========

const URGENCY_CONFIG = {
  urgent: {
    label: 'Urgente',
    borderClass: 'border-red-500 border-2 shadow-lg shadow-red-500/30',
    badgeClass: 'bg-red-500 text-white',
  },
  soon: {
    label: 'Próxima',
    borderClass: 'border-yellow-500',
    badgeClass: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/40',
  },
  normal: {
    label: 'Normal',
    borderClass: 'border-slate-700',
    badgeClass: 'bg-slate-700/20 text-slate-300 border-slate-600/40',
  },
  past: {
    label: 'Pasada',
    borderClass: 'border-slate-800',
    badgeClass: 'bg-slate-800/20 text-slate-500 border-slate-700/40',
  },
} as const;

// ========== FORMATEO DE NOMBRES ==========

/**
 * Obtiene las iniciales de un nombre
 * @example "Juan Pérez" → "JP"
 */
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

/**
 * Acorta un nombre para visualización compacta
 * @example "Juan Pérez Gómez" → "Juan Pérez"
 */
const getShortName = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).join(' ');
};

// ========== ESTADÍSTICAS ==========

const calculateStats = (consultas: Consulta[]) => {
  const total = consultas.length;
  const confirmadas = consultas.filter(c => c.estadoCita.toLowerCase() === 'confirmada').length;
  const programadas = consultas.filter(c => c.estadoCita.toLowerCase() === 'programada').length;
  const canceladas = consultas.filter(c => c.estadoCita.toLowerCase() === 'cancelada').length;
  const reagendadas = consultas.filter(c => c.estadoCita.toLowerCase() === 'reagendada').length;

  const polanco = consultas.filter(c => c.sede === 'POLANCO').length;
  const satelite = consultas.filter(c => c.sede === 'SATELITE').length;

  // Próximas 24 horas
  const now = Temporal.Now.zonedDateTimeISO('America/Mexico_City');
  const next24h = now.add({ hours: 24 });

  const proximas24h = consultas.filter(c => {
    try {
      const fechaConsulta = c.fechaConsulta ?? Temporal.Now.plainDateISO('America/Mexico_City').toString();
      const horaConsulta = c.horaConsulta ?? '00:00:00';
      const fechaBase = Temporal.PlainDateTime.from(`${fechaConsulta}T${horaConsulta}`);
      const fechaInicio = fechaBase.toZonedDateTime('America/Mexico_City');

      return Temporal.ZonedDateTime.compare(fechaInicio, now) >= 0 &&
             Temporal.ZonedDateTime.compare(fechaInicio, next24h) <= 0;
    } catch {
      return false;
    }
  }).length;

  const pendientesConfirmar = consultas.filter(c =>
    c.estadoCita.toLowerCase() === 'programada' && !c.confirmadoPaciente
  ).length;

  return {
    total,
    confirmadas,
    programadas,
    canceladas,
    reagendadas,
    polanco,
    satelite,
    proximas24h,
    pendientesConfirmar,
    confirmationRate: total > 0 ? Math.round((confirmadas / total) * 100) : 0,
    cancellationRate: total > 0 ? Math.round((canceladas / total) * 100) : 0,
  };
};

// ========== BÚSQUEDA Y FILTRADO ==========

/**
 * Filtra citas según criterios de búsqueda
 */
const filterAppointments = (
  consultas: Consulta[],
  filters: {
    searchQuery?: string;
    sede?: 'ALL' | 'POLANCO' | 'SATELITE';
    estados?: string[];
    onlyToday?: boolean;
    onlyPendingConfirmation?: boolean;
  }
) => {
  let filtered = [...consultas];

  // Filtro de búsqueda por nombre
  if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
    const query = filters.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(c =>
      (c.paciente || '').toLowerCase().includes(query)
    );
  }

  // Filtro por sede
  if (filters.sede && filters.sede !== 'ALL') {
    filtered = filtered.filter(c => c.sede === filters.sede);
  }

  // Filtro por estados
  if (filters.estados && filters.estados.length > 0) {
    filtered = filtered.filter(c =>
      filters.estados!.includes(c.estadoCita.toLowerCase())
    );
  }

  // Filtro solo hoy
  if (filters.onlyToday) {
    const today = Temporal.Now.plainDateISO('America/Mexico_City');
    filtered = filtered.filter(c => {
      const fechaConsulta = c.fechaConsulta ?? today.toString();
      return fechaConsulta === today.toString();
    });
  }

  // Filtro pendientes de confirmar
  if (filters.onlyPendingConfirmation) {
    filtered = filtered.filter(c =>
      c.estadoCita.toLowerCase() === 'programada' && !c.confirmadoPaciente
    );
  }

  return filtered;
};
