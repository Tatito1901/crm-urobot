/**
 * ============================================================
 * HEADER BAR - Barra de navegación superior mejorada
 * ============================================================
 * Con búsqueda global, selector de vista, filtros y estadísticas
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronDown, Search, Filter, Calendar, List, Grid, Activity, Clock, Menu, Settings } from 'lucide-react';
import { formatWeekRangeMX, startOfWeek, addWeeks } from '@/lib/date-utils';
import { useAgendaState, type ViewMode } from '../../hooks/useAgendaState';
import { ViewDensityToggle } from './ViewDensityToggle';
import { ColorPicker } from '../customization/ColorPicker';
import { ThemeToggle } from '@/app/components/common/ThemeToggle';

interface HeaderBarProps {
  currentWeekStart: Date;
  onWeekChange: (weekStart: Date) => void;
  totalAppointments?: number;
  pendingConfirmation?: number;
  todayAppointments?: number;
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

export const HeaderBar = React.memo(function HeaderBar({
  currentWeekStart,
  onWeekChange,
  totalAppointments = 0,
  pendingConfirmation = 0,
  todayAppointments = 0,
}: HeaderBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const weekRange = formatWeekRangeMX(currentWeekStart);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showHourMenu, setShowHourMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

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
    toggleSidebar,
  } = useAgendaState();

  // Cerrar menús con Escape y Click Outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowViewMenu(false);
        setShowHourMenu(false);
        setShowSettingsMenu(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(e.target as Node)) {
        setShowSettingsMenu(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const goToToday = () => {
    onWeekChange(startOfWeek(new Date()));
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
    <header className="border-b border-border bg-background">
      {/* Barra principal - mejorada para mobile */}
      <div className="min-h-[60px] md:h-[64px] px-4 md:px-6 flex items-center justify-between gap-3 py-2 md:py-0">
        {/* Controles de navegación izquierda */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden md:inline">Volver</span>
          </Link>

          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all"
            title="Ir al día de hoy"
          >
            Hoy
          </button>

          <div className="flex items-center">
            <button
              onClick={goToPreviousWeek}
              className="p-1.5 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={goToNextWeek}
              className="p-1.5 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <span className="text-sm md:text-lg font-medium text-foreground hidden sm:inline truncate ml-2">{weekRange}</span>
        </div>

        {/* Acciones derecha */}
        <div className="flex items-center gap-2">
          {/* Buscador global */}
          <div className="relative flex-1 max-w-[140px] sm:max-w-[220px] md:max-w-xs hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cita..."
              className="w-full pl-9 pr-4 py-1.5 text-sm border-none rounded-md bg-muted/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:bg-accent focus:ring-1 focus:ring-ring transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 md:right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Separador vertical sutil */}
          <div className="h-4 w-px bg-border mx-1"></div>

          {/* Botón de filtros - estilo Ghost */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-2 py-1.5 text-sm font-medium rounded-md transition-colors relative ${
              showFilters || activeFiltersCount > 0
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                : 'bg-transparent hover:bg-accent text-muted-foreground hover:text-foreground'
            }`}
            title="Filtros"
          >
            <Filter className="h-4 w-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-blue-500"></span>
            )}
          </button>

          {/* Selector de rango de horas - estilo Ghost */}
          {(viewMode === 'week' || viewMode === 'day') && (
            <div className="relative">
              <button
                onClick={() => setShowHourMenu(!showHourMenu)}
                onBlur={() => setTimeout(() => setShowHourMenu(false), 200)}
                className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                title={currentHourRange.description}
              >
                <span className="hidden lg:inline">{currentHourRange.label}</span>
                <Clock className="h-4 w-4 lg:hidden" />
              </button>

              {/* Dropdown de rango de horas */}
              {showHourMenu && (
                <div className="absolute right-0 mt-1 w-48 rounded-lg bg-popover border border-border shadow-xl z-[200] overflow-hidden py-1">
                  {hourRangeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setHourRange(option.value);
                        setShowHourMenu(false);
                      }}
                      className={`w-full flex flex-col gap-0.5 px-4 py-2 text-left hover:bg-accent transition-colors ${
                        hourRange === option.value ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Selector de vista - estilo Ghost */}
          <div className="relative">
            <button
              onClick={() => setShowViewMenu(!showViewMenu)}
              onBlur={() => setTimeout(() => setShowViewMenu(false), 200)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="hidden md:inline">{currentView.label}</span>
              <span className="md:hidden"><ViewIcon className="h-4 w-4" /></span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            {/* Dropdown de vistas */}
            {showViewMenu && (
              <div className="absolute right-0 mt-1 w-40 rounded-md bg-popover border border-border shadow-xl z-[200] overflow-hidden py-1">
                  {viewOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setViewMode(option.value as ViewMode);
                        setShowViewMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition-colors ${
                        viewMode === option.value ? 'text-primary bg-primary/10' : 'text-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4 opacity-70" />
                      <span>{option.label}</span>
                      {viewMode === option.value && (
                        <svg
                          className="ml-auto h-3.5 w-3.5"
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

          {/* Menú de configuración - NUEVO */}
          <div className="relative" ref={settingsMenuRef}>
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="flex items-center justify-center p-2 border border-border rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              title="Configuración"
              aria-label="Configuración"
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* Dropdown de configuración */}
            {showSettingsMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-lg bg-popover border border-border shadow-2xl z-50 p-3 space-y-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Configuración
                </div>
                
                {/* Tema */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Tema</span>
                  <ThemeToggle />
                </div>

                {/* Densidad de vista */}
                <div className="pt-2 border-t border-border">
                  <span className="text-sm text-foreground block mb-2">Densidad</span>
                  <ViewDensityToggle />
                </div>

                {/* Colores de sedes */}
                <div className="pt-2 border-t border-border">
                  <span className="text-sm text-foreground block mb-2">Colores</span>
                  <ColorPicker />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra de estadísticas rápidas */}
      {(totalAppointments > 0 || pendingConfirmation > 0 || todayAppointments > 0) && (
        <div className="px-4 md:px-6 py-1.5 border-t border-border bg-background flex items-center gap-6 text-xs">
          {todayAppointments > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Hoy</span>
              <span className="font-medium text-foreground">{todayAppointments}</span>
            </div>
          )}
          {pendingConfirmation > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-amber-500/80">Pendientes</span>
              <span className="font-medium text-amber-500">{pendingConfirmation}</span>
            </div>
          )}
        </div>
      )}
    </header>
  );
});
