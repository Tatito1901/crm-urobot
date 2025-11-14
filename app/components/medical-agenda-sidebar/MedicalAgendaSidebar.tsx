/**
 * ============================================================
 * COMPONENTE: MedicalAgendaSidebar
 * ============================================================
 * Agenda médica embebida en la sidebar principal
 * Siempre visible y accesible desde cualquier parte del sistema
 */

'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/app/lib/utils';
import { useMedicalAgendaSidebar } from '@/hooks/useMedicalAgendaSidebar';
import { useConsultas } from '@/hooks/useConsultas';
import { AgendaAppointmentCard } from './AgendaAppointmentCard';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Search,
  Bell,
  X,
  CalendarDays,
  CalendarRange,
  Loader2,
} from 'lucide-react';
import type { Consulta } from '@/types/consultas';

const VIEW_CONFIG = {
  day: { label: 'Día', icon: Calendar },
  week: { label: 'Semana', icon: CalendarDays },
  month: { label: 'Mes', icon: CalendarRange },
} as const;

const FILTER_CONFIG = {
  all: { label: 'Todas', color: 'text-white/70' },
  today: { label: 'Hoy', color: 'text-blue-400' },
  pending: { label: 'Pendientes', color: 'text-yellow-400' },
  confirmed: { label: 'Confirmadas', color: 'text-green-400' },
} as const;

export function MedicalAgendaSidebar() {
  const {
    currentView,
    setView,
    currentFilter,
    setFilter,
    selectedSede,
    setSelectedSede,
    selectedDate,
    goToPreviousDay,
    goToNextDay,
    goToPreviousWeek,
    goToNextWeek,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    setAddModalOpen,
    setSelectedAppointment,
    setDetailsModalOpen,
    searchQuery,
    setSearchQuery,
  } = useMedicalAgendaSidebar();

  const { consultas, loading } = useConsultas();
  const [showFilters, setShowFilters] = useState(false);

  // Filtrar consultas según vista, filtro y búsqueda
  const filteredAppointments = useMemo(() => {
    let filtered = [...consultas];

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.paciente.toLowerCase().includes(query) ||
          apt.motivoConsulta?.toLowerCase().includes(query)
      );
    }

    // Filtrar por sede
    if (selectedSede !== 'ALL') {
      filtered = filtered.filter((apt) => apt.sede === selectedSede);
    }

    // Filtrar por tipo de filtro
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (currentFilter) {
      case 'today':
        filtered = filtered.filter((apt) => {
          const aptDate = new Date(apt.fechaConsulta);
          aptDate.setHours(0, 0, 0, 0);
          return aptDate.getTime() === today.getTime();
        });
        break;
      case 'pending':
        filtered = filtered.filter(
          (apt) => apt.estado === 'Programada' && !apt.confirmadoPaciente
        );
        break;
      case 'confirmed':
        filtered = filtered.filter((apt) => apt.estado === 'Confirmada');
        break;
    }

    // Filtrar por vista (día/semana/mes)
    const viewDate = new Date(selectedDate);
    viewDate.setHours(0, 0, 0, 0);

    switch (currentView) {
      case 'day':
        filtered = filtered.filter((apt) => {
          const aptDate = new Date(apt.fechaConsulta);
          aptDate.setHours(0, 0, 0, 0);
          return aptDate.getTime() === viewDate.getTime();
        });
        break;

      case 'week': {
        const startOfWeek = new Date(viewDate);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        filtered = filtered.filter((apt) => {
          const aptDate = new Date(apt.fechaConsulta);
          return aptDate >= startOfWeek && aptDate <= endOfWeek;
        });
        break;
      }

      case 'month': {
        const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
        const endOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);

        filtered = filtered.filter((apt) => {
          const aptDate = new Date(apt.fechaConsulta);
          return aptDate >= startOfMonth && aptDate <= endOfMonth;
        });
        break;
      }
    }

    // Ordenar por fecha y hora
    return filtered.sort((a, b) => {
      const dateA = new Date(`${a.fechaConsulta}T${a.horaConsulta}`);
      const dateB = new Date(`${b.fechaConsulta}T${b.horaConsulta}`);
      return dateA.getTime() - dateB.getTime();
    });
  }, [consultas, searchQuery, selectedSede, currentFilter, currentView, selectedDate]);

  // Estadísticas rápidas
  const stats = useMemo(() => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const todayAppointments = consultas.filter((apt) => {
      const aptDate = new Date(apt.fechaConsulta);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate.getTime() === todayDate.getTime();
    });

    const pending = consultas.filter(
      (apt) => apt.estado === 'Programada' && !apt.confirmadoPaciente
    );

    return {
      total: consultas.length,
      today: todayAppointments.length,
      pending: pending.length,
      confirmed: consultas.filter((apt) => apt.estado === 'Confirmada').length,
    };
  }, [consultas]);

  // Formatear fecha para mostrar
  const formattedDate = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: currentView === 'month' ? 'numeric' : undefined,
    };
    return new Intl.DateTimeFormat('es-MX', options).format(selectedDate);
  }, [selectedDate, currentView]);

  // Handlers de navegación
  const handlePrevious = () => {
    switch (currentView) {
      case 'day':
        goToPreviousDay();
        break;
      case 'week':
        goToPreviousWeek();
        break;
      case 'month':
        goToPreviousMonth();
        break;
    }
  };

  const handleNext = () => {
    switch (currentView) {
      case 'day':
        goToNextDay();
        break;
      case 'week':
        goToNextWeek();
        break;
      case 'month':
        goToNextMonth();
        break;
    }
  };

  const handleAppointmentClick = (appointment: Consulta) => {
    setSelectedAppointment(appointment);
    setDetailsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header con título y acciones */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-400" />
            Agenda Médica
          </h2>
          <button
            onClick={() => setAddModalOpen(true)}
            className={cn(
              'rounded-lg bg-blue-500/10 p-1.5 text-blue-400 transition-all',
              'hover:bg-blue-500/20 hover:text-blue-300',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
              'active:scale-95'
            )}
            aria-label="Agregar cita"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-white/5 px-2 py-1.5">
            <p className="text-xs text-white/50">Hoy</p>
            <p className="text-sm font-semibold text-white">{stats.today}</p>
          </div>
          <div className="rounded-lg bg-white/5 px-2 py-1.5">
            <p className="text-xs text-white/50">Pend.</p>
            <p className="text-sm font-semibold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="rounded-lg bg-white/5 px-2 py-1.5">
            <p className="text-xs text-white/50">Conf.</p>
            <p className="text-sm font-semibold text-green-400">{stats.confirmed}</p>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="px-4 py-2 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar paciente..."
            className={cn(
              'w-full rounded-lg border border-white/10 bg-white/5 pl-8 pr-8 py-1.5 text-sm text-white placeholder:text-white/40',
              'focus:border-blue-400/50 focus:bg-white/10 focus:outline-none',
              'transition-colors'
            )}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Toggle de vista y navegación */}
      <div className="px-4 py-2 border-b border-white/10 space-y-2">
        {/* Selector de vista */}
        <div className="flex items-center gap-1 rounded-lg bg-white/5 p-1">
          {Object.entries(VIEW_CONFIG).map(([view, config]) => {
            const ViewIcon = config.icon;
            const isActive = currentView === view;
            return (
              <button
                key={view}
                onClick={() => setView(view as typeof currentView)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all',
                  isActive
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
              >
                <ViewIcon className="h-3 w-3" />
                <span className="hidden sm:inline">{config.label}</span>
              </button>
            );
          })}
        </div>

        {/* Navegación de fecha */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            className="rounded-lg p-1 text-white/60 hover:bg-white/5 hover:text-white transition-all active:scale-95"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={goToToday}
            className="flex-1 text-center text-xs font-medium text-white/80 hover:text-white transition-colors"
          >
            {formattedDate}
          </button>

          <button
            onClick={handleNext}
            className="rounded-lg p-1 text-white/60 hover:bg-white/5 hover:text-white transition-all active:scale-95"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'rounded-lg p-1 text-white/60 hover:bg-white/5 hover:text-white transition-all',
              showFilters && 'bg-white/10 text-white'
            )}
            aria-label="Filtros"
          >
            <Filter className="h-3.5 w-3.5" />
          </button>

          <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {Object.entries(FILTER_CONFIG).map(([filter, config]) => (
              <button
                key={filter}
                onClick={() => setFilter(filter as typeof currentFilter)}
                className={cn(
                  'flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium transition-all',
                  currentFilter === filter
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                )}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* Panel de filtros expandido */}
        {showFilters && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-2 space-y-2">
            <div>
              <p className="text-[10px] text-white/50 mb-1">Sede</p>
              <div className="flex gap-1">
                {['ALL', 'POLANCO', 'SATELITE'].map((sede) => (
                  <button
                    key={sede}
                    onClick={() => setSelectedSede(sede as typeof selectedSede)}
                    className={cn(
                      'flex-1 rounded-md px-2 py-1 text-[10px] font-medium transition-all',
                      selectedSede === sede
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    {sede === 'ALL' ? 'Todas' : sede}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de citas */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-8 w-8 text-white/20 mb-2" />
            <p className="text-sm text-white/40">No hay citas</p>
            <p className="text-xs text-white/30 mt-1">
              {searchQuery ? 'Intenta otra búsqueda' : 'Agrega una nueva cita'}
            </p>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <AgendaAppointmentCard
              key={appointment.id}
              appointment={appointment}
              onClick={() => handleAppointmentClick(appointment)}
            />
          ))
        )}
      </div>

      {/* Footer con acceso rápido a agenda completa */}
      <div className="px-4 py-2 border-t border-white/10">
        <a
          href="/agenda"
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/70 transition-all',
            'hover:border-white/20 hover:bg-white/10 hover:text-white',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
            'active:scale-95'
          )}
        >
          <CalendarDays className="h-3.5 w-3.5" />
          Ver agenda completa
        </a>
      </div>
    </div>
  );
}
