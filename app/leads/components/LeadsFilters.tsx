'use client';

import React from 'react';
import { Search } from 'lucide-react';

type FilterStatus = 'all' | 'Nuevo' | 'Interesado' | 'Convertido' | 'Descartado';

interface LeadsFiltersProps {
  currentFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export const LeadsFilters = React.memo(function LeadsFilters({
  currentFilter,
  onFilterChange,
  searchValue,
  onSearchChange,
}: LeadsFiltersProps) {
  const filters: { id: FilterStatus; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'Nuevo', label: 'Nuevos' },
    { id: 'Interesado', label: 'Interesados' },
    { id: 'Convertido', label: 'Convertidos' },
    { id: 'Descartado', label: 'Descartados' },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      {/* Tabs de Filtros */}
      <div className="flex p-1 bg-muted/50 rounded-lg border border-border overflow-x-auto no-scrollbar">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`
              px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all whitespace-nowrap
              ${currentFilter === filter.id
                ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }
            `}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Buscador */}
      <div className="relative w-full sm:w-64">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg leading-5 bg-muted/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
          placeholder="Buscar lead..."
        />
      </div>
    </div>
  );
});
