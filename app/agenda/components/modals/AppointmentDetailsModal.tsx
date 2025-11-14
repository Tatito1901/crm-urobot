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

interface AppointmentDetailsModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (id: string, updates: Partial<Appointment>) => Promise<any>;
  onCancel?: (id: string, reason: string, cancelledBy: string) => Promise<any>;
}

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onUpdate,
  onCancel,
}) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  if (!appointment) return null;

  const statusConfig = getStatusConfig(appointment.estado);

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Debe proporcionar un motivo de cancelación');
      return;
    }

    if (!onCancel) return;

    setIsCancelling(true);
    try {
      await onCancel(appointment.id, cancelReason, 'user');
      setShowCancelDialog(false);
      setCancelReason('');
      onClose();
    } catch (error) {
      alert('Error al cancelar la cita');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalles de Cita" size="lg">
      <div className="space-y-6">
        {/* Estado de la cita */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Estado</p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium ${statusConfig.bgClass} ${statusConfig.borderClass} border`}
              >
                <span>{statusConfig.icon}</span>
                <span className={statusConfig.textClass}>{statusConfig.label}</span>
              </span>
            </div>
          </div>

          {/* Prioridad */}
          {appointment.prioridad !== 'normal' && (
            <div>
              <p className="text-sm text-slate-400">Prioridad</p>
              <div className="mt-1">
                <span
                  className={`
                    inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium
                    ${
                      appointment.prioridad === 'urgente'
                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                        : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                    }
                    border
                  `}
                >
                  {appointment.prioridad === 'urgente' ? '🔴 Urgente' : '⚠️ Alta'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Información del paciente */}
        <div className="rounded-xl bg-slate-800/30 p-4">
          <h3 className="text-lg font-semibold text-slate-100 mb-3">Paciente</h3>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-slate-400">Nombre completo</p>
              <p className="text-base text-slate-100 font-medium">{appointment.paciente}</p>
            </div>
            {appointment.telefono && (
              <div>
                <p className="text-sm text-slate-400">Teléfono</p>
                <a
                  href={`tel:${appointment.telefono}`}
                  className="text-base text-blue-400 hover:text-blue-300"
                >
                  {appointment.telefono}
                </a>
              </div>
            )}
            {appointment.email && (
              <div>
                <p className="text-sm text-slate-400">Email</p>
                <a
                  href={`mailto:${appointment.email}`}
                  className="text-base text-blue-400 hover:text-blue-300"
                >
                  {appointment.email}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Información de la cita */}
        <div className="rounded-xl bg-slate-800/30 p-4">
          <h3 className="text-lg font-semibold text-slate-100 mb-3">Información de la Cita</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-400">Fecha</p>
              <p className="text-base text-slate-100">{formatLongDate(appointment.start)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Horario</p>
              <p className="text-base text-slate-100">
                {formatTimeRange(appointment.start, appointment.end)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Duración</p>
              <p className="text-base text-slate-100">{appointment.duracionMinutos} minutos</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Sede</p>
              <p className="text-base text-slate-100">{appointment.sede}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Tipo</p>
              <p className="text-base text-slate-100 capitalize">
                {appointment.tipo.replace(/_/g, ' ')}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Modalidad</p>
              <p className="text-base text-slate-100 capitalize">{appointment.modalidad}</p>
            </div>
          </div>

          {appointment.motivoConsulta && (
            <div className="mt-4">
              <p className="text-sm text-slate-400">Motivo de consulta</p>
              <p className="text-base text-slate-100 mt-1">{appointment.motivoConsulta}</p>
            </div>
          )}

          {appointment.notasInternas && (
            <div className="mt-4">
              <p className="text-sm text-slate-400">Notas internas</p>
              <p className="text-base text-slate-300 mt-1 bg-slate-800/50 p-3 rounded-lg">
                {appointment.notasInternas}
              </p>
            </div>
          )}
        </div>

        {/* Confirmación */}
        <div className="rounded-xl bg-slate-800/30 p-4">
          <h3 className="text-lg font-semibold text-slate-100 mb-3">Confirmación</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Estado de confirmación</span>
              <span
                className={`
                  inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
                  ${
                    appointment.confirmadoPaciente
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }
                `}
              >
                {appointment.confirmadoPaciente ? '✅ Confirmada' : '⏳ Pendiente'}
              </span>
            </div>
            {appointment.confirmadoEn && (
              <div>
                <p className="text-sm text-slate-400">Confirmada el</p>
                <p className="text-sm text-slate-300">
                  {new Date(appointment.confirmadoEn).toLocaleString('es-MX')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Google Calendar */}
        {appointment.calendarLink && (
          <div className="rounded-xl bg-slate-800/30 p-4">
            <h3 className="text-lg font-semibold text-slate-100 mb-3">Enlaces</h3>
            <a
              href={appointment.calendarLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" />
              </svg>
              Ver en Google Calendar
            </a>
          </div>
        )}

        {/* Información de cancelación (si aplica) */}
        {appointment.estado === 'Cancelada' && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4">
            <h3 className="text-lg font-semibold text-red-400 mb-3">Cita Cancelada</h3>
            {appointment.motivoCancelacion && (
              <div className="mb-2">
                <p className="text-sm text-slate-400">Motivo</p>
                <p className="text-base text-slate-300">{appointment.motivoCancelacion}</p>
              </div>
            )}
            {appointment.canceladoPor && (
              <div>
                <p className="text-sm text-slate-400">Cancelado por</p>
                <p className="text-base text-slate-300 capitalize">{appointment.canceladoPor}</p>
              </div>
            )}
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
          /* Botones de acción */
          <div className="flex gap-3 pt-4 border-t border-slate-800">
            {appointment.estado !== 'Cancelada' && (
              <>
                <button
                  onClick={() => setShowCancelDialog(true)}
                  className="flex-1 px-6 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Cancelar Cita
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  Cerrar
                </button>
              </>
            )}
            {appointment.estado === 'Cancelada' && (
              <button
                onClick={onClose}
                className="w-full px-6 py-3 rounded-xl bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors"
              >
                Cerrar
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
