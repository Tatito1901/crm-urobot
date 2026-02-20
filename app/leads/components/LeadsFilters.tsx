'use client';

import React, { useCallback } from 'react';
import { Search } from 'lucide-react';

type FilterStatus = 'all' | 'nuevo' | 'interactuando' | 'contactado' | 'cita_propuesta' | 'cita_agendada' | 'perdido';

interface LeadsFiltersProps {
  currentFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
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
}: LeadsFiltersProps) {
  // Handler memoizado para el input
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value),
    [onSearchChange]
  );

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Buscador */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
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
      </div>

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
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
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
