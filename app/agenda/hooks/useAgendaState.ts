/**
 * ============================================================
 * HOOK: useAgendaState - Estado global unificado de la agenda
 * ============================================================
 * Centraliza todo el estado de la UI de agenda usando Zustand
 * Reemplaza los múltiples useState dispersos
 */

import { create } from 'zustand';
import { Temporal } from '@js-temporal/polyfill';
import type { Appointment, TimeSlot } from '@/types/agenda';

interface AgendaState {
  // ========== VISTA ==========
  viewMode: 'week' | 'day' | 'month' | 'list' | 'heatmap';
  setViewMode: (mode: 'week' | 'day' | 'month' | 'list' | 'heatmap') => void;
  viewDensity: 'compact' | 'comfortable' | 'spacious';
  setViewDensity: (density: 'compact' | 'comfortable' | 'spacious') => void;

  // ========== FECHA Y RANGO ==========
  selectedDate: Temporal.PlainDate;
  setSelectedDate: (date: Temporal.PlainDate) => void;
  dateRange: { start: Temporal.PlainDate; end: Temporal.PlainDate };

  // ========== FILTROS ==========
  selectedSede: 'ALL' | 'POLANCO' | 'SATELITE';
  setSelectedSede: (sede: 'ALL' | 'POLANCO' | 'SATELITE') => void;
  selectedEstados: string[];
  setSelectedEstados: (estados: string[]) => void;
  selectedTipos: string[];
  setSelectedTipos: (tipos: string[]) => void;
  selectedPrioridades: string[];
  setSelectedPrioridades: (prioridades: string[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onlyToday: boolean;
  setOnlyToday: (value: boolean) => void;
  onlyPendingConfirmation: boolean;
  setOnlyPendingConfirmation: (value: boolean) => void;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;

  // ========== SELECCIÓN ==========
  selectedAppointment: Appointment | null;
  setSelectedAppointment: (appointment: Appointment | null) => void;
  selectedSlot: TimeSlot | null;
  setSelectedSlot: (slot: TimeSlot | null) => void;

  // ========== MODALES ==========
  isDetailsModalOpen: boolean;
  openDetailsModal: (appointment: Appointment) => void;
  closeDetailsModal: () => void;
  isCreateModalOpen: boolean;
  openCreateModal: (slot?: TimeSlot) => void;
  closeCreateModal: () => void;
  isEditModalOpen: boolean;
  openEditModal: (appointment: Appointment) => void;
  closeEditModal: () => void;

  // ========== NAVEGACIÓN ==========
  goToToday: () => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;

  // ========== UTILIDADES ==========
  resetFilters: () => void;
}

/**
 * Store de Zustand para el estado de la agenda
 */
export const useAgendaState = create<AgendaState>((set, get) => ({
  // ========== ESTADO INICIAL ==========
  viewMode: 'week',
  viewDensity: 'comfortable',
  selectedDate: Temporal.Now.plainDateISO('America/Mexico_City'),
  dateRange: getWeekRange(Temporal.Now.plainDateISO('America/Mexico_City')),
  selectedSede: 'ALL',
  selectedEstados: [],
  selectedTipos: [],
  selectedPrioridades: [],
  searchQuery: '',
  onlyToday: false,
  onlyPendingConfirmation: false,
  showFilters: false,
  selectedAppointment: null,
  selectedSlot: null,
  isDetailsModalOpen: false,
  isCreateModalOpen: false,
  isEditModalOpen: false,

  // ========== ACCIONES DE VISTA ==========
  setViewMode: (mode) => {
    set({ viewMode: mode });
    // Recalcular rango según nueva vista
    const { selectedDate } = get();
    const newRange =
      mode === 'week'
        ? getWeekRange(selectedDate)
        : mode === 'day'
        ? getDayRange(selectedDate)
        : getMonthRange(selectedDate);
    set({ dateRange: newRange });
  },

  setViewDensity: (density) => set({ viewDensity: density }),

  // ========== ACCIONES DE FECHA ==========
  setSelectedDate: (date) => {
    set({ selectedDate: date });
    // Actualizar rango automáticamente
    const { viewMode } = get();
    const newRange =
      viewMode === 'week'
        ? getWeekRange(date)
        : viewMode === 'day'
        ? getDayRange(date)
        : getMonthRange(date);
    set({ dateRange: newRange });
  },

  // ========== ACCIONES DE FILTROS ==========
  setSelectedSede: (sede) => set({ selectedSede: sede }),
  setSelectedEstados: (estados) => set({ selectedEstados: estados }),
  setSelectedTipos: (tipos) => set({ selectedTipos: tipos }),
  setSelectedPrioridades: (prioridades) => set({ selectedPrioridades: prioridades }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setOnlyToday: (value) => set({ onlyToday: value }),
  setOnlyPendingConfirmation: (value) => set({ onlyPendingConfirmation: value }),
  setShowFilters: (value) => set({ showFilters: value }),

  resetFilters: () => {
    set({
      selectedSede: 'ALL',
      selectedEstados: [],
      selectedTipos: [],
      selectedPrioridades: [],
      searchQuery: '',
      onlyToday: false,
      onlyPendingConfirmation: false,
    });
  },

  // ========== ACCIONES DE SELECCIÓN ==========
  setSelectedAppointment: (appointment) => set({ selectedAppointment: appointment }),
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),

  // ========== ACCIONES DE MODALES ==========
  openDetailsModal: (appointment) => {
    set({
      selectedAppointment: appointment,
      isDetailsModalOpen: true,
    });
  },

  closeDetailsModal: () => {
    set({ isDetailsModalOpen: false });
    // Limpiar selección después de la animación de cierre
    setTimeout(() => set({ selectedAppointment: null }), 300);
  },

  openCreateModal: (slot) => {
    if (slot) set({ selectedSlot: slot });
    set({ isCreateModalOpen: true });
  },

  closeCreateModal: () => {
    set({ isCreateModalOpen: false });
    setTimeout(() => set({ selectedSlot: null }), 300);
  },

  openEditModal: (appointment) => {
    set({
      selectedAppointment: appointment,
      isEditModalOpen: true,
    });
  },

  closeEditModal: () => {
    set({ isEditModalOpen: false });
    setTimeout(() => set({ selectedAppointment: null }), 300);
  },

  // ========== ACCIONES DE NAVEGACIÓN ==========
  goToToday: () => {
    const today = Temporal.Now.plainDateISO('America/Mexico_City');
    get().setSelectedDate(today);
  },

  goToPreviousWeek: () => {
    const { selectedDate } = get();
    const newDate = selectedDate.subtract({ weeks: 1 });
    get().setSelectedDate(newDate);
  },

  goToNextWeek: () => {
    const { selectedDate } = get();
    const newDate = selectedDate.add({ weeks: 1 });
    get().setSelectedDate(newDate);
  },

  goToPreviousDay: () => {
    const { selectedDate } = get();
    const newDate = selectedDate.subtract({ days: 1 });
    get().setSelectedDate(newDate);
  },

  goToNextDay: () => {
    const { selectedDate } = get();
    const newDate = selectedDate.add({ days: 1 });
    get().setSelectedDate(newDate);
  },

  goToPreviousMonth: () => {
    const { selectedDate } = get();
    const newDate = selectedDate.subtract({ months: 1 });
    get().setSelectedDate(newDate);
  },

  goToNextMonth: () => {
    const { selectedDate } = get();
    const newDate = selectedDate.add({ months: 1 });
    get().setSelectedDate(newDate);
  },
}));

// ========== HELPER FUNCTIONS ==========

function getWeekRange(date: Temporal.PlainDate): {
  start: Temporal.PlainDate;
  end: Temporal.PlainDate;
} {
  const dayOfWeek = date.dayOfWeek; // 1=Lunes, 7=Domingo
  const start = date.subtract({ days: dayOfWeek - 1 });
  const end = start.add({ days: 6 });
  return { start, end };
}

function getDayRange(date: Temporal.PlainDate): {
  start: Temporal.PlainDate;
  end: Temporal.PlainDate;
} {
  return { start: date, end: date };
}

function getMonthRange(date: Temporal.PlainDate): {
  start: Temporal.PlainDate;
  end: Temporal.PlainDate;
} {
  const start = Temporal.PlainDate.from({ year: date.year, month: date.month, day: 1 });
  const daysInMonth = start.daysInMonth;
  const end = Temporal.PlainDate.from({ year: date.year, month: date.month, day: daysInMonth });
  return { start, end };
}
