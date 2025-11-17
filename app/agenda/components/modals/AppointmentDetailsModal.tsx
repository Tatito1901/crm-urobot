/**
 * ============================================================
 * APPOINTMENT DETAILS MODAL - Modal de detalles de cita
 * ============================================================
 * Muestra información completa de una cita con opciones de edición
 */

'use client';

import React, { useState } from 'react';
import { 
  Calendar, Clock, MapPin, User, Phone, Mail, FileText, 
  Edit2, X, Check, AlertCircle, ExternalLink, MessageSquare 
} from 'lucide-react';
import { Modal } from '../shared/Modal';
import { formatTimeRange, formatLongDate, getStatusConfig } from '../../lib/agenda-utils';
import { StatusBadge } from '../shared/StatusBadge';
import { SedeBadge } from '../shared/SedeBadge';
import type { Appointment } from '@/types/agenda';
import type { EstadoConsulta, Sede } from '../../lib/constants';

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
        {/* Header profesional */}
        <div className="bg-slate-900/50 border-b border-slate-700 -mx-6 -mt-6 px-6 py-5">
          <div className="flex items-start gap-4">
            {/* Avatar corporativo */}
            <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-white">
                {getInitials(appointment.paciente)}
              </span>
            </div>
            
            {/* Información principal */}
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-white mb-2.5">
                {appointment.paciente}
              </h2>
              
              {/* Badges profesionales */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <StatusBadge 
                  estado={appointment.estado as EstadoConsulta} 
                  size="md" 
                  showIcon={true}
                />
                {!appointment.confirmadoPaciente && appointment.estado !== 'Cancelada' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-600/20 border border-amber-600/30 text-amber-300 font-medium text-xs">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                    Sin confirmar
                  </span>
                )}
                {appointment.prioridad !== 'normal' && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border font-medium text-xs ${
                    appointment.prioridad === 'urgente'
                      ? 'bg-red-600/20 border-red-600/30 text-red-300'
                      : 'bg-orange-600/20 border-orange-600/30 text-orange-300'
                  }`}>
                    <AlertCircle className="w-3.5 h-3.5" />
                    {appointment.prioridad === 'urgente' ? 'Urgente' : 'Alta'}
                  </span>
                )}
              </div>
              
              {/* Información de fecha/hora limpia */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-slate-800/50 border border-slate-700">
                  <Calendar className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-xs font-medium text-slate-300">
                    {formatLongDate(appointment.start)}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-slate-800/50 border border-slate-700">
                  <Clock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-xs font-semibold text-white">
                    {formatTimeRange(appointment.start, appointment.end)}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-slate-800/50 border border-slate-700">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  {(appointment.sede === 'POLANCO' || appointment.sede === 'SATELITE') && (
                    <SedeBadge sede={appointment.sede} size="sm" showIcon={false} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Grid de información - diseño corporativo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg bg-slate-800/50 p-3.5 border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="flex items-start gap-2.5">
              <User className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-medium text-slate-500 mb-1">Tipo de consulta</p>
                <p className="text-sm font-semibold text-white capitalize">{appointment.tipo.replace(/_/g, ' ')}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-slate-800/50 p-3.5 border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="flex items-start gap-2.5">
              <FileText className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-medium text-slate-500 mb-1">Modalidad</p>
                <p className="text-sm font-semibold text-white capitalize">{appointment.modalidad}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-slate-800/50 p-3.5 border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-medium text-slate-500 mb-1">Duración</p>
                <p className="text-sm font-semibold text-white">{appointment.duracionMinutos} minutos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones de contacto - diseño corporativo */}
        {(appointment.telefono || appointment.email) && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {appointment.telefono && (
              <a
                href={`tel:${appointment.telefono}`}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-blue-600 hover:text-white transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span className="text-sm font-medium">Llamar</span>
              </a>
            )}
            {appointment.telefono && (
              <a
                href={`https://wa.me/${appointment.telefono?.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-blue-600 hover:text-white transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm font-medium">WhatsApp</span>
              </a>
            )}
            {appointment.email && (
              <a
                href={`mailto:${appointment.email}`}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-blue-600 hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4" />
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
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-blue-600 hover:text-white transition-colors"
          >
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">Ver en Google Calendar</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
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
          /* Botones de acción - diseño corporativo */
          <div className="space-y-3 pt-4 border-t border-slate-700">
            {/* Acciones rápidas - solo si no está cancelada */}
            {appointment.estado !== 'Cancelada' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Confirmar cita */}
                {!appointment.confirmadoPaciente && onConfirm && (
                  <button
                    onClick={handleConfirm}
                    disabled={isConfirming}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 border border-blue-700 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <Check className="h-4 w-4" />
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
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-slate-200 hover:bg-slate-600 hover:border-slate-500 transition-colors font-medium"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Editar Cita</span>
                  </button>
                )}
              </div>
            )}

            {/* Botones principales */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              {appointment.estado !== 'Cancelada' ? (
                <>
                  <button
                    onClick={() => setShowCancelDialog(true)}
                    className="flex-1 px-5 py-2.5 rounded-lg border border-red-700 bg-red-900/20 text-red-300 hover:bg-red-900/30 hover:border-red-600 transition-colors font-medium"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <X className="h-4 w-4" />
                      <span>Cancelar Cita</span>
                    </div>
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 px-5 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-slate-200 hover:bg-slate-600 transition-colors font-medium"
                  >
                    Cerrar
                  </button>
                </>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full px-5 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-slate-200 hover:bg-slate-600 transition-colors font-medium"
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
