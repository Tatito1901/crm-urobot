/**
 * ============================================================
 * FILTERS PANEL - Panel de filtros avanzados
 * ============================================================
 * Panel completo de filtros para la agenda médica
 */

'use client';

import React from 'react';
import { Filter } from 'lucide-react';
import { useAgendaState } from '../../hooks/useAgendaState';
import { FilterButton } from '../shared/FilterButton';
import { ESTADOS, TIPOS_CONSULTA, PRIORIDADES, SEDES } from '../../lib/constants';

export const FiltersPanel: React.FC = () => {
  const {
    selectedSede,
    setSelectedSede,
    selectedEstados,
    setSelectedEstados,
    selectedTipos,
    setSelectedTipos,
    selectedPrioridades,
    setSelectedPrioridades,
    onlyToday,
    setOnlyToday,
    onlyPendingConfirmation,
    setOnlyPendingConfirmation,
    resetFilters,
    showFilters,
  } = useAgendaState();

  if (!showFilters) return null;

  const toggleItem = (current: string[], item: string, setter: (items: string[]) => void) => {
    setter(current.includes(item) ? current.filter(i => i !== item) : [...current, item]);
  };

  const activeFiltersCount =
    (selectedSede !== 'ALL' ? 1 : 0) +
    selectedEstados.length +
    selectedTipos.length +
    selectedPrioridades.length +
    (onlyToday ? 1 : 0) +
    (onlyPendingConfirmation ? 1 : 0);

  return (
    <div className="bg-gradient-to-b from-slate-900/70 to-slate-900/50 border-b border-slate-700/40 p-4 md:p-5 space-y-4 backdrop-blur-sm">
      {/* Header - mejorado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Filtros
            {activeFiltersCount > 0 && (
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium">
                {activeFiltersCount}
              </span>
            )}
          </h3>
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-xs text-foreground transition-colors font-medium"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* Grid de filtros - optimizado para mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Sede - usando FilterButton */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Sede</label>
          <div className="flex gap-2">
            {SEDES.map((sede) => (
              <FilterButton
                key={sede.value}
                label={sede.label}
                selected={selectedSede === sede.value}
                onClick={() => setSelectedSede(sede.value)}
                fullWidth
              />
            ))}
          </div>
        </div>

        {/* Filtros rápidos */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Filtros rápidos</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={onlyToday}
                onChange={(e) => setOnlyToday(e.target.checked)}
                className="rounded border-border text-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="text-xs text-slate-300 group-hover:text-slate-200">Solo hoy</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={onlyPendingConfirmation}
                onChange={(e) => setOnlyPendingConfirmation(e.target.checked)}
                className="rounded border-border text-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="text-xs text-slate-300 group-hover:text-slate-200">
                Pendientes de confirmar
              </span>
            </label>
          </div>
        </div>

        {/* Estados - simplificado */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Estado</label>
          <div className="flex flex-wrap gap-1.5">
            {ESTADOS.slice(0, 5).map((estado) => (
              <FilterButton
                key={estado.value}
                label={estado.label}
                selected={selectedEstados.includes(estado.value)}
                onClick={() => toggleItem(selectedEstados, estado.value, setSelectedEstados)}
                variant="colored"
                color={estado.color}
                size="sm"
              />
            ))}
          </div>
        </div>

        {/* Prioridad - simplificado */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Prioridad</label>
          <div className="flex gap-2">
            {PRIORIDADES.map((prioridad) => (
              <FilterButton
                key={prioridad.value}
                label={prioridad.label}
                selected={selectedPrioridades.includes(prioridad.value)}
                onClick={() => toggleItem(selectedPrioridades, prioridad.value, setSelectedPrioridades)}
                variant="colored"
                color={prioridad.color}
                fullWidth
                size="sm"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tipo de consulta - optimizado */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Tipo de consulta</label>
        <div className="flex flex-wrap gap-1.5">
          {TIPOS_CONSULTA.map((tipo) => (
            <FilterButton
              key={tipo.value}
              label={tipo.label}
              selected={selectedTipos.includes(tipo.value)}
              onClick={() => toggleItem(selectedTipos, tipo.value, setSelectedTipos)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
