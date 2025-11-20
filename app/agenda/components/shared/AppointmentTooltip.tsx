/**
 * ============================================================
 * APPOINTMENT TOOLTIP - Tooltip elegante para hover
 * ============================================================
 * Muestra información rápida al pasar el mouse sobre una cita
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Clock, MapPin, User, Calendar, Phone, Mail, FileText } from 'lucide-react';
import type { Appointment } from '@/types/agenda';
import { StatusBadge } from './StatusBadge';
import { SedeBadge } from './SedeBadge';
import type { EstadoConsulta } from '../../lib/constants';

interface AppointmentTooltipProps {
  appointment: Appointment;
  isVisible: boolean;
  position?: 'right' | 'left' | 'top' | 'bottom';
}

export const AppointmentTooltip: React.FC<AppointmentTooltipProps> = ({
  appointment,
  isVisible,
  position = 'right',
}) => {
  const [show, setShow] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShow(true), 150); // Delay reducido
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible]);

  if (!show) return null;

  const startTime = appointment.start.toPlainTime().toString().slice(0, 5);
  const endTime = appointment.end.toPlainTime().toString().slice(0, 5);
  
  const formatDate = () => {
    const date = appointment.start.toPlainDate();
    return date.toLocaleString('es-MX', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const positionClasses = {
    right: 'left-full ml-2 top-0',
    left: 'right-full mr-2 top-0',
    top: 'bottom-full mb-2 left-0',
    bottom: 'top-full mt-2 left-0',
  };

  return (
    <div
      ref={tooltipRef}
      className={`
        absolute ${positionClasses[position]} z-[100]
        pointer-events-none
        animate-in fade-in slide-in-from-left-1 duration-200
      `}
    >
      {/* Flecha decorativa */}
      {position === 'right' && (
        <div className="absolute left-0 top-4 -translate-x-1 w-2 h-2 rotate-45 bg-slate-800 border-l border-t border-slate-600" />
      )}
      
      {/* Contenido del tooltip */}
      <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-xl shadow-black/40 min-w-[280px] max-w-[320px] overflow-hidden">
        {/* Header profesional */}
        <div className="bg-slate-900/50 p-4 border-b border-slate-700">
          <div className="flex items-start gap-3">
            {/* Avatar profesional */}
            <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
              <span className="text-base font-bold text-white">
                {appointment.paciente
                  .split(' ')
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white truncate mb-1.5">
                {appointment.paciente}
              </h4>
              <div className="flex items-center gap-2">
                <StatusBadge 
                  estado={appointment.estado as EstadoConsulta} 
                  size="sm" 
                  showIcon={false}
                />
                {!appointment.confirmadoPaciente && appointment.estado !== 'Cancelada' && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-600/20 text-amber-300 text-[10px] font-medium border border-amber-600/30">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                    Sin confirmar
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Información principal */}
        <div className="p-3.5 space-y-2.5">
          {/* Fecha y hora */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <Calendar className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-slate-300 font-medium">
                {formatDate()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Clock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-white font-semibold">
                {startTime} - {endTime}
              </span>
              <span className="text-slate-500 text-[10px]">
                ({appointment.duracionMinutos} min)
              </span>
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-slate-700" />

          {/* Detalles */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
              {(appointment.sede === 'POLANCO' || appointment.sede === 'SATELITE') && (
                <SedeBadge sede={appointment.sede} size="sm" showIcon={false} />
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <User className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-slate-300 capitalize">
                {appointment.tipo.replace(/_/g, ' ')}
              </span>
            </div>

            {appointment.motivoConsulta && (
              <div className="flex items-start gap-2 text-xs">
                <FileText className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">
                  {appointment.motivoConsulta}
                </p>
              </div>
            )}
          </div>

          {/* Contacto rápido */}
          {(appointment.telefono || appointment.email) && (
            <>
              <div className="border-t border-slate-700" />
              <div className="space-y-1">
                {appointment.telefono && (
                  <div className="flex items-center gap-2 text-[11px]">
                    <Phone className="h-3 w-3 text-slate-500 flex-shrink-0" />
                    <span className="text-slate-400 font-mono">
                      {appointment.telefono}
                    </span>
                  </div>
                )}
                {appointment.email && (
                  <div className="flex items-center gap-2 text-[11px]">
                    <Mail className="h-3 w-3 text-slate-500 flex-shrink-0" />
                    <span className="text-slate-400 truncate">
                      {appointment.email}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer discreto */}
        <div className="bg-slate-900 px-3 py-1.5 border-t border-slate-700">
          <p className="text-[10px] text-slate-500 text-center">
            Clic para más detalles
          </p>
        </div>
      </div>
    </div>
  );
};
