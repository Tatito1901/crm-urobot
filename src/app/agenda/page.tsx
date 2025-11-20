/**
 * ============================================================
 * PÁGINA AGENDA - Vista principal del calendario
 * ============================================================
 * Calendario interactivo con múltiples vistas y gestión de citas
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useAgendaState } from '@/hooks/domain/agenda/useAgendaState';
import { HeaderBar } from '@/components/domain/agenda/calendar/HeaderBar';
import { TimeGrid } from '@/components/domain/agenda/calendar/TimeGrid';
import { ListView } from '@/components/domain/agenda/calendar/ListView';
import { FiltersPanel } from '@/components/domain/agenda/calendar/FiltersPanel';
import { CreateAppointmentModal } from '@/components/domain/agenda/modals/CreateAppointmentModal';
import { AppointmentDetailsModal } from '@/components/domain/agenda/modals/AppointmentDetailsModal';
import { EditAppointmentModal } from '@/components/domain/agenda/modals/EditAppointmentModal';
import type { Appointment } from '@/features/agenda/types';

export const dynamic = 'force-dynamic';

export default function AgendaPage() {
  // Estado global de la agenda
  const {
    viewMode,
    selectedDate,
    dateRange,
    showFilters,
    isCreateModalOpen,
    isDetailsModalOpen,
    isEditModalOpen,
    selectedAppointment,
    selectedSlot,
    openDetailsModal,
    closeDetailsModal,
    closeCreateModal,
    closeEditModal,
  } = useAgendaState();

  // Estado local para citas (temporal - reemplazar con hook de Supabase)
  const [appointments] = useState<Appointment[]>([]);

  // Convertir selectedDate de Temporal a Date para componentes legacy
  const currentWeekStart = useMemo(() => {
    return new Date(selectedDate.toString());
  }, [selectedDate]);

  // Handlers
  const handleWeekChange = useCallback((weekStart: Date) => {
    // Aquí se actualizaría el selectedDate en el store
    console.log('Week changed to:', weekStart);
  }, []);

  const handleAppointmentClick = useCallback((appointment: Appointment) => {
    openDetailsModal(appointment);
  }, [openDetailsModal]);

  // Estadísticas temporales
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    return {
      total: appointments.length,
      pending: appointments.filter(a => !a.confirmadoPaciente).length,
      today: appointments.filter(a => a.start.toString().startsWith(today)).length,
    };
  }, [appointments]);

  return (
    <div className="relative flex h-screen w-full flex-col overflow-x-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header Bar */}
      <div className="relative z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-md overflow-x-hidden">
        <HeaderBar
          currentWeekStart={currentWeekStart}
          onWeekChange={handleWeekChange}
          totalAppointments={stats.total}
          pendingConfirmation={stats.pending}
          todayAppointments={stats.today}
        />
      </div>

      {/* Main Content Area */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Filters Panel (Sidebar) */}
        {showFilters && (
          <div className="relative z-30 w-full sm:w-80 md:w-96 border-r border-white/10 bg-slate-950/90 backdrop-blur-sm">
            <FiltersPanel />
          </div>
        )}

        {/* Calendar View */}
        <div className="relative flex-1 overflow-hidden">
          <div className="h-full w-full overflow-y-auto overflow-x-hidden scrollbar-thin">
            {viewMode === 'list' ? (
              <div className="mx-auto max-w-7xl w-full p-4 sm:p-6 lg:p-8 min-w-0">
                <ListView
                  appointments={appointments}
                  onAppointmentClick={handleAppointmentClick}
                  dateRange={{
                    start: new Date(dateRange.start.toString()),
                    end: new Date(dateRange.end.toString()),
                  }}
                />
              </div>
            ) : viewMode === 'week' || viewMode === 'day' ? (
              <div className="h-full w-full min-w-0">
                <TimeGrid
                  weekStart={currentWeekStart}
                  appointments={appointments}
                  mode={viewMode}
                  onAppointmentClick={handleAppointmentClick}
                  startHour={7}
                  endHour={20}
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <div className="text-6xl">📅</div>
                  <h3 className="text-2xl font-semibold text-white">
                    Vista {viewMode} en desarrollo
                  </h3>
                  <p className="text-white/60 max-w-md mx-auto">
                    Esta vista estará disponible próximamente. Por ahora, usa las vistas de semana, día o lista.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateAppointmentModal
          slot={selectedSlot}
          isOpen={isCreateModalOpen}
          onClose={closeCreateModal}
          onCreate={async (data) => {
            console.log('Nueva cita:', data);
            // TODO: Integrar con Supabase
            closeCreateModal();
            return { success: true };
          }}
        />
      )}
      {isDetailsModalOpen && selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          isOpen={isDetailsModalOpen}
          onClose={closeDetailsModal}
        />
      )}
      {isEditModalOpen && selectedAppointment && (
        <EditAppointmentModal
          appointment={selectedAppointment}
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onUpdate={async (id, updates) => {
            console.log('Cita actualizada:', id, updates);
            // TODO: Integrar con Supabase
            closeEditModal();
            return { success: true };
          }}
        />
      )}

      {/* Loading Overlay (opcional) */}
      {/* {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="text-center space-y-3">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500 mx-auto" />
            <p className="text-white/70">Cargando citas...</p>
          </div>
        </div>
      )} */}
    </div>
  );
}
