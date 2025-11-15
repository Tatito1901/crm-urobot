/**
 * ============================================================
 * APPOINTMENT DETAILS MODAL - Modal de detalles de cita
 * ============================================================
 * Muestra información completa de una cita con opciones de edición
 */

'use client';

import React, { useState } from 'react';
import { Modal } from '../shared/Modal';
import { formatTimeRange, formatLongDate, getStatusConfig } from '../../lib/agenda-utils';
import type { Appointment } from '@/types/agenda';

interface ServiceResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

interface AppointmentDetailsModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (id: string, updates: Partial<Appointment>) => Promise<ServiceResponse>;
  onCancel?: (id: string, reason: string) => Promise<ServiceResponse>;
  onEdit?: (appointment: Appointment) => void;
  onConfirm?: (id: string) => Promise<ServiceResponse>;
}

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onCancel,
  onEdit,
  onConfirm,
}) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  if (!appointment) return null;

  const statusConfig = getStatusConfig(appointment.estado);

  // Color por sede - tonos profesionales
  const getSedeColor = () => {
    switch (appointment.sede) {
      case 'POLANCO':
        return { bg: 'bg-slate-800/50', border: 'border-blue-600/40', text: 'text-blue-300', accent: 'bg-blue-600' };
      case 'SATELITE':
        return { bg: 'bg-slate-800/50', border: 'border-emerald-600/40', text: 'text-emerald-300', accent: 'bg-emerald-600' };
      default:
        return { bg: 'bg-slate-800/50', border: 'border-slate-600/40', text: 'text-slate-300', accent: 'bg-slate-600' };
    }
  };
  
  const sedeColor = getSedeColor();

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Debe proporcionar un motivo de cancelación');
      return;
    }

    if (!onCancel) return;

    setIsCancelling(true);
    try {
      await onCancel(appointment.id, cancelReason);
      setShowCancelDialog(false);
      setCancelReason('');
      onClose();
    } catch {
      alert('Error al cancelar la cita');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleConfirm = async () => {
    if (!onConfirm) return;

    setIsConfirming(true);
    try {
      await onConfirm(appointment.id);
      onClose();
    } catch {
      alert('Error al confirmar la cita');
    } finally {
      setIsConfirming(false);
    }
  };

  // Generar iniciales del paciente
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="space-y-5">        
        {/* Header profesional con avatar */}
        <div className="relative">
          <div className={`rounded-xl border ${sedeColor.border} p-6 ${sedeColor.bg}`}>
            <div className="flex items-start gap-4">
              {/* Avatar con iniciales */}
              <div className={`flex-shrink-0 w-16 h-16 rounded-lg ${sedeColor.accent} flex items-center justify-center shadow-lg`}>
                <span className="text-2xl font-bold text-white">
                  {getInitials(appointment.paciente)}
                </span>
              </div>
              
              {/* Información del paciente */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1 truncate">
                      {appointment.paciente}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${statusConfig.bgClass} ${statusConfig.borderClass} border font-medium text-sm`}>
                        <span className="text-base">{statusConfig.icon}</span>
                        <span className={statusConfig.textClass}>{statusConfig.label}</span>
                      </span>
                      {!appointment.confirmadoPaciente && appointment.estado !== 'Cancelada' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-600 text-amber-900 font-medium text-sm">
                          <span className="w-2 h-2 bg-amber-600 rounded-full" />
                          Pendiente
                        </span>
                      )}
                      {appointment.prioridad !== 'normal' && (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-medium text-sm ${
                          appointment.prioridad === 'urgente'
                            ? 'bg-red-100 border-red-600 text-red-900'
                            : 'bg-orange-100 border-orange-600 text-orange-900'
                        }`}>
                          {appointment.prioridad === 'urgente' ? '!' : '!'}
                          {appointment.prioridad === 'urgente' ? 'Urgente' : 'Alta'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Fecha y hora en línea */}
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium text-slate-300">{formatLongDate(appointment.start)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-white">{formatTimeRange(appointment.start, appointment.end)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className={`font-medium ${sedeColor.text}`}>{appointment.sede}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Grid de información clave - diseño profesional */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="rounded-lg bg-slate-800/60 p-4 border border-slate-700">
            <p className="text-xs font-medium text-slate-400 mb-1">Tipo de consulta</p>
            <p className="text-sm font-semibold text-white capitalize">{appointment.tipo.replace(/_/g, ' ')}</p>
          </div>
          <div className="rounded-lg bg-slate-800/60 p-4 border border-slate-700">
            <p className="text-xs font-medium text-slate-400 mb-1">Modalidad</p>
            <p className="text-sm font-semibold text-white capitalize">{appointment.modalidad}</p>
          </div>
          <div className="rounded-lg bg-slate-800/60 p-4 border border-slate-700">
            <p className="text-xs font-medium text-slate-400 mb-1">Duración</p>
            <p className="text-sm font-semibold text-white">{appointment.duracionMinutos} minutos</p>
          </div>
        </div>

        {/* Acciones rápidas de contacto */}
        {(appointment.telefono || appointment.email) && (
          <div className="flex gap-2">
            {appointment.telefono && (
              <a
                href={`tel:${appointment.telefono}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-slate-200 hover:bg-slate-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-sm font-medium">Llamar</span>
              </a>
            )}
            {appointment.telefono && (
              <a
                href={`https://wa.me/${appointment.telefono?.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-slate-200 hover:bg-slate-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span className="text-sm font-medium">WhatsApp</span>
              </a>
            )}
            {appointment.email && (
              <a
                href={`mailto:${appointment.email}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-slate-200 hover:bg-slate-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Email</span>
              </a>
            )}
          </div>
        )}

        {/* Detalles adicionales */}
        {(appointment.motivoConsulta || appointment.notasInternas || appointment.modalidad !== 'presencial') && (
          <div className="rounded-lg bg-slate-800/30 border border-slate-700/50 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Detalles Adicionales
            </h3>

            {appointment.modalidad !== 'presencial' && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Modalidad</p>
                <p className="text-sm text-slate-200 capitalize">{appointment.modalidad}</p>
              </div>
            )}
            
            {appointment.motivoConsulta && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Motivo de consulta</p>
                <p className="text-sm text-slate-200">{appointment.motivoConsulta}</p>
              </div>
            )}

            {appointment.notasInternas && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Notas internas</p>
                <p className="text-sm text-slate-300 bg-slate-900/50 p-2.5 rounded border border-slate-700/30">
                  {appointment.notasInternas}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Confirmación (si está confirmada) */}
        {appointment.confirmadoPaciente && appointment.confirmadoEn && (
          <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3">
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Confirmada el {new Date(appointment.confirmadoEn).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}</span>
            </div>
          </div>
        )}

        {/* Google Calendar */}
        {appointment.calendarLink && (
          <a
            href={appointment.calendarLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 text-slate-300 hover:bg-slate-800/60 hover:border-slate-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" />
            </svg>
            <span className="text-sm font-medium">Ver en Google Calendar</span>
          </a>
        )}

        {/* Información de cancelación (si aplica) */}
        {appointment.estado === 'Cancelada' && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1 space-y-2">
                <h3 className="text-sm font-semibold text-red-400">Cita Cancelada</h3>
                {appointment.motivoCancelacion && (
                  <div>
                    <p className="text-xs text-slate-400">Motivo</p>
                    <p className="text-sm text-slate-300">{appointment.motivoCancelacion}</p>
                  </div>
                )}
                {appointment.canceladoPor && (
                  <div>
                    <p className="text-xs text-slate-400">Cancelado por</p>
                    <p className="text-sm text-slate-300 capitalize">{appointment.canceladoPor}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Diálogo de cancelación */}
        {showCancelDialog ? (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4">
            <h3 className="text-lg font-semibold text-red-400 mb-3">Cancelar Cita</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Motivo de cancelación <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ej: Solicitado por paciente, reagendamiento..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowCancelDialog(false);
                    setCancelReason('');
                  }}
                  disabled={isCancelling}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Volver
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isCancelling || !cancelReason.trim()}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCancelling ? 'Cancelando...' : 'Confirmar Cancelación'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Botones de acción - diseño moderno */
          <div className="space-y-3 pt-4 border-t border-slate-700/30">
            {/* Acciones rápidas - solo si no está cancelada */}
            {appointment.estado !== 'Cancelada' && (
              <div className="grid grid-cols-2 gap-3">
                {/* Confirmar cita */}
                {!appointment.confirmadoPaciente && onConfirm && (
                  <button
                    onClick={handleConfirm}
                    disabled={isConfirming}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-emerald-600 border border-emerald-700 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{isConfirming ? 'Confirmando...' : 'Confirmar Cita'}</span>
                  </button>
                )}

                {/* Editar cita */}
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit(appointment);
                      onClose();
                    }}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-slate-700 border border-slate-600 text-slate-200 hover:bg-slate-600 transition-colors font-medium"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Editar
                  </button>
                )}
              </div>
            )}

            {/* Botones principales - mejorados */}
            <div className="flex gap-3">
              {appointment.estado !== 'Cancelada' ? (
                <>
                  <button
                    onClick={() => setShowCancelDialog(true)}
                    className="flex-1 px-6 py-3 rounded-lg border border-red-700 bg-red-900/20 text-red-300 hover:bg-red-900/30 transition-colors font-medium"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancelar Cita
                    </div>
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Cerrar
                  </button>
                </>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors font-semibold"
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
