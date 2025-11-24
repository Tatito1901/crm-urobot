/**
 * ============================================================
 * EDIT APPOINTMENT MODAL - Modal para editar cita existente
 * ============================================================
 * Permite modificar todos los campos de una cita
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '../shared/Modal';
import { formatShortTime } from '../../lib/agenda-utils';
import type { Appointment } from '@/types/agenda';
import type { ConsultaTipo } from '@/types/consultas';

interface EditAppointmentModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Appointment>) => Promise<{ success: boolean; error?: string }>;
}

const TIPOS_CONSULTA = [
  { value: 'primera_vez', label: 'Primera vez' },
  { value: 'subsecuente', label: 'Subsecuente' },
  { value: 'control_post_op', label: 'Control post-operatorio' },
  { value: 'urgencia', label: 'Urgencia' },
  { value: 'procedimiento_menor', label: 'Procedimiento menor' },
  { value: 'valoracion_prequirurgica', label: 'Valoración prequirúrgica' },
  { value: 'teleconsulta', label: 'Teleconsulta' },
];

export const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    tipo: 'primera_vez' as ConsultaTipo,
    motivoConsulta: '',
    prioridad: 'normal' as 'normal' | 'alta' | 'urgente',
    notasInternas: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Cargar datos de la cita cuando se abre el modal
  useEffect(() => {
    if (appointment && isOpen) {
      setFormData({
        tipo: appointment.tipo || 'primera_vez',
        motivoConsulta: appointment.motivoConsulta || '',
        prioridad: appointment.prioridad,
        notasInternas: appointment.notasInternas || '',
      });
    }
  }, [appointment, isOpen]);

  // Resetear formulario cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setSubmitError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!appointment) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const updates: Partial<Appointment> = {
        tipo: formData.tipo,
        motivoConsulta: formData.motivoConsulta,
        prioridad: formData.prioridad,
        notasInternas: formData.notasInternas,
      };

      const result = await onUpdate(appointment.id, updates);

      if (!result.success) {
        throw new Error(result.error || 'Error al actualizar la cita');
      }

      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!appointment) return null;

  // Formatear información de fecha/hora
  const startDate = appointment.start.toPlainDate();
  const startTime = formatShortTime(appointment.start);
  const endTime = formatShortTime(appointment.end);

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  const formattedDate = `${dayNames[startDate.dayOfWeek % 7]} ${startDate.day} ${
    monthNames[startDate.month - 1]
  } ${startDate.year}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Cita" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Información de la cita (solo lectura) */}
        <div className="rounded-md bg-slate-800/20 border border-slate-700/50 p-3.5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Información de la cita</h3>
          <div className="grid grid-cols-2 gap-2.5 text-sm">
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Fecha y hora</p>
              <p className="text-slate-200 font-semibold text-sm">{formattedDate}</p>
              <p className="text-slate-400 text-xs">{startTime} - {endTime}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Sede</p>
              <p className="text-slate-200 font-semibold text-sm">{appointment.sede}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Duración</p>
              <p className="text-slate-200 font-semibold text-sm">{appointment.duracionMinutos} min</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Modalidad</p>
              <p className="text-slate-200 font-semibold text-sm capitalize">{appointment.modalidad}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Para cambiar fecha, hora, sede o duración, cancela y crea una nueva cita
          </p>
        </div>

        {/* Información del paciente (no editable) */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Paciente</label>
          <div className="p-3 rounded-md bg-slate-800/20 border border-slate-700/50">
            <p className="text-sm text-slate-200 font-semibold">{appointment.paciente}</p>
            {appointment.telefono && (
              <p className="text-xs text-slate-500 mt-1">{appointment.telefono}</p>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            No se puede cambiar el paciente de una cita existente
          </p>
        </div>

        {/* Tipo de consulta */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Tipo de consulta <span className="text-red-400">*</span>
          </label>
          <select
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value as ConsultaTipo })}
            className="w-full px-3.5 py-2.5 rounded-md bg-[#0f1115] border border-slate-700 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
          >
            {TIPOS_CONSULTA.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>

        {/* Motivo de consulta */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Motivo de la consulta</label>
          <textarea
            value={formData.motivoConsulta}
            onChange={(e) => setFormData({ ...formData, motivoConsulta: e.target.value })}
            placeholder="Ej: Evaluación de próstata, dolor abdominal, etc."
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-md bg-[#0f1115] border border-slate-700 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500/20 resize-none transition-colors"
          />
        </div>

        {/* Prioridad */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Prioridad</label>
          <div className="flex gap-2">
            {[
              { value: 'normal', label: 'Normal', color: 'slate' },
              { value: 'alta', label: 'Alta', color: 'amber' },
              { value: 'urgente', label: 'Urgente', color: 'red' },
            ].map((priority) => (
              <button
                key={priority.value}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, prioridad: priority.value as 'normal' | 'alta' | 'urgente' })
                }
                className={`
                  flex-1 px-3 py-2 rounded-md border text-sm font-medium transition-all
                  ${
                    formData.prioridad === priority.value
                      ? priority.color === 'red'
                        ? 'bg-red-500/10 border-red-500/50 text-red-400'
                        : priority.color === 'amber'
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-500'
                        : 'bg-slate-700/50 border-slate-600 text-slate-200'
                      : 'bg-transparent border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400'
                  }
                `}
              >
                {priority.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notas internas */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Notas internas (opcional)</label>
          <textarea
            value={formData.notasInternas}
            onChange={(e) => setFormData({ ...formData, notasInternas: e.target.value })}
            placeholder="Notas privadas para el equipo médico..."
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-md bg-[#0f1115] border border-slate-700 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500/20 resize-none transition-colors"
          />
        </div>

        {/* Error de submit */}
        {submitError && (
          <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3.5 flex items-start gap-3">
            <svg className="h-5 w-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-400 font-medium">{submitError}</p>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 pt-5 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 rounded-md border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
