/**
 * CONFIGURACIÓN GLOBAL PARA LA AGENDA
 * Centraliza constantes, configuraciones y utilidades
 */

import { Temporal } from '@js-temporal/polyfill'

if (typeof globalThis !== 'undefined' && !('Temporal' in globalThis)) {
  // Schedule-X y otras dependencias esperan Temporal en el ámbito global
  ;(globalThis as typeof globalThis & { Temporal: typeof Temporal }).Temporal = Temporal
}

// ========== CONSTANTES ==========
export const AGENDA_CONFIG = {
  TIMEZONE: 'America/Mexico_City' as const,
  LOCALE: 'es-ES' as const,
  FIRST_DAY_OF_WEEK: 1, // Lunes
  DEFAULT_VIEW: 'week' as const,
  EVENT_DURATION_MINUTES: 45,
  WORK_DAYS_COUNT: 4, // L-V (0-4, domingo sería 6)
  IS_DARK_THEME: true, // Dark theme por defecto
} as const;

// ========== COLORES DOCTORALIA DARK THEME ==========
export const AGENDA_COLORS = {
  programada: {
    main: '#60a5fa',
    container: '#1e40af',
    onContainer: '#ffffff',
  },
  confirmada: {
    main: '#34d399',
    container: '#065f46',
    onContainer: '#ffffff',
  },
  reagendada: {
    main: '#fbbf24',
    container: '#92400e',
    onContainer: '#ffffff',
  },
  cancelada: {
    main: '#f87171',
    container: '#991b1b',
    onContainer: '#ffffff',
  },
} as const;

// ========== COLORES DE SEDE ==========
export const SEDE_COLORS = {
  POLANCO: {
    accent: '#8b5cf6',
    bg: '#2d1b69',
    text: '#e9d5ff',
  },
  SATELITE: {
    accent: '#06b6d4',
    bg: '#164e63',
    text: '#cffafe',
  },
} as const;

// ========== TIPOS ==========
export type ViewKey = 'day' | 'week';
export type EstadoConsulta = keyof typeof AGENDA_COLORS;
export type SedeFilter = 'ALL' | 'POLANCO' | 'SATELITE';
export type SedeKey = keyof typeof SEDE_COLORS;

// ========== UTILIDADES DE FECHA ==========
export const dateUtils = {
  /**
   * Formatea un número con padding de ceros
   */
  pad: (n: number): string => n.toString().padStart(2, '0'),

  /**
   * Obtiene el nombre del mes en español
   */
  monthName: (m: number): string => {
    const names = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return names[m - 1];
  },

  /**
   * Obtiene el inicio de la semana (lunes)
   */
  startOfWeek: (date: Temporal.PlainDate): Temporal.PlainDate => {
    const dow = (date.dayOfWeek ?? 1) as number;
    return date.subtract({ days: dow - 1 });
  },

  /**
   * Convierte Date a Temporal.PlainDate
   */
  toPlainDate: (date: Date): Temporal.PlainDate => {
    const iso = date.toISOString();
    return Temporal.PlainDate.from(iso.split('T')[0]);
  },

  /**
   * Convierte Temporal.PlainDate a Date
   */
  toDate: (plain: Temporal.PlainDate): Date => {
    return new Date(`${plain.toString()}T00:00:00`);
  },

  /**
   * Formatea una fecha para mostrar en el rango
   */
  formatRange: (date: Temporal.PlainDate, view: ViewKey): string => {
    if (view === 'day') {
      return `${dateUtils.pad(date.day)} ${dateUtils.monthName(date.month)} ${date.year}`;
    }
    
    // Semana (lunes a viernes)
    const start = dateUtils.startOfWeek(date);
    const end = start.add({ days: AGENDA_CONFIG.WORK_DAYS_COUNT });
    return `${dateUtils.pad(start.day)}–${dateUtils.pad(end.day)} ${dateUtils.monthName(start.month)}, ${start.year}`;
  },
};

// ========== CONFIGURACIÓN SCHEDULE-X ==========
export const createScheduleXConfig = (selectedDate: Temporal.PlainDate) => ({
  locale: AGENDA_CONFIG.LOCALE,
  timezone: AGENDA_CONFIG.TIMEZONE,
  firstDayOfWeek: AGENDA_CONFIG.FIRST_DAY_OF_WEEK,
  selectedDate,
  isDark: AGENDA_CONFIG.IS_DARK_THEME,
  isResponsive: true,
  dayBoundaries: {
    start: '06:00',
    end: '22:00',
  },
  weekOptions: {
    gridHeight: 1500,
    nDays: AGENDA_CONFIG.WORK_DAYS_COUNT,
    eventWidth: 94,
    timeAxisFormatOptions: { 
      hour: 'numeric' as const,
    },
  },
  calendars: Object.fromEntries(
    Object.entries(AGENDA_COLORS).map(([key, colors]) => [
      key,
      {
        colorName: key,
        lightColors: {
          main: colors.main,
          container: colors.onContainer,
          onContainer: colors.container,
        },
        darkColors: colors, // Ya optimizados para dark theme
      },
    ])
  ),
  events: [],
});

// ========== PERFORMANCE OPTIMIZATIONS ==========
export const PERFORMANCE_CONFIG = {
  // Debounce para eventos de navegación
  NAVIGATION_DEBOUNCE: 150,
  
  // Throttle para resize events
  RESIZE_THROTTLE: 200,
  
  // Keys para React.memo dependencies
  MEMO_KEYS: {
    toolbar: ['activeView', 'rangeLabel'],
    sidebar: ['selectedDate'],
    calendar: ['activeView', 'selectedDate', 'events'],
  },
} as const;
