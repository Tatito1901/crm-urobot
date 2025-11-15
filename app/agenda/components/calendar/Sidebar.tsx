/**
 * ============================================================
 * SIDEBAR UNIFICADO - Calendario + Citas del día
 * ============================================================
 * Sidebar limpio con solo lo esencial
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, Search, Plus, X } from 'lucide-react';
import { MiniMonth } from './MiniMonth';
import { useConsultas } from '@/hooks/useConsultas';
import { isSameDay } from '@/lib/date-utils';
import type { Consulta } from '@/types/consultas';
import { useAgendaState } from '../../hooks/useAgendaState';

interface SidebarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onCreateAppointment?: () => void;
  onAppointmentClick?: (consulta: Consulta) => void;
}

export const Sidebar = React.memo(function Sidebar({ 
  selectedDate, 
  onDateSelect,
  onCreateAppointment,
  onAppointmentClick 
}: SidebarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const { consultas, loading } = useConsultas();
  const { selectedSede, setSelectedSede } = useAgendaState();

  const todayAppointments = useMemo(() => {
    return consultas
      .filter((apt) => {
        const aptDate = new Date(apt.fechaConsulta);
        if (!isSameDay(aptDate, selectedDate)) return false;
        if (selectedSede !== 'ALL' && apt.sede !== selectedSede) return false;
        return true;
      })
      .sort((a, b) => {
        return a.horaConsulta.localeCompare(b.horaConsulta);
      });
  }, [consultas, selectedDate, selectedSede]);

  // Filtrar por búsqueda
  const filteredAppointments = useMemo(() => {
    if (!searchQuery.trim()) return todayAppointments;
    const query = searchQuery.toLowerCase();
    return todayAppointments.filter(apt =>
      apt.paciente.toLowerCase().includes(query) ||
      apt.motivoConsulta?.toLowerCase().includes(query)
    );
  }, [todayAppointments, searchQuery]);

  // Determinar color del estado
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Confirmada': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Programada': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Cancelada': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  // Color por sede
  const getSedeColor = (sede: string) => {
    switch (sede) {
      case 'POLANCO': return 'border-l-blue-500';
      case 'SATELITE': return 'border-l-emerald-500';
      default: return 'border-l-slate-500';
    }
  };

  return (
    <aside className="w-[320px] h-full border-r border-slate-800/40 bg-gradient-to-b from-slate-900/60 to-slate-950/60 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-800/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Agenda Médica</h2>
          </div>
          {onCreateAppointment && (
            <button
              onClick={onCreateAppointment}
              className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
              title="Nueva cita"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar paciente..."
            className="w-full pl-9 pr-9 py-2 bg-slate-800/60 border border-slate-700/60 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          {(['ALL', 'POLANCO', 'SATELITE'] as const).map((sede) => (
            <button
              key={sede}
              onClick={() => setSelectedSede(sede)}
              className={`flex-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                selectedSede === sede
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {sede === 'ALL' ? 'Todas las sedes' : sede}
            </button>
          ))}
        </div>
      </div>

      {/* Mini calendario */}
      <div className="border-b border-slate-800/40">
        <MiniMonth
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
        />
      </div>

      {/* Lista de citas del día */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-300">
              {selectedDate.toLocaleDateString('es-MX', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </h3>
            <span className="text-xs font-medium text-slate-400">
              {filteredAppointments.length} {filteredAppointments.length === 1 ? 'cita' : 'citas'}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent" />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400">
                {searchQuery ? 'No se encontraron citas' : 'Sin citas programadas'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAppointments.map((apt) => (
                <button
                  key={apt.id}
                  onClick={() => onAppointmentClick?.(apt)}
                  className={`w-full text-left p-2.5 rounded-lg bg-slate-900/80 border border-slate-700/70 border-l-[3px] shadow-sm shadow-black/40 hover:bg-slate-900 hover:border-slate-300/40 hover:shadow-md hover:shadow-black/60 transition-all group ${getSedeColor(apt.sede)}`}
                >
                  {/* Hora */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">
                      {apt.horaConsulta.slice(0, 5)}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getStatusColor(apt.estado)}`}>
                      {apt.estado}
                    </span>
                  </div>

                  {/* Paciente */}
                  <p className="text-sm font-semibold text-slate-200 mb-1 group-hover:text-white transition-colors">
                    {apt.paciente}
                  </p>

                  {/* Tipo y sede */}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="capitalize">{apt.tipo.replace(/_/g, ' ')}</span>
                    <span>•</span>
                    <span>{apt.sede}</span>
                    {apt.duracionMinutos && (
                      <>
                        <span>•</span>
                        <span>{apt.duracionMinutos}min</span>
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
});
