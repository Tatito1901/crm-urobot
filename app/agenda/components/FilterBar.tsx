/**
 * ============================================================
 * FILTER BAR - Barra de búsqueda y filtros avanzados
 * ============================================================
 */

import React, { useState, useCallback } from 'react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSede: 'ALL' | 'POLANCO' | 'SATELITE';
  onSedeChange: (sede: 'ALL' | 'POLANCO' | 'SATELITE') => void;
  selectedEstados: string[];
  onEstadosChange: (estados: string[]) => void;
  onlyToday: boolean;
  onOnlyTodayChange: (value: boolean) => void;
  onlyPendingConfirmation: boolean;
  onOnlyPendingConfirmationChange: (value: boolean) => void;
  totalResults: number;
}

const ESTADOS = [
  { value: 'programada', label: 'Programada', color: 'blue' },
  { value: 'confirmada', label: 'Confirmada', color: 'green' },
  { value: 'reagendada', label: 'Reagendada', color: 'yellow' },
  { value: 'cancelada', label: 'Cancelada', color: 'red' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedSede,
  onSedeChange,
  selectedEstados,
  onEstadosChange,
  onlyToday,
  onOnlyTodayChange,
  onlyPendingConfirmation,
  onOnlyPendingConfirmationChange,
  totalResults,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleEstadoToggle = useCallback((estado: string) => {
    if (selectedEstados.includes(estado)) {
      onEstadosChange(selectedEstados.filter(e => e !== estado));
    } else {
      onEstadosChange([...selectedEstados, estado]);
    }
  }, [selectedEstados, onEstadosChange]);

  const hasActiveFilters =
    selectedSede !== 'ALL' ||
    selectedEstados.length > 0 ||
    onlyToday ||
    onlyPendingConfirmation;

  const clearAllFilters = () => {
    onSedeChange('ALL');
    onEstadosChange([]);
    onOnlyTodayChange(false);
    onOnlyPendingConfirmationChange(false);
    onSearchChange('');
  };

  return (
    <div className="space-y-3">
      {/* Barra principal de búsqueda */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Campo de búsqueda */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre de paciente..."
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Botón de filtros */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
            hasActiveFilters
              ? 'border-blue-500 bg-blue-500/10 text-blue-100'
              : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-600'
          }`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros
          {hasActiveFilters && (
            <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-bold text-white">
              {[
                selectedSede !== 'ALL' ? 1 : 0,
                selectedEstados.length,
                onlyToday ? 1 : 0,
                onlyPendingConfirmation ? 1 : 0,
              ].reduce((a, b) => a + b, 0)}
            </span>
          )}
        </button>

        {/* Contador de resultados */}
        <div className="hidden sm:block rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm font-medium text-slate-300">
          {totalResults} {totalResults === 1 ? 'resultado' : 'resultados'}
        </div>
      </div>

      {/* Panel de filtros expandible */}
      {showFilters && (
        <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">Filtros avanzados</h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-medium text-blue-400 hover:text-blue-300"
              >
                Limpiar todo
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Filtro de sede */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400">
                Sede
              </label>
              <div className="space-y-2">
                {['ALL', 'POLANCO', 'SATELITE'].map((sede) => (
                  <button
                    key={sede}
                    onClick={() => onSedeChange(sede as typeof selectedSede)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-all ${
                      selectedSede === sede
                        ? 'border-blue-500 bg-blue-500/10 text-blue-100'
                        : 'border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {sede === 'ALL' ? 'Todas las sedes' : sede}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro de estados */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400">
                Estados
              </label>
              <div className="space-y-2">
                {ESTADOS.map((estado) => {
                  const isSelected = selectedEstados.includes(estado.value);

                  // Clases específicas por estado (necesario para Tailwind - no soporta interpolación)
                  const stateClasses = {
                    blue: isSelected ? 'border-blue-500 bg-blue-500/10 text-blue-100' : '',
                    green: isSelected ? 'border-green-500 bg-green-500/10 text-green-100' : '',
                    yellow: isSelected ? 'border-yellow-500 bg-yellow-500/10 text-yellow-100' : '',
                    red: isSelected ? 'border-red-500 bg-red-500/10 text-red-100' : '',
                  };

                  const baseClass = isSelected
                    ? stateClasses[estado.color as keyof typeof stateClasses]
                    : 'border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-600';

                  return (
                    <button
                      key={estado.value}
                      onClick={() => handleEstadoToggle(estado.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-all ${baseClass}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{estado.label}</span>
                        {isSelected && (
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filtros rápidos */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400">
                Filtros rápidos
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => onOnlyTodayChange(!onlyToday)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-all ${
                    onlyToday
                      ? 'border-blue-500 bg-blue-500/10 text-blue-100'
                      : 'border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Solo citas de hoy</span>
                    {onlyToday && (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => onOnlyPendingConfirmationChange(!onlyPendingConfirmation)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-all ${
                    onlyPendingConfirmation
                      ? 'border-yellow-500 bg-yellow-500/10 text-yellow-100'
                      : 'border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Pendientes de confirmar</span>
                    {onlyPendingConfirmation && (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contador de resultados mobile */}
      <div className="sm:hidden rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-center text-sm font-medium text-slate-300">
        {totalResults} {totalResults === 1 ? 'resultado' : 'resultados'}
      </div>
    </div>
  );
};
