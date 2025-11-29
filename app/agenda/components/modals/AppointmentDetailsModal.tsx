/**
 * ============================================================
 * APPOINTMENT DETAILS MODAL - Modal de detalles de cita
 * ============================================================
 * Muestra información completa de una cita con opciones de edición
 * Diseño optimizado estilo Google Calendar / Linear
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Clock, Phone, Mail, FileText, 
  Edit2, X, Check, AlertCircle, ExternalLink,
  Trash2, MessageCircle, ShieldAlert, UserCheck
} from 'lucide-react';
import { Modal } from '../shared/Modal';
import { formatTimeRange, formatLongDate } from '../../lib/agenda-utils';
import { StatusBadge } from '../shared/StatusBadge';
import { SedeBadge } from '../shared/SedeBadge';
import type { Appointment } from '@/types/agenda';
import type { EstadoConsulta } from '../../lib/constants';
import { cn } from '@/lib/utils';

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
  onPatientArrived?: (id: string) => Promise<ServiceResponse>;
}

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onCancel,
  onEdit,
  onConfirm,
  onPatientArrived,
}) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isMarkingArrived, setIsMarkingArrived] = useState(false);

  if (!appointment) return null;

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

  const handlePatientArrived = async () => {
    if (!onPatientArrived) return;

    setIsMarkingArrived(true);
    try {
      const result = await onPatientArrived(appointment.id);
      if (result.success) {
        onClose();
      } else {
        alert(result.error || 'Error al marcar llegada del paciente');
      }
    } catch {
      alert('Error al marcar llegada del paciente');
    } finally {
      setIsMarkingArrived(false);
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

  // Calcular tiempo relativo
  const getRelativeTime = () => {
    const now = new Date();
    const start = new Date(appointment.start.toString());
    const diffMs = start.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMs < 0) return 'Pasada';
    if (diffDays === 0) return `En ${diffHours} horas`;
    if (diffDays === 1) return 'Mañana';
    return `En ${diffDays} días`;
  };

  // Verificar si la cita es de hoy (robusto con timezone México)
  const isToday = () => {
    // Fecha actual en México (YYYY-MM-DD)
    const mexicoToday = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
    
    // Fecha de la cita en México
    const aptDateObj = new Date(appointment.start.toString());
    const aptDateMexico = aptDateObj.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
    
    return mexicoToday === aptDateMexico;
  };

  const isCancelled = appointment.estado === 'Cancelada';
  const isCompleted = appointment.estado === 'Completada';
  
  // Puede marcar llegada: cita confirmada, de hoy, no cancelada ni completada
  const canMarkArrived = appointment.confirmadoPaciente && isToday() && !isCancelled && !isCompleted;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="relative">
        {/* Toolbar Superior (Acciones) */}
        <div className="absolute top-0 right-0 flex items-center gap-1 z-10">
          {!isCancelled && onEdit && (
            <button
              onClick={() => {
                onEdit(appointment);
                onClose();
              }}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Editar cita"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {!isCancelled && (
            <button
              onClick={() => setShowCancelDialog(true)}
              className="p-2 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
              title="Cancelar cita"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 pr-8">
          {/* Header: Título y Estado */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {/* Avatar / Iniciales */}
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg",
                isCancelled ? "bg-slate-700 text-slate-400" : "bg-blue-600 text-white shadow-blue-500/20"
              )}>
                {getInitials(appointment.paciente)}
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={cn(
                    "text-xl font-bold",
                    isCancelled ? "text-slate-400 line-through" : "text-white"
                  )}>
                    {appointment.paciente}
                  </h2>
                  <Link 
                    href={`/pacientes/${appointment.pacienteId}`}
                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-all group"
                    title="Ir al expediente completo"
                  >
                    <ExternalLink className="w-4 h-4 " />
                  </Link>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="capitalize">{appointment.tipo}</span>
                  <span>•</span>
                  <span className={cn(
                    "font-medium",
                    getRelativeTime() === 'Pasada' ? "text-slate-500" : "text-emerald-400"
                  )}>
                    {getRelativeTime()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge 
                estado={appointment.estado as EstadoConsulta} 
                size="sm" 
                showIcon={true}
              />
              <SedeBadge sede={appointment.sede} size="sm" />
              
              {/* Badge Confirmación */}
              {appointment.confirmadoPaciente ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                  <Check className="w-3 h-3" />
                  Confirmada
                </span>
              ) : !isCancelled && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                  <AlertCircle className="w-3 h-3" />
                  Pendiente
                </span>
              )}

              {/* Prioridad */}
              {appointment.prioridad !== 'normal' && (
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium",
                  appointment.prioridad === 'urgente' 
                    ? "bg-red-500/10 border-red-500/20 text-red-400" 
                    : "bg-orange-500/10 border-orange-500/20 text-orange-400"
                )}>
                  <ShieldAlert className="w-3 h-3" />
                  {appointment.prioridad.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Body: Información Estructurada (Grid con iconos laterales) */}
          <div className="grid gap-6">
            
            {/* Fecha y Hora */}
            <div className="flex gap-4 group">
              <div className="w-8 flex justify-center pt-0.5">
                <Clock className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-base">
                  {formatLongDate(appointment.start)}
                </p>
                <p className="text-slate-400 text-sm">
                  {formatTimeRange(appointment.start, appointment.end)} ({appointment.duracionMinutos} min)
                </p>
                {appointment.calendarLink && (
                  <a 
                    href={appointment.calendarLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-xs text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    Ver en Google Calendar <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Contacto */}
            {(appointment.telefono || appointment.email) && (
              <div className="flex gap-4 group">
                <div className="w-8 flex justify-center pt-0.5">
                  <Phone className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap gap-3">
                    {appointment.telefono && (
                      <>
                        <a
                          href={`https://wa.me/${appointment.telefono.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-600/10 border border-emerald-600/20 text-emerald-400 hover:bg-emerald-600/20 transition-colors text-sm font-medium"
                        >
                          <MessageCircle className="w-4 h-4" />
                          WhatsApp
                        </a>
                        <a
                          href={`tel:${appointment.telefono}`}
                          className="flex items-center gap-2 px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium"
                        >
                          <Phone className="w-4 h-4" />
                          Llamar
                        </a>
                      </>
                    )}
                    {appointment.email && (
                      <a
                        href={`mailto:${appointment.email}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium"
                      >
                        <Mail className="w-4 h-4" />
                        Email
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Detalles y Motivo */}
            {(appointment.motivoConsulta || appointment.notasInternas) && (
              <div className="flex gap-4 group">
                <div className="w-8 flex justify-center pt-0.5">
                  <FileText className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors" />
                </div>
                <div className="flex-1 space-y-4">
                  {appointment.motivoConsulta && (
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Motivo</h4>
                      <p className="text-slate-200 text-sm leading-relaxed bg-slate-800/30 p-3 rounded-lg border border-slate-800">
                        {appointment.motivoConsulta}
                      </p>
                    </div>
                  )}
                  {appointment.notasInternas && (
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Notas Internas</h4>
                      <div className="text-slate-300 text-sm bg-yellow-500/5 border border-yellow-500/10 p-3 rounded-lg flex gap-3">
                        <AlertCircle className="w-4 h-4 text-yellow-500/50 flex-shrink-0 mt-0.5" />
                        {appointment.notasInternas}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Estado de Cancelación */}
            {isCancelled && (
              <div className="flex gap-4">
                <div className="w-8 flex justify-center pt-0.5">
                  <X className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1 bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-red-400 mb-1">Cita Cancelada</h4>
                  {appointment.motivoCancelacion && (
                    <p className="text-red-300/80 text-sm">{appointment.motivoCancelacion}</p>
                  )}
                  {appointment.canceladoPor && (
                    <p className="text-red-300/60 text-xs mt-2">
                      Cancelado por: <span className="capitalize">{appointment.canceladoPor}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Acciones Principales (Footer Sticky) */}
        {!showCancelDialog && !isCancelled && !isCompleted && (
          <div className="mt-8 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
             {/* Botón Paciente Llegó - Solo para citas confirmadas de hoy */}
             {canMarkArrived && onPatientArrived && (
              <button
                onClick={handlePatientArrived}
                disabled={isMarkingArrived}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed order-1"
              >
                <UserCheck className="w-4 h-4" />
                {isMarkingArrived ? 'Registrando...' : 'Paciente Llegó'}
              </button>
             )}
             {/* Botón Confirmar Cita - Solo si no está confirmada */}
             {!appointment.confirmadoPaciente && onConfirm && (
              <button
                onClick={handleConfirm}
                disabled={isConfirming}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed order-2"
              >
                <Check className="w-4 h-4" />
                {isConfirming ? 'Confirmando...' : 'Confirmar Cita'}
              </button>
             )}
             <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 border border-slate-700 active:scale-95 transition-all order-3"
             >
              Cerrar
             </button>
          </div>
        )}

        {/* Diálogo de Cancelación (Overlay) */}
        {showCancelDialog && (
          <div className="mt-6 bg-slate-900/50 border border-red-500/20 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
            <h3 className="text-red-400 font-medium flex items-center gap-2 mb-3">
              <Trash2 className="w-4 h-4" />
              Confirmar Cancelación
            </h3>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Indica el motivo de la cancelación..."
              className="w-full bg-slate-950 border border-slate-700 rounded-md p-3 text-sm text-white placeholder-slate-500 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 outline-none resize-none h-24 mb-3"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCancelDialog(false)}
                disabled={isCancelling}
                className="px-3 py-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors"
              >
                Volver
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling || !cancelReason.trim()}
                className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-500 shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isCancelling ? 'Cancelando...' : 'Cancelar Cita'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
