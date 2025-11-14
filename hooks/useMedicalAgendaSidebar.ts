/**
 * ============================================================
 * HOOK: useMedicalAgendaSidebar
 * ============================================================
 * Hook para manejar el estado de la agenda médica embebida
 * en la sidebar principal del sistema
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Consulta } from '@/types/consultas';

export type AgendaView = 'day' | 'week' | 'month';
export type AgendaFilter = 'all' | 'today' | 'pending' | 'confirmed';

interface MedicalAgendaSidebarState {
  // Estado de expansión
  isExpanded: boolean;
  setExpanded: (expanded: boolean) => void;
  toggleExpanded: () => void;

  // Vista actual (día/semana/mes)
  currentView: AgendaView;
  setView: (view: AgendaView) => void;

  // Filtros
  currentFilter: AgendaFilter;
  setFilter: (filter: AgendaFilter) => void;
  selectedSede: 'ALL' | 'POLANCO' | 'SATELITE';
  setSelectedSede: (sede: 'ALL' | 'POLANCO' | 'SATELITE') => void;

  // Fecha seleccionada
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  goToToday: () => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;

  // Modal de agregar/editar cita
  isAddModalOpen: boolean;
  setAddModalOpen: (open: boolean) => void;
  selectedAppointment: Consulta | null;
  setSelectedAppointment: (appointment: Consulta | null) => void;
  isDetailsModalOpen: boolean;
  setDetailsModalOpen: (open: boolean) => void;

  // Búsqueda rápida
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Notificaciones
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
}

export const useMedicalAgendaSidebar = create<MedicalAgendaSidebarState>()(
  persist(
    (set) => ({
      // Estado inicial
      isExpanded: false,
      currentView: 'day',
      currentFilter: 'all',
      selectedSede: 'ALL',
      selectedDate: new Date(),
      isAddModalOpen: false,
      selectedAppointment: null,
      isDetailsModalOpen: false,
      searchQuery: '',
      showNotifications: false,

      // Acciones de expansión
      setExpanded: (expanded) => set({ isExpanded: expanded }),
      toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),

      // Acciones de vista
      setView: (view) => set({ currentView: view }),

      // Acciones de filtro
      setFilter: (filter) => set({ currentFilter: filter }),
      setSelectedSede: (sede) => set({ selectedSede: sede }),

      // Acciones de fecha
      setSelectedDate: (date) => set({ selectedDate: date }),
      goToToday: () => set({ selectedDate: new Date() }),

      goToPreviousDay: () =>
        set((state) => {
          const newDate = new Date(state.selectedDate);
          newDate.setDate(newDate.getDate() - 1);
          return { selectedDate: newDate };
        }),

      goToNextDay: () =>
        set((state) => {
          const newDate = new Date(state.selectedDate);
          newDate.setDate(newDate.getDate() + 1);
          return { selectedDate: newDate };
        }),

      goToPreviousWeek: () =>
        set((state) => {
          const newDate = new Date(state.selectedDate);
          newDate.setDate(newDate.getDate() - 7);
          return { selectedDate: newDate };
        }),

      goToNextWeek: () =>
        set((state) => {
          const newDate = new Date(state.selectedDate);
          newDate.setDate(newDate.getDate() + 7);
          return { selectedDate: newDate };
        }),

      goToPreviousMonth: () =>
        set((state) => {
          const newDate = new Date(state.selectedDate);
          newDate.setMonth(newDate.getMonth() - 1);
          return { selectedDate: newDate };
        }),

      goToNextMonth: () =>
        set((state) => {
          const newDate = new Date(state.selectedDate);
          newDate.setMonth(newDate.getMonth() + 1);
          return { selectedDate: newDate };
        }),

      // Acciones de modal
      setAddModalOpen: (open) => set({ isAddModalOpen: open }),
      setSelectedAppointment: (appointment) => set({ selectedAppointment: appointment }),
      setDetailsModalOpen: (open) => set({ isDetailsModalOpen: open }),

      // Acciones de búsqueda
      setSearchQuery: (query) => set({ searchQuery: query }),

      // Acciones de notificaciones
      setShowNotifications: (show) => set({ showNotifications: show }),
    }),
    {
      name: 'medical-agenda-sidebar',
      // Solo persistir preferencias, no datos temporales
      partialize: (state) => ({
        isExpanded: state.isExpanded,
        currentView: state.currentView,
        selectedSede: state.selectedSede,
        showNotifications: state.showNotifications,
      }),
    }
  )
);
