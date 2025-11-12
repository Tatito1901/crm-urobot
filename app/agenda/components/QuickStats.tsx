/**
 * ============================================================
 * QUICK STATS - Estadísticas rápidas de la agenda
 * ============================================================
 */

import React from 'react';
import type { Consulta } from '@/types/consultas';
import { calculateStats } from '../lib/agenda-utils';

interface QuickStatsProps {
  consultas: Consulta[];
}

export const QuickStats: React.FC<QuickStatsProps> = React.memo(({ consultas }) => {
  const stats = calculateStats(consultas);

  const statCards = [
    {
      label: 'Total de Citas',
      value: stats.total,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      bgClass: 'bg-blue-500/15',
      textClass: 'text-blue-400',
    },
    {
      label: 'Confirmadas',
      value: stats.confirmadas,
      subtitle: `${stats.confirmationRate}% del total`,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgClass: 'bg-green-500/15',
      textClass: 'text-green-400',
    },
    {
      label: 'Programadas',
      value: stats.programadas,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgClass: 'bg-blue-500/15',
      textClass: 'text-blue-400',
    },
    {
      label: 'Canceladas',
      value: stats.canceladas,
      subtitle: `${stats.cancellationRate}% del total`,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgClass: 'bg-red-500/15',
      textClass: 'text-red-400',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Título */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Estado de la agenda</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-100">Resumen Rápido</h2>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="space-y-3">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition-all hover:bg-slate-900/60"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-100">{stat.value}</p>
                {stat.subtitle && (
                  <p className="mt-0.5 text-xs text-slate-400">{stat.subtitle}</p>
                )}
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.bgClass} ${stat.textClass}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Distribución por sede */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
          Distribución por Sede
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-400" />
              <span className="text-sm font-medium text-slate-300">Polanco</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-slate-100">{stats.polanco}</span>
              <span className="ml-1 text-xs text-slate-500">
                ({stats.total > 0 ? Math.round((stats.polanco / stats.total) * 100) : 0}%)
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyan-400" />
              <span className="text-sm font-medium text-slate-300">Satélite</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-slate-100">{stats.satelite}</span>
              <span className="ml-1 text-xs text-slate-500">
                ({stats.total > 0 ? Math.round((stats.satelite / stats.total) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Próximas 24 horas */}
      <div className="rounded-xl border border-blue-800 bg-blue-900/20 p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-blue-400">
          Próximas 24 Horas
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Citas programadas</span>
            <span className="text-lg font-bold text-blue-200">{stats.proximas24h}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Pendientes confirmar</span>
            <span className="text-lg font-bold text-yellow-200">{stats.pendientesConfirmar}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

QuickStats.displayName = 'QuickStats';
