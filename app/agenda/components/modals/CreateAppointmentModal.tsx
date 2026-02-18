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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAppointmentForm } from '../../hooks/useAppointmentForm';
import { formatShortTime } from '../../lib/agenda-utils';
import { createPatient } from '../../services/patients-service';
import { invalidateDomain } from '@/lib/swr-config';
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
          data.patientName = patientResult.data.nombre || 'Paciente';
          // Invalidar caches de pacientes y leads (patients-service actualiza lead asociado)
          invalidateDomain('pacientes');
          invalidateDomain('leads');
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
      <form onSubmit={handleFormSubmit} className="space-y-5">
        {/* Información del slot seleccionado */}
        <div className="rounded-md bg-primary/5 border border-primary/20 p-3.5">
          <div className="flex items-center gap-3 text-primary">
            <div className="p-2 rounded-full bg-primary/10">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-primary">{formattedDate}</p>
              <p className="text-sm text-primary/80 font-medium">
                {slotStartTime} - {slotEndTime} • {slot.sede}
              </p>
            </div>
          </div>
        </div>

        {/* Selección de paciente */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Paciente <span className="text-destructive">*</span>
          </label>
          <PatientSearch
            onSelect={(patient: Paciente | null) => {
              if (patient?.id) {
                updateField('patientId', patient.id);
                updateField('patientName', patient.nombre || '');
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
            error={errors.patientId}
            touched={touched.patientName}
          />
        </div>

        {/* Tipo de consulta */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Tipo de consulta <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.tipo}
            onValueChange={(value) => updateField('tipo', value)}
          >
            <SelectTrigger className={touched.tipo && errors.tipo ? 'border-destructive' : ''}>
              <SelectValue placeholder="Seleccionar tipo..." />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_CONSULTA.map((tipo) => (
                <SelectItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {touched.tipo && errors.tipo && (
            <p className="text-xs text-destructive font-medium">{errors.tipo}</p>
          )}
        </div>

        {/* Motivo de consulta */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Motivo de la consulta
          </Label>
          <Textarea
            value={formData.motivoConsulta}
            onChange={(e) => updateField('motivoConsulta', e.target.value)}
            onBlur={() => touchField('motivoConsulta')}
            placeholder="Ej: Evaluación de próstata, dolor abdominal, etc."
            rows={3}
            className={touched.motivoConsulta && errors.motivoConsulta ? 'border-destructive' : ''}
          />
          {touched.motivoConsulta && errors.motivoConsulta && (
            <p className="text-xs text-destructive font-medium">{errors.motivoConsulta}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-5">
          {/* Duración */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Duración</Label>
            <Select
              value={formData.duracionMinutos.toString()}
              onValueChange={(value) => updateField('duracionMinutos', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Duración" />
              </SelectTrigger>
              <SelectContent>
                {DURACIONES.map((dur) => (
                  <SelectItem key={dur.value} value={dur.value.toString()}>
                    {dur.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Modalidad */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Modalidad</Label>
            <Select
              value={formData.modalidad}
              onValueChange={(value) => updateField('modalidad', value as 'presencial' | 'teleconsulta')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Modalidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="presencial">Presencial</SelectItem>
                <SelectItem value="teleconsulta">Teleconsulta</SelectItem>
                <SelectItem value="hibrida">Híbrida</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Prioridad */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Prioridad</label>
          <div className="flex gap-2">
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
                  flex-1 px-3 py-2 rounded-md border text-sm font-medium transition-all
                  ${
                    formData.prioridad === priority.value
                      ? priority.color === 'red'
                        ? 'bg-destructive/10 border-destructive/50 text-destructive'
                        : priority.color === 'yellow'
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-500'
                        : 'bg-accent border-border text-foreground'
                      : 'bg-transparent border-border text-muted-foreground hover:border-input hover:text-foreground'
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
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Notas internas (opcional)
          </label>
          <textarea
            value={formData.notasInternas}
            onChange={(e) => updateField('notasInternas', e.target.value)}
            placeholder="Notas privadas para el equipo médico..."
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-md bg-muted/50 border border-border text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-1 focus:border-primary focus:ring-primary/20 resize-none transition-colors"
          />
        </div>

        {/* Error de submit */}
        {submitError && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3.5 flex items-start gap-3">
            <svg className="h-5 w-5 text-destructive mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-destructive font-medium">{submitError}</p>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 pt-5 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 rounded-md border border-border text-muted-foreground text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isValid || isCreatingPatient}
            className="flex-1 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isCreatingPatient
              ? 'Creando paciente...'
              : isSubmitting
              ? 'Guardando...'
              : newPatientData
              ? 'Crear paciente y cita'
              : 'Agendar Cita'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
