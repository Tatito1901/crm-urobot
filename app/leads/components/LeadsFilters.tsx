'use client';

import React, { useCallback } from 'react';
import { Search } from 'lucide-react';
import { FUENTE_FILTER_OPTIONS, CANAL_COLORS } from '@/types/canales-marketing';
import type { CanalMarketing } from '@/types/canales-marketing';

type FilterStatus = 'all' | 'nuevo' | 'interactuando' | 'contactado' | 'cita_propuesta' | 'cita_agendada' | 'perdido';

interface LeadsFiltersProps {
  currentFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  fuenteFilter: string;
  onFuenteChange: (value: string) => void;
}

// Constante fuera del componente para evitar re-creación
// Nota: "Convertidos" no aparece porque si ya son pacientes, NO son leads
const FILTERS: { id: FilterStatus; label: string }[] = [
  { id: 'all', label: 'TODOS' },
  { id: 'nuevo', label: 'NUEVOS' },
  { id: 'interactuando', label: 'INTERACTUANDO' },
  { id: 'contactado', label: 'CONTACTADOS' },
  { id: 'cita_propuesta', label: 'CITA OFRECIDA' },
  { id: 'cita_agendada', label: 'CITA AGENDADA' },
  { id: 'perdido', label: 'PERDIDOS' },
];

export const LeadsFilters = React.memo(function LeadsFilters({
  currentFilter,
  onFilterChange,
  searchValue,
  onSearchChange,
  fuenteFilter,
  onFuenteChange,
}: LeadsFiltersProps) {
  // Handler memoizado para el input
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value),
    [onSearchChange]
  );

  const handleFuenteChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => onFuenteChange(e.target.value),
    [onFuenteChange]
  );

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Buscador + Filtro de origen */}
      <div className="flex items-center gap-3 w-full flex-wrap sm:flex-nowrap">
        <div className="relative w-full sm:w-72">
          <label htmlFor="leads-search" className="sr-only">Buscar por nombre o teléfono...</label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden />
          <input
            id="leads-search"
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-3 py-2.5 bg-transparent border-b border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm transition-all"
            placeholder="Buscar por nombre o teléfono..."
          />
        </div>

        {/* Filtro de origen/fuente */}
        <div className="shrink-0">
          <label htmlFor="leads-fuente" className="sr-only">Filtrar por origen</label>
          <select
            id="leads-fuente"
            value={fuenteFilter}
            onChange={handleFuenteChange}
            className="h-9 px-3 pr-8 rounded-lg border border-border bg-secondary/30 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
          >
            {FUENTE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.value === '' ? '🔗 Origen: Todas' : opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Origen activo (chip visual) */}
      {fuenteFilter && (() => {
        const opt = FUENTE_FILTER_OPTIONS.find(o => o.value === fuenteFilter);
        if (!opt || !('canal' in opt)) return null;
        const canal = CANAL_COLORS[opt.canal as CanalMarketing];
        return (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Origen:</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-md ${canal.chip}`}>
              <span className="font-black text-[10px] leading-none">{canal.icon}</span>
              {opt.label}
            </span>
            <button
              onClick={() => onFuenteChange('')}
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
              aria-label="Limpiar filtro de origen"
            >
              ✕
            </button>
          </div>
        );
      })()}

      {/* Tabs de Filtros — horizontal scroll con touch targets grandes */}
      <div className="overflow-x-auto scrollbar-hide scroll-fade-x -mx-1 px-1" role="tablist" aria-label="Filtrar leads por estado">
        <div className="flex gap-1.5 sm:gap-2 py-0.5">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              role="tab"
              aria-selected={currentFilter === filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`
                px-3 sm:px-4 py-2 min-h-[36px] text-[11px] sm:text-xs font-bold rounded-full uppercase tracking-wider transition-all whitespace-nowrap border no-select
                ${currentFilter === filter.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                  : 'bg-transparent text-muted-foreground border-border hover:bg-muted/30 hover:text-foreground active:bg-muted/50'
                }
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});
