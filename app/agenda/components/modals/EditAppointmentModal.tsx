/**
 * ============================================================
 * EDIT APPOINTMENT MODAL - Modal para editar cita existente
 * ============================================================
 * Permite modificar todos los campos de una cita
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '../shared/Modal';
import { PatientSearch } from '../shared/PatientSearch';
import { formatShortTime } from '../../lib/agenda-utils';
import type { Appointment } from '@/types/agenda';
import type { Paciente } from '@/types/pacientes';

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

const DURACIONES = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1 hora 30 min' },
  { value: 120, label: '2 horas' },
];

export const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    tipo: 'primera_vez',
    motivoConsulta: '',
    duracionMinutos: 45,
    sede: 'POLANCO' as 'POLANCO' | 'SATELITE',
    modalidad: 'presencial' as 'presencial' | 'teleconsulta' | 'hibrida',
    prioridad: 'normal' as 'normal' | 'alta' | 'urgente',
    notasInternas: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Cargar datos de la cita cuando se abre el modal
  useEffect(() => {
    if (appointment && isOpen) {
      setFormData({
        patientId: appointment.pacienteId,
        patientName: appointment.paciente,
        tipo: appointment.tipo,
        motivoConsulta: appointment.motivoConsulta || '',
        duracionMinutos: appointment.duracionMinutos,
        sede: appointment.sede,
        modalidad: appointment.modalidad,
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
        duracionMinutos: formData.duracionMinutos,
        sede: formData.sede,
        modalidad: formData.modalidad,
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
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información de fecha/hora (no editable) */}
        <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-4">
          <div className="flex items-center gap-2 text-blue-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div>
              <p className="font-medium">{formattedDate}</p>
              <p className="text-sm">
                {startTime} - {endTime} • {appointment.sede}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            💡 Para cambiar fecha/hora, cancela y crea una nueva cita
          </p>
        </div>

        {/* Información del paciente (no editable) */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Paciente</label>
          <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700">
            <p className="text-sm text-slate-200 font-medium">{appointment.paciente}</p>
            {appointment.telefono && (
              <p className="text-xs text-slate-400 mt-1">{appointment.telefono}</p>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            💡 No se puede cambiar el paciente de una cita existente
          </p>
        </div>

        {/* Tipo de consulta */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Tipo de consulta <span className="text-red-400">*</span>
          </label>
          <select
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20"
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
          <label className="block text-sm font-medium text-slate-300 mb-2">Motivo de la consulta</label>
          <textarea
            value={formData.motivoConsulta}
            onChange={(e) => setFormData({ ...formData, motivoConsulta: e.target.value })}
            placeholder="Ej: Evaluación de próstata, dolor abdominal, etc."
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Duración */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Duración</label>
            <select
              value={formData.duracionMinutos}
              onChange={(e) => setFormData({ ...formData, duracionMinutos: parseInt(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20"
            >
              {DURACIONES.map((dur) => (
                <option key={dur.value} value={dur.value}>
                  {dur.label}
                </option>
              ))}
            </select>
          </div>

          {/* Modalidad */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Modalidad</label>
            <select
              value={formData.modalidad}
              onChange={(e) =>
                setFormData({ ...formData, modalidad: e.target.value as 'presencial' | 'teleconsulta' | 'hibrida' })
              }
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20"
            >
              <option value="presencial">Presencial</option>
              <option value="teleconsulta">Teleconsulta</option>
              <option value="hibrida">Híbrida</option>
            </select>
          </div>
        </div>

        {/* Prioridad */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Prioridad</label>
          <div className="flex gap-3">
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
                  flex-1 px-4 py-2.5 rounded-xl border transition-all
                  ${
                    formData.prioridad === priority.value
                      ? priority.color === 'red'
                        ? 'bg-red-600/10 border-red-600 text-red-400'
                        : priority.color === 'amber'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                        : 'bg-slate-500/10 border-slate-500 text-slate-300'
                      : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:border-slate-600'
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
          <label className="block text-sm font-medium text-slate-300 mb-2">Notas internas (opcional)</label>
          <textarea
            value={formData.notasInternas}
            onChange={(e) => setFormData({ ...formData, notasInternas: e.target.value })}
            placeholder="Notas privadas para el equipo médico..."
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
          />
        </div>

        {/* Error de submit */}
        {submitError && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4">
            <p className="text-sm text-red-400">{submitError}</p>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
