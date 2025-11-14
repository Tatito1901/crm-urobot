/**
 * ============================================================
 * FILTERS PANEL - Panel de filtros avanzados
 * ============================================================
 * Panel completo de filtros para la agenda médica
 */

'use client';

import React from 'react';
import { useAgendaState } from '../../hooks/useAgendaState';

const ESTADOS = [
  { value: 'Programada', label: 'Programada', color: 'blue-600' },
  { value: 'Confirmada', label: 'Confirmada', color: 'emerald-600' },
  { value: 'Completada', label: 'Completada', color: 'slate' },
  { value: 'Cancelada', label: 'Cancelada', color: 'red-600' },
  { value: 'Reagendada', label: 'Reagendada', color: 'amber-500' },
];

const TIPOS_CONSULTA = [
  { value: 'primera_vez', label: 'Primera vez' },
  { value: 'subsecuente', label: 'Subsecuente' },
  { value: 'control_post_op', label: 'Control post-op' },
  { value: 'urgencia', label: 'Urgencia' },
  { value: 'procedimiento_menor', label: 'Procedimiento menor' },
  { value: 'valoracion_prequirurgica', label: 'Valoración pre-quirúrgica' },
  { value: 'teleconsulta', label: 'Teleconsulta' },
];

const PRIORIDADES = [
  { value: 'normal', label: 'Normal', color: 'slate' },
  { value: 'alta', label: 'Alta', color: 'amber-500' },
  { value: 'urgente', label: 'Urgente', color: 'red-600' },
];

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

  const toggleEstado = (estado: string) => {
    setSelectedEstados(
      selectedEstados.includes(estado)
        ? selectedEstados.filter((e) => e !== estado)
        : [...selectedEstados, estado]
    );
  };

  const toggleTipo = (tipo: string) => {
    setSelectedTipos(
      selectedTipos.includes(tipo)
        ? selectedTipos.filter((t) => t !== tipo)
        : [...selectedTipos, tipo]
    );
  };

  const togglePrioridad = (prioridad: string) => {
    setSelectedPrioridades(
      selectedPrioridades.includes(prioridad)
        ? selectedPrioridades.filter((p) => p !== prioridad)
        : [...selectedPrioridades, prioridad]
    );
  };

  const activeFiltersCount =
    (selectedSede !== 'ALL' ? 1 : 0) +
    selectedEstados.length +
    selectedTipos.length +
    selectedPrioridades.length +
    (onlyToday ? 1 : 0) +
    (onlyPendingConfirmation ? 1 : 0);

  return (
    <div className="bg-slate-900/50 border-b border-slate-800 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <h3 className="text-sm font-semibold text-slate-300">
            Filtros
            {activeFiltersCount > 0 && (
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                {activeFiltersCount}
              </span>
            )}
          </h3>
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Grid de filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sede */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Sede</label>
          <div className="flex gap-2">
            {(['ALL', 'POLANCO', 'SATELITE'] as const).map((sede) => (
              <button
                key={sede}
                onClick={() => setSelectedSede(sede)}
                className={`
                  flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${
                    selectedSede === sede
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }
                `}
              >
                {sede === 'ALL' ? 'Todas' : sede}
              </button>
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
                className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="text-xs text-slate-300 group-hover:text-slate-200">Solo hoy</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={onlyPendingConfirmation}
                onChange={(e) => setOnlyPendingConfirmation(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="text-xs text-slate-300 group-hover:text-slate-200">
                Pendientes de confirmar
              </span>
            </label>
          </div>
        </div>

        {/* Estados */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Estado</label>
          <div className="flex flex-wrap gap-1.5">
            {ESTADOS.map((estado) => (
              <button
                key={estado.value}
                onClick={() => toggleEstado(estado.value)}
                className={`
                  px-2.5 py-1 rounded-lg text-xs font-medium transition-all
                  ${
                    selectedEstados.includes(estado.value)
                      ? estado.color === 'blue-600'
                        ? 'bg-blue-600 text-white'
                        : estado.color === 'emerald-600'
                        ? 'bg-emerald-600 text-white'
                        : estado.color === 'red-600'
                        ? 'bg-red-600 text-white'
                        : estado.color === 'amber-500'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }
                `}
              >
                {estado.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prioridad */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Prioridad</label>
          <div className="flex gap-2">
            {PRIORIDADES.map((prioridad) => (
              <button
                key={prioridad.value}
                onClick={() => togglePrioridad(prioridad.value)}
                className={`
                  flex-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all
                  ${
                    selectedPrioridades.includes(prioridad.value)
                      ? prioridad.color === 'red-600'
                        ? 'bg-red-600 text-white'
                        : prioridad.color === 'amber-500'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }
                `}
              >
                {prioridad.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tipo de consulta */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Tipo de consulta</label>
        <div className="flex flex-wrap gap-1.5">
          {TIPOS_CONSULTA.map((tipo) => (
            <button
              key={tipo.value}
              onClick={() => toggleTipo(tipo.value)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${
                  selectedTipos.includes(tipo.value)
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }
              `}
            >
              {tipo.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
