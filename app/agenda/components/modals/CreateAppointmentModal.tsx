/**
 * ============================================================
 * CREATE APPOINTMENT MODAL - Modal para crear nueva cita
 * ============================================================
 * Modal con formulario completo para agendar una nueva consulta
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '../shared/Modal';
import { PatientSearch } from '../shared/PatientSearch';
import { useAppointmentForm } from '../../hooks/useAppointmentForm';
import { formatShortTime } from '../../lib/agenda-utils';
import { createPatient } from '../../services/patients-service';
import type { TimeSlot } from '@/types/agenda';
import type { CreateAppointmentData } from '../../services/appointments-service';
import type { Paciente } from '@/types/pacientes';

interface CreateAppointmentModalProps {
  slot: TimeSlot | null;
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: Omit<CreateAppointmentData, 'slotId' | 'start' | 'end' | 'timezone'>) => Promise<{ success: boolean; error?: string }>;
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

export const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({
  slot,
  isOpen,
  onClose,
  onCreate,
}) => {
  const [newPatientData, setNewPatientData] = useState<{
    nombre: string;
    telefono: string;
    email: string;
  } | null>(null);
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);

  const {
    formData,
    errors,
    touched,
    isSubmitting,
    submitError,
    isValid,
    updateField,
    touchField,
    handleSubmit,
    reset,
  } = useAppointmentForm({
    initialSlot: slot || undefined,
    onSubmit: async (data) => {
      if (!slot) {
        throw new Error('No hay slot seleccionado');
      }

      // Si hay datos de nuevo paciente, crear primero el paciente
      if (newPatientData && newPatientData.nombre && newPatientData.telefono) {
        setIsCreatingPatient(true);
        try {
          const patientResult = await createPatient({
            nombre: newPatientData.nombre,
            telefono: newPatientData.telefono,
            email: newPatientData.email,
          });

          if (!patientResult.success || !patientResult.data) {
            throw new Error(patientResult.error || 'Error al crear el paciente');
          }

          // Actualizar el formulario con el ID del paciente creado
          data.patientId = patientResult.data.id;
          data.patientName = patientResult.data.nombre;
        } catch (error) {
          setIsCreatingPatient(false);
          throw error;
        }
        setIsCreatingPatient(false);
      }

      const result = await onCreate(data);

      if (!result.success) {
        throw new Error(result.error || 'Error al crear la cita');
      }

      // Si fue exitoso, cerrar modal y resetear
      setNewPatientData(null);
      onClose();
      reset();
    },
  });

  // Resetear formulario cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      reset();
      setNewPatientData(null);
    }
  }, [isOpen, reset]);

  // Actualizar sede cuando cambia el slot
  useEffect(() => {
    if (slot) {
      updateField('sede', slot.sede);
    }
  }, [slot, updateField]);

  if (!slot) return null;

  // Formatear información del slot
  const slotDate = slot.start.toPlainDate();
  const slotStartTime = formatShortTime(slot.start);
  const slotEndTime = formatShortTime(slot.end);

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = [
    'ene',
    'feb',
    'mar',
    'abr',
    'may',
    'jun',
    'jul',
    'ago',
    'sep',
    'oct',
    'nov',
    'dic',
  ];

  const formattedDate = `${dayNames[slotDate.dayOfWeek % 7]} ${slotDate.day} ${
    monthNames[slotDate.month - 1]
  } ${slotDate.year}`;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Cita" size="lg">
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Información del slot seleccionado */}
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
                {slotStartTime} - {slotEndTime} • {slot.sede}
              </p>
            </div>
          </div>
        </div>

        {/* Selección de paciente */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Paciente <span className="text-red-400">*</span>
          </label>
          <PatientSearch
            onSelect={(patient: Paciente | null) => {
              if (patient?.id) {
                updateField('patientId', patient.id);
                updateField('patientName', patient.nombre);
                setNewPatientData(null);
              } else {
                // Limpiar selección
                updateField('patientId', '');
                updateField('patientName', '');
              }
            }}
            onNewPatientData={(data: { nombre: string; telefono: string; email: string }) => {
              setNewPatientData(data);
              updateField('patientId', 'new-patient');
              updateField('patientName', data.nombre);
            }}
            selectedPatientId={formData.patientId === 'new-patient' ? undefined : formData.patientId}
            newPatientData={newPatientData}
            error={errors.patient}
            touched={touched.patientName}
          />
        </div>

        {/* Tipo de consulta */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Tipo de consulta <span className="text-red-400">*</span>
          </label>
          <select
            value={formData.tipo}
            onChange={(e) => updateField('tipo', e.target.value)}
            onBlur={() => touchField('tipo')}
            className={`
              w-full px-4 py-2.5 rounded-xl
              bg-slate-800/50 border text-slate-100
              focus:outline-none focus:ring-2
              ${
                touched.tipo && errors.tipo
                  ? 'border-red-500 focus:ring-red-500/20'
                  : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'
              }
            `}
          >
            {TIPOS_CONSULTA.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
          {touched.tipo && errors.tipo && (
            <p className="mt-1 text-sm text-red-400">{errors.tipo}</p>
          )}
        </div>

        {/* Motivo de consulta */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Motivo de la consulta
          </label>
          <textarea
            value={formData.motivoConsulta}
            onChange={(e) => updateField('motivoConsulta', e.target.value)}
            onBlur={() => touchField('motivoConsulta')}
            placeholder="Ej: Evaluación de próstata, dolor abdominal, etc."
            rows={3}
            className={`
              w-full px-4 py-2.5 rounded-xl
              bg-slate-800/50 border text-slate-100
              placeholder-slate-500
              focus:outline-none focus:ring-2
              resize-none
              ${
                touched.motivoConsulta && errors.motivoConsulta
                  ? 'border-red-500 focus:ring-red-500/20'
                  : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'
              }
            `}
          />
          {touched.motivoConsulta && errors.motivoConsulta && (
            <p className="mt-1 text-sm text-red-400">{errors.motivoConsulta}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Duración */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Duración</label>
            <select
              value={formData.duracionMinutos}
              onChange={(e) => updateField('duracionMinutos', parseInt(e.target.value))}
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
                updateField('modalidad', e.target.value as 'presencial' | 'teleconsulta')
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
              { value: 'alta', label: 'Alta', color: 'yellow' },
              { value: 'urgente', label: 'Urgente', color: 'red' },
            ].map((priority) => (
              <button
                key={priority.value}
                type="button"
                onClick={() =>
                  updateField('prioridad', priority.value as 'normal' | 'alta' | 'urgente')
                }
                className={`
                  flex-1 px-4 py-2.5 rounded-xl border transition-all
                  ${
                    formData.prioridad === priority.value
                      ? priority.color === 'red'
                        ? 'bg-red-600/10 border-red-600 text-red-400'
                        : priority.color === 'yellow'
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
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Notas internas (opcional)
          </label>
          <textarea
            value={formData.notasInternas}
            onChange={(e) => updateField('notasInternas', e.target.value)}
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
            disabled={isSubmitting || !isValid || isCreatingPatient}
            className="flex-1 px-6 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isCreatingPatient
              ? 'Creando paciente...'
              : isSubmitting
              ? 'Guardando...'
              : newPatientData
              ? 'Crear paciente y cita'
              : 'Guardar Cita'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
