/**
 * ============================================================
 * HEADER BAR - Barra de navegación superior mejorada
 * ============================================================
 * Con búsqueda global, selector de vista, filtros y estadísticas
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronDown, Search, Filter, Calendar, List, Grid, Activity, Clock } from 'lucide-react';
import { formatWeekRangeMX, startOfWeek, addWeeks } from '@/lib/date-utils';
import { useAgendaState } from '../../hooks/useAgendaState';

interface HeaderBarProps {
  currentWeekStart: Date;
  onWeekChange: (weekStart: Date) => void;
  totalAppointments?: number;
  pendingConfirmation?: number;
  todayAppointments?: number;
}

export const HeaderBar = React.memo(function HeaderBar({
  currentWeekStart,
  onWeekChange,
  totalAppointments = 0,
  pendingConfirmation = 0,
  todayAppointments = 0,
}: HeaderBarProps) {
  const weekRange = formatWeekRangeMX(currentWeekStart);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showHourMenu, setShowHourMenu] = useState(false);
  const viewMenuRef = useRef<HTMLDivElement>(null);
  const hourMenuRef = useRef<HTMLDivElement>(null);

  const {
    viewMode,
    setViewMode,
    hourRange,
    setHourRange,
    searchQuery,
    setSearchQuery,
    showFilters,
    setShowFilters,
    selectedSede,
    selectedEstados,
    selectedTipos,
    selectedPrioridades,
  } = useAgendaState();

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (viewMenuRef.current && !viewMenuRef.current.contains(event.target as Node)) {
        setShowViewMenu(false);
      }
      if (hourMenuRef.current && !hourMenuRef.current.contains(event.target as Node)) {
        setShowHourMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goToToday = () => {
    const today = new Date();
    const thisWeek = startOfWeek(today);
    onWeekChange(thisWeek);
    
    // Auto-scroll en TimeGrid si existe
    setTimeout(() => {
      const timeGrid = document.querySelector('[data-time-grid]');
      if (timeGrid) {
        const currentTimeLine = timeGrid.querySelector('[data-current-time]');
        if (currentTimeLine) {
          currentTimeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 200);
  };

  const goToPreviousWeek = () => {
    onWeekChange(addWeeks(currentWeekStart, -1));
  };

  const goToNextWeek = () => {
    onWeekChange(addWeeks(currentWeekStart, 1));
  };

  const viewOptions = [
    { value: 'week', label: 'Semana', icon: Calendar },
    { value: 'day', label: 'Día', icon: Grid },
    { value: 'month', label: 'Mes', icon: Calendar },
    { value: 'list', label: 'Lista', icon: List },
    { value: 'heatmap', label: 'Heatmap', icon: Activity },
  ] as const;
  
  const hourRangeOptions = [
    { value: 'business', label: '7 AM - 9 PM', description: 'Horario laboral' },
    { value: 'extended', label: '6 AM - 10 PM', description: 'Horario extendido' },
    { value: 'full', label: '24 horas', description: 'Día completo' },
  ] as const;

  const currentView = viewOptions.find((v) => v.value === viewMode) || viewOptions[0];
  const ViewIcon = currentView.icon;
  const currentHourRange = hourRangeOptions.find((h) => h.value === hourRange) || hourRangeOptions[0];

  const activeFiltersCount =
    (selectedSede !== 'ALL' ? 1 : 0) +
    selectedEstados.length +
    selectedTipos.length +
    selectedPrioridades.length;

  return (
    <header className="border-b border-slate-800/60 bg-slate-900/40">
      {/* Barra principal - mejorada para mobile */}
      <div className="min-h-[70px] md:h-[80px] px-3 md:px-6 flex items-center justify-between gap-2 py-2 md:py-0">
        {/* Controles de navegación izquierda */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/70 px-2.5 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-slate-100 hover:bg-slate-800/80 hover:border-slate-500 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden md:inline">Volver</span>
          </Link>
          <button
            onClick={goToToday}
            className="px-2.5 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold border-2 border-emerald-500/40 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-500/60 transition-all text-emerald-400 hover:scale-105 active:scale-95"
            title="Ir al día de hoy"
          >
            Hoy
          </button>

          <div className="flex items-center gap-0.5 md:gap-1">
            <button
              onClick={goToPreviousWeek}
              className="p-1.5 md:p-2 rounded-lg hover:bg-slate-800/60 transition-colors flex items-center justify-center"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-slate-300" />
            </button>

            <button
              onClick={goToNextWeek}
              className="p-1.5 md:p-2 rounded-lg hover:bg-slate-800/60 transition-colors flex items-center justify-center"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-slate-300" />
            </button>
          </div>

          <span className="text-xs md:text-sm lg:text-base font-bold text-slate-100 hidden sm:inline truncate">{weekRange}</span>
        </div>

        {/* Acciones derecha */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Buscador global - más compacto en móvil */}
          <div className="relative flex-1 max-w-[120px] sm:max-w-[200px] md:max-w-xs">
            <Search className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-7 md:pl-10 pr-7 md:pr-10 py-1.5 md:py-2 text-xs md:text-sm border border-slate-700 rounded-lg bg-slate-800/40 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                <svg className="h-3 w-3 md:h-4 md:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Botón de filtros - más compacto */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 md:gap-2 px-2 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium border rounded-lg transition-colors relative ${
              showFilters || activeFiltersCount > 0
                ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                : 'border-slate-700 hover:bg-slate-800/60 text-slate-200'
            }`}
          >
            <Filter className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden md:inline">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Selector de rango de horas - Solo visible en vistas week/day */}
          {(viewMode === 'week' || viewMode === 'day') && (
            <div className="relative" ref={hourMenuRef}>
              <button
                onClick={() => setShowHourMenu(!showHourMenu)}
                className="flex items-center gap-1 md:gap-2 px-2 py-2 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium border border-slate-700 rounded-lg hover:bg-slate-800/60 transition-colors text-slate-200"
                title={currentHourRange.description}
              >
                <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden lg:inline text-xs">{currentHourRange.label}</span>
                <ChevronDown className="h-3 w-3 md:h-3.5 md:w-3.5" />
              </button>

              {/* Dropdown de rango de horas */}
              {showHourMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-slate-800 border border-slate-700 shadow-2xl z-[100] overflow-hidden">
                  {hourRangeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setHourRange(option.value);
                        setShowHourMenu(false);
                      }}
                      className={`w-full flex flex-col gap-0.5 px-4 py-2.5 text-left transition-colors ${
                        hourRange === option.value
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      <span className="text-sm font-medium">{option.label}</span>
                      <span className="text-xs text-slate-400">{option.description}</span>
                      {hourRange === option.value && (
                        <svg
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Selector de vista - más compacto */}
          <div className="relative" ref={viewMenuRef}>
            <button
              onClick={() => setShowViewMenu(!showViewMenu)}
              className="flex items-center gap-1 md:gap-2 px-2 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium border border-slate-700 rounded-lg hover:bg-slate-800/60 transition-colors text-slate-200"
            >
              <ViewIcon className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden md:inline">{currentView.label}</span>
              <ChevronDown className="h-3 w-3 md:h-3.5 md:w-3.5" />
            </button>

            {/* Dropdown de vistas */}
            {showViewMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg bg-slate-800 border border-slate-700 shadow-2xl z-[100] overflow-hidden">
                {viewOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setViewMode(option.value);
                        setShowViewMenu(false);
                        // Al cambiar de vista, volver a enfocar hoy
                        setTimeout(() => goToToday(), 100);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        viewMode === option.value
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{option.label}</span>
                      {viewMode === option.value && (
                        <svg
                          className="ml-auto h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra de estadísticas rápidas */}
      {(totalAppointments > 0 || pendingConfirmation > 0 || todayAppointments > 0) && (
        <div className="px-3 md:px-6 py-2 border-t border-slate-800/40 bg-slate-900/20 overflow-x-auto">
          <div className="flex items-center gap-3 md:gap-6 text-xs whitespace-nowrap">
            {todayAppointments > 0 && (
              <div className="flex items-center gap-1 md:gap-2">
                <span className="text-slate-400">Hoy:</span>
                <span className="font-semibold text-slate-200">{todayAppointments}</span>
              </div>
            )}
            {totalAppointments > 0 && (
              <div className="flex items-center gap-1 md:gap-2">
                <span className="text-slate-400 hidden sm:inline">Total visible:</span>
                <span className="text-slate-400 sm:hidden">Total:</span>
                <span className="font-semibold text-slate-200">{totalAppointments}</span>
              </div>
            )}
            {pendingConfirmation > 0 && (
              <div className="flex items-center gap-1 md:gap-2">
                <span className="text-amber-400">⏳ Pend:</span>
                <span className="font-semibold text-amber-400">{pendingConfirmation}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
});
