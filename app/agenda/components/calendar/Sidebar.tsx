/**
 * ============================================================
 * SIDEBAR UNIFICADO - Calendario + Citas del día
 * ============================================================
 * Sidebar limpio con solo lo esencial
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { MiniMonth } from './MiniMonth';
import { useConsultas } from '@/hooks/useConsultas';
import { isSameDay } from '@/lib/date-utils';
import type { Consulta } from '@/types/consultas';
import { useAgendaState } from '../../hooks/useAgendaState';
import { typography } from '@/app/lib/design-system';
import { StatusBadge } from '../shared/StatusBadge';
import { SedeBadge } from '../shared/SedeBadge';
import { FilterButton } from '../shared/FilterButton';
import { SEDES, getSedeConfig } from '../../lib/constants';
import type { EstadoConsulta, Sede } from '../../lib/constants';

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
  const { consultas, loading } = useConsultas();
  const { selectedSede, setSelectedSede, searchQuery } = useAgendaState();

  // Filtrar citas del día seleccionado por sede y búsqueda global
  const filteredAppointments = useMemo(() => {
    const dayAppointments = consultas.filter((apt) => {
      const aptDate = new Date(apt.fechaConsulta);
      if (!isSameDay(aptDate, selectedDate)) return false;
      if (selectedSede !== 'ALL' && apt.sede !== selectedSede) return false;
      
      // Aplicar búsqueda global
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matches = apt.paciente.toLowerCase().includes(query) ||
          apt.motivoConsulta?.toLowerCase().includes(query);
        if (!matches) return false;
      }
      
      return true;
    });
    
    return dayAppointments.sort((a, b) => 
      a.horaConsulta.localeCompare(b.horaConsulta)
    );
  }, [consultas, selectedDate, selectedSede, searchQuery]);

  // Configuración eliminada - ahora usa constantes centralizadas

  return (
    <aside className="w-[320px] h-full border-r-2 border-slate-700/50 bg-gradient-to-b from-slate-900/60 to-slate-950/60 backdrop-blur-sm flex flex-col shadow-xl shadow-black/20">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-800/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-400" />
            <h2 className={`${typography.sectionTitle} text-lg`}>Agenda Médica</h2>
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

        {/* Filtro de sedes - optimizado */}
        <div className="flex gap-2">
          {SEDES.map((sede) => (
            <FilterButton
              key={sede.value}
              label={sede.label}
              selected={selectedSede === sede.value}
              onClick={() => setSelectedSede(sede.value)}
              fullWidth
              size="md"
            />
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
            <h3 className={typography.cardTitleSmall}>
              {selectedDate.toLocaleDateString('es-MX', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </h3>
            <span className={`${typography.metadataSmall} font-medium`}>
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
              <p className={typography.body}>Sin citas programadas</p>
              {searchQuery && (
                <p className={`${typography.metadataSmall} mt-1`}>Intenta con otra búsqueda</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAppointments.map((apt) => {
                const sedeConfig = getSedeConfig(apt.sede);
                return (
                  <button
                    key={apt.id}
                    onClick={() => onAppointmentClick?.(apt)}
                    className={`w-full text-left p-3 rounded-xl bg-slate-900/80 border border-slate-700/70 border-l-[3px] shadow-sm shadow-black/40 hover:bg-slate-900 hover:border-slate-300/40 hover:shadow-md hover:shadow-black/60 transition-all group ${sedeConfig.borderLeftClass}`}
                  >
                    {/* Hora y Estado */}
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-base font-bold text-white tabular-nums">
                        {apt.horaConsulta.slice(0, 5)}
                      </span>
                      <StatusBadge estado={apt.estado as EstadoConsulta} size="sm" showIcon={false} />
                    </div>

                    {/* Paciente */}
                    <p className="text-base font-semibold text-slate-200 mb-2 group-hover:text-white transition-colors">
                      {apt.paciente}
                    </p>

                    {/* Tipo, sede y duración */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-slate-400 capitalize">
                        {apt.tipo.replace(/_/g, ' ')}
                      </span>
                      <span className="text-slate-600">•</span>
                      {(apt.sede === 'POLANCO' || apt.sede === 'SATELITE') && (
                        <SedeBadge sede={apt.sede} size="sm" showIcon={false} />
                      )}
                      {apt.duracionMinutos && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="text-xs text-slate-400 tabular-nums">
                            {apt.duracionMinutos}min
                          </span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
});
