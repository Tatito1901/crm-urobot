/**
 * ============================================================
 * APPOINTMENT CARD - Tarjeta de cita mejorada
 * ============================================================
 */

import React from 'react';
import { Temporal } from '@js-temporal/polyfill';
import {
  formatTimeRange,
  formatLongDate,
  getTimeUntil,
  URGENCY_CONFIG,
  getShortName,
  getInitials
} from '../lib/agenda-utils';
import type { Consulta } from '@/types/consultas';

interface AppointmentCardProps {
  consulta: Consulta;
  onClick?: () => void;
  variant?: 'default' | 'compact';
}

export const AppointmentCard: React.FC<AppointmentCardProps> = React.memo(({
  consulta,
  onClick,
  variant = 'default'
}) => {
  const timezone = consulta.timezone ?? 'America/Mexico_City';
  const fechaConsulta = consulta.fechaConsulta ?? Temporal.Now.plainDateISO(timezone).toString();
  const horaConsulta = consulta.horaConsulta ?? '00:00:00';

  const fechaBase = Temporal.PlainDateTime.from(`${fechaConsulta}T${horaConsulta}`);
  const fechaInicio = fechaBase.toZonedDateTime(timezone);
  const fechaFin = fechaInicio.add({ minutes: consulta.duracionMinutos ?? 45 });

  const timeInfo = getTimeUntil(fechaInicio);
  const urgencyConfig = URGENCY_CONFIG[timeInfo.urgency];

  const nombrePaciente = getShortName(consulta.paciente);
  const iniciales = getInitials(consulta.paciente);
  const motivo = consulta.motivoConsulta ?? consulta.tipo ?? 'Consulta';

  if (variant === 'compact') {
    const estadoColor =
      consulta.estado === 'Confirmada' ? 'text-emerald-400' :
      consulta.estado === 'Programada' ? 'text-blue-400' :
      consulta.estado === 'Reagendada' ? 'text-amber-400' :
      'text-slate-400';

    return (
      <button
        onClick={onClick}
        className="w-full text-left rounded-lg border border-slate-800/50 bg-slate-900/30 px-3 py-2.5 transition-all hover:bg-slate-900/50 hover:border-slate-700"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Avatar */}
            <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700">
              {iniciales}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-100 truncate">{nombrePaciente}</p>
              <p className="text-xs text-slate-400 truncate">
                {formatTimeRange(fechaInicio, fechaFin)} · {consulta.sede}
              </p>
            </div>
          </div>

          {/* Badge minimalista */}
          <div className={`flex-shrink-0 text-xs font-medium ${estadoColor}`}>
            {consulta.estado === 'Confirmada' ? '✓' : consulta.estado === 'Cancelada' ? '✕' : '○'}
          </div>
        </div>
      </button>
    );
  }

  const estadoBorderColor =
    consulta.estado === 'Confirmada' ? 'border-l-emerald-500' :
    consulta.estado === 'Programada' ? 'border-l-blue-500' :
    consulta.estado === 'Reagendada' ? 'border-l-amber-500' :
    'border-l-slate-600';

  const estadoColor =
    consulta.estado === 'Confirmada' ? 'text-emerald-400' :
    consulta.estado === 'Programada' ? 'text-blue-400' :
    consulta.estado === 'Reagendada' ? 'text-amber-400' :
    'text-slate-400';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg border border-slate-800/60 ${estadoBorderColor} border-l-2 bg-slate-900/40 p-4 transition-all hover:bg-slate-900/60 hover:border-slate-700`}
    >
      {/* Header - Fecha y Hora */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-400">
            {timeInfo.isToday ? 'Hoy' : timeInfo.isTomorrow ? 'Mañana' : formatLongDate(fechaInicio)}
          </p>
          <p className="mt-0.5 text-base font-semibold text-slate-100">
            {formatTimeRange(fechaInicio, fechaFin)}
          </p>
        </div>

        {timeInfo.urgency !== 'normal' && timeInfo.urgency !== 'past' && (
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${urgencyConfig.badgeClass}`}>
            {timeInfo.text}
          </span>
        )}
      </div>

      {/* Paciente - Diseño limpio */}
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-medium text-slate-300 border border-slate-700">
          {iniciales}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium text-slate-100 truncate">{nombrePaciente}</p>
          <p className="text-sm text-slate-400 truncate">{motivo}</p>
        </div>
      </div>

      {/* Footer - Info y Estado */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-800/50 pt-3">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="font-medium">{consulta.sede}</span>
          {consulta.tipo && <span>·</span>}
          {consulta.tipo && <span>{consulta.tipo}</span>}
        </div>

        <span className={`text-xs font-medium ${estadoColor}`}>
          {consulta.estado}
        </span>
      </div>

      {/* Indicador de no confirmada - Más discreto */}
      {consulta.estado.toLowerCase() === 'programada' && !consulta.confirmadoPaciente && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-400/80">
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <p>Pendiente de confirmación</p>
        </div>
      )}
    </button>
  );
});

AppointmentCard.displayName = 'AppointmentCard';
