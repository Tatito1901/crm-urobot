/**
 * ============================================================
 * APPOINTMENT TOOLTIP - Tooltip elegante para hover
 * ============================================================
 * Muestra información rápida al pasar el mouse sobre una cita
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Clock, MapPin, User, Calendar, Phone, Mail, FileText } from 'lucide-react';
import type { Appointment } from '@/types/agenda';
import { StatusBadge } from './StatusBadge';
import { SedeBadge } from './SedeBadge';
import type { EstadoConsulta } from '../../lib/constants';

interface AppointmentTooltipProps {
  appointment: Appointment;
  isVisible: boolean;
  x?: number;
  y?: number;
}

export const AppointmentTooltip: React.FC<AppointmentTooltipProps> = ({
  appointment,
  isVisible,
  x = 0,
  y = 0,
}) => {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShow(true), 400); // Delay slightly longer
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible]);

  if (!show || !mounted) return null;

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

  // Ajuste de posición para no salirse de la pantalla
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
  const tooltipWidth = 300;
  const effectiveX = x + tooltipWidth > screenWidth ? x - tooltipWidth - 10 : x + 10;
  const effectiveY = Math.max(10, Math.min(y, typeof window !== 'undefined' ? window.innerHeight - 200 : y));

  const content = (
    <div
      className="fixed z-[9999] pointer-events-none animate-in fade-in zoom-in-95 duration-150"
      style={{ left: effectiveX, top: effectiveY }}
    >
      <div className="bg-[#1a1e26] border border-slate-700 rounded-lg shadow-2xl min-w-[280px] max-w-[320px] overflow-hidden">
        {/* Header profesional */}
        <div className="bg-slate-900/80 p-3 border-b border-slate-700/50">
          <div className="flex items-start gap-3">
            {/* Avatar profesional */}
            <div className="flex-shrink-0 w-10 h-10 rounded-md bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-inner">
              <span className="text-sm font-bold text-white">
                {appointment.paciente
                  .split(' ')
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white truncate mb-1">
                {appointment.paciente}
              </h4>
              <div className="flex items-center gap-2">
                <StatusBadge 
                  estado={appointment.estado as EstadoConsulta} 
                  size="sm" 
                  showIcon={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Información principal */}
        <div className="p-3 space-y-3">
          {/* Fecha y hora */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <Calendar className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-slate-300 font-medium capitalize">
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
          <div className="border-t border-slate-700/50" />

          {/* Detalles */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
              {(appointment.sede === 'POLANCO' || appointment.sede === 'SATELITE') && (
                <SedeBadge sede={appointment.sede} size="sm" showIcon={false} />
              )}
            </div>

            {appointment.tipo && (
              <div className="flex items-center gap-2 text-xs">
                <User className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-slate-300 capitalize bg-slate-800 px-1.5 py-0.5 rounded">
                  {appointment.tipo.replace(/_/g, ' ')}
                </span>
              </div>
            )}

            {appointment.motivoConsulta && (
              <div className="flex items-start gap-2 text-xs bg-slate-800/50 p-2 rounded border border-slate-700/30">
                <FileText className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {appointment.motivoConsulta}
                </p>
              </div>
            )}
          </div>

          {/* Contacto rápido */}
          {(appointment.telefono || appointment.email) && (
            <>
              <div className="border-t border-slate-700/50" />
              <div className="space-y-1.5">
                {appointment.telefono && (
                  <div className="flex items-center gap-2 text-[11px]">
                    <Phone className="h-3 w-3 text-slate-500 flex-shrink-0" />
                    <span className="text-slate-400 font-mono hover:text-slate-300 transition-colors">
                      {appointment.telefono}
                    </span>
                  </div>
                )}
                {appointment.email && (
                  <div className="flex items-center gap-2 text-[11px]">
                    <Mail className="h-3 w-3 text-slate-500 flex-shrink-0" />
                    <span className="text-slate-400 truncate hover:text-slate-300 transition-colors">
                      {appointment.email}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
