'use client';

import React, { useCallback } from 'react';
import { FUENTE_FILTER_OPTIONS, CANAL_COLORS } from '@/types/canales-marketing';
import { SearchInput } from '@/app/components/common/SearchInput';
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
  const handleFuenteChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => onFuenteChange(e.target.value),
    [onFuenteChange]
  );

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Buscador + Filtro de origen */}
      <div className="flex items-center gap-2 sm:gap-3 w-full flex-wrap sm:flex-nowrap">
        <div className="flex-1 min-w-0 sm:w-72 sm:flex-none">
          <SearchInput
            id="leads-search"
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Buscar por nombre o teléfono..."
            shortcut
          />
        </div>

        {/* Filtro de origen/fuente */}
        <div className="shrink-0">
          <label htmlFor="leads-fuente" className="sr-only">Filtrar por origen</label>
          <select
            id="leads-fuente"
            value={fuenteFilter}
            onChange={handleFuenteChange}
            className="h-9 px-3 pr-8 rounded-lg border border-border/50 bg-white/[0.03] text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-teal-500/20 focus:border-teal-500/30 transition-all cursor-pointer appearance-none hover:bg-white/[0.05] hover:border-border"
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
      <div className="overflow-x-auto scrollbar-hide scroll-fade-x -mx-1 px-1 momentum-scroll -mb-1" role="tablist" aria-label="Filtrar leads por estado">
        <div className="flex gap-1 sm:gap-2 py-0.5">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              role="tab"
              aria-selected={currentFilter === filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`
                px-3 sm:px-4 py-1.5 min-h-[36px] sm:min-h-[32px] text-[10px] sm:text-[11px] font-semibold rounded-full uppercase tracking-[0.08em] transition-all whitespace-nowrap border no-select
                ${currentFilter === filter.id
                  ? 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                  : 'bg-transparent text-muted-foreground/60 border-border/50 hover:bg-white/[0.03] hover:text-foreground hover:border-border active:bg-white/[0.05]'
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
