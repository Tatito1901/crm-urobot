/**
 * ============================================================
 * SIDEBAR - Barra lateral con mini-calendario y enlaces
 * ============================================================
 * Ancho fijo 280px con mini-calendario y acciones rápidas
 */

'use client';

import React, { useState } from 'react';
import { Clock, Lock, ChevronDown, ChevronRight } from 'lucide-react';
import { MiniMonth } from './MiniMonth';

interface SidebarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const Sidebar = React.memo(function Sidebar({ selectedDate, onDateSelect }: SidebarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showTodayVisits, setShowTodayVisits] = useState(false);
  const [showServices, setShowServices] = useState(false);

  return (
    <aside className="w-[280px] h-full border-r border-slate-800/60 bg-slate-900/40 flex flex-col">
      {/* Mini calendario */}
      <MiniMonth
        selectedDate={selectedDate}
        onDateSelect={onDateSelect}
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
      />

      {/* Separador */}
      <div className="h-px bg-slate-800/60 my-2" />

      {/* Enlaces de acción */}
      <div className="px-4 py-3 space-y-2">
        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-emerald-400 hover:bg-slate-800/60 rounded transition-colors">
          <Clock className="h-4 w-4" />
          <span className="font-medium">Lista de espera</span>
        </button>

        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-emerald-400 hover:bg-slate-800/60 rounded transition-colors">
          <Lock className="h-4 w-4" />
          <span className="font-medium">Bloquear fechas</span>
        </button>
      </div>

      {/* Separador */}
      <div className="h-px bg-slate-800/60 my-2" />

      {/* Secciones desplegables */}
      <div className="px-4 py-2 space-y-1">
        {/* Visitas de hoy */}
        <button
          onClick={() => setShowTodayVisits(!showTodayVisits)}
          className="w-full flex items-center justify-between px-2 py-2 text-sm hover:bg-slate-800/60 rounded transition-colors"
        >
          <span className="font-medium text-slate-200">Visitas de hoy</span>
          {showTodayVisits ? (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
        </button>
        {showTodayVisits && (
          <div className="px-4 py-3 text-xs text-slate-400">
            Sin visitas programadas
          </div>
        )}

        {/* Servicios */}
        <button
          onClick={() => setShowServices(!showServices)}
          className="w-full flex items-center justify-between px-2 py-2 text-sm hover:bg-slate-800/60 rounded transition-colors"
        >
          <span className="font-medium text-slate-200">Servicios</span>
          {showServices ? (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
        </button>
        {showServices && (
          <div className="px-4 py-3 text-xs text-slate-400">
            Sin servicios configurados
          </div>
        )}
      </div>
    </aside>
  );
});
