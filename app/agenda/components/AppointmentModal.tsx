/**
 * ============================================================
 * APPOINTMENT MODAL - Modal con detalles completos de cita
 * ============================================================
 */

import React, { useEffect } from 'react';
import { Temporal } from '@js-temporal/polyfill';
import { StatusBadge } from './StatusBadge';
import {
  formatTimeRange,
  formatLongDate,
  getInitials
} from '../lib/agenda-utils';
import type { Consulta } from '@/types/consultas';

interface AppointmentModalProps {
  consulta: Consulta | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  consulta,
  isOpen,
  onClose
}) => {
  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !consulta) return null;

  const timezone = consulta.timezone ?? 'America/Mexico_City';
  const fechaConsulta = consulta.fechaConsulta ?? Temporal.Now.plainDateISO(timezone).toString();
  const horaConsulta = consulta.horaConsulta ?? '00:00:00';

  const fechaBase = Temporal.PlainDateTime.from(`${fechaConsulta}T${horaConsulta}`);
  const fechaInicio = fechaBase.toZonedDateTime(timezone);
  const fechaFin = fechaInicio.add({ minutes: consulta.duracionMinutos ?? 45 });

  const iniciales = getInitials(consulta.paciente);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Cerrar modal"
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-[#0d1118] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-[#0d1118]/95 backdrop-blur-sm px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-100">Detalles de la Cita</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
            aria-label="Cerrar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Paciente */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-bold text-white shadow-lg">
              {iniciales}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-100">{consulta.paciente}</h3>
              <p className="text-sm text-slate-400">ID: {consulta.pacienteId ?? 'N/A'}</p>
            </div>
          </div>

          {/* Información principal */}
          <div className="mb-6 space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Fecha y hora</p>
                <p className="mt-1 text-base font-semibold text-slate-100">{formatLongDate(fechaInicio)}</p>
                <p className="text-sm text-slate-300">{formatTimeRange(fechaInicio, fechaFin)} ({consulta.duracionMinutos} minutos)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Sede</p>
                <p className="mt-1 text-base font-semibold text-slate-100">{consulta.sede}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Estado</p>
                <div className="mt-1">
                  <StatusBadge status={consulta.estado} />
                </div>
                {consulta.confirmadoPaciente ? (
                  <p className="mt-1 text-xs text-green-400">✓ Confirmada por el paciente</p>
                ) : (
                  <p className="mt-1 text-xs text-yellow-400">⏳ Pendiente de confirmación</p>
                )}
              </div>
            </div>
          </div>

          {/* Detalles de la consulta */}
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Detalles de la Consulta</h4>
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-5">
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Tipo de cita:</span>
                <span className="text-sm font-medium text-slate-100">{consulta.tipo ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Motivo:</span>
                <span className="text-sm font-medium text-slate-100 text-right max-w-xs truncate">
                  {consulta.motivoConsulta ?? 'No especificado'}
                </span>
              </div>
              {consulta.canalOrigen && (
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Canal de origen:</span>
                  <span className="text-sm font-medium text-slate-100">{consulta.canalOrigen}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Estado de confirmación:</span>
                <span className="text-sm font-medium text-slate-100">{consulta.estadoConfirmacion}</span>
              </div>
            </div>
          </div>

          {/* Información de calendario */}
          {(consulta.calendarEventId || consulta.calendarLink) && (
            <div className="mb-6">
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Google Calendar</h4>
              <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                {consulta.calendarEventId && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">Event ID:</span>
                    <span className="text-xs font-mono text-slate-300">{consulta.calendarEventId}</span>
                  </div>
                )}
                {consulta.calendarLink && (
                  <a
                    href={consulta.calendarLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                  >
                    Abrir en Google Calendar
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Información de cancelación */}
          {consulta.estado.toLowerCase() === 'cancelada' && (consulta.motivoCancelacion || consulta.canceladoPor) && (
            <div className="mb-6">
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-red-400">Información de Cancelación</h4>
              <div className="space-y-3 rounded-xl border border-red-800 bg-red-900/20 p-5">
                {consulta.canceladoPor && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">Cancelada por:</span>
                    <span className="text-sm font-medium text-slate-100">{consulta.canceladoPor}</span>
                  </div>
                )}
                {consulta.motivoCancelacion && (
                  <div>
                    <span className="text-sm text-slate-400">Motivo:</span>
                    <p className="mt-1 text-sm text-slate-100">{consulta.motivoCancelacion}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t border-slate-800 pt-4">
            <p className="text-xs text-slate-500">
              Creado: {new Date(consulta.createdAt).toLocaleString('es-MX')}
            </p>
            <p className="text-xs text-slate-500">
              Actualizado: {new Date(consulta.updatedAt).toLocaleString('es-MX')}
            </p>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="sticky bottom-0 border-t border-slate-800 bg-[#0d1118]/95 backdrop-blur-sm px-6 py-4">
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-700">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Llamar
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-700">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-blue-500/60 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-200 transition-colors hover:bg-blue-500/20">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
