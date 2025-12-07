'use client';

import React, { useCallback } from 'react';
import { Search } from 'lucide-react';

type FilterStatus = 'all' | 'Nuevo' | 'Contactado' | 'Interesado' | 'Convertido' | 'Descartado';

interface LeadsFiltersProps {
  currentFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

// Constante fuera del componente para evitar re-creación
const FILTERS: { id: FilterStatus; label: string }[] = [
  { id: 'all', label: 'Activos' },
  { id: 'Nuevo', label: 'Nuevos' },
  { id: 'Contactado', label: 'Contactados' },
  { id: 'Interesado', label: 'Interesados' },
  { id: 'Convertido', label: 'Convertidos' },
  { id: 'Descartado', label: 'Descartados' },
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
    <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Tabs de Filtros */}
      <div className="flex-shrink-0 overflow-x-auto no-scrollbar">
        <div className="inline-flex p-1 bg-muted/50 rounded-lg border border-border">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap
                ${currentFilter === filter.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Buscador */}
      <div className="relative w-full sm:w-56 sm:flex-shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={searchValue}
          onChange={handleSearchChange}
          className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-muted/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm transition-all"
          placeholder="Buscar lead..."
        />
      </div>
    </div>
  );
});
