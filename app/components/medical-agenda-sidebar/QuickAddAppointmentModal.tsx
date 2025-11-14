/**
 * ============================================================
 * COMPONENTE: QuickAddAppointmentModal
 * ============================================================
 * Modal para agregar citas rápidamente desde la sidebar
 */

'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/app/lib/utils';
import { X, Plus, Loader2, AlertCircle } from 'lucide-react';
import { usePacientes } from '@/hooks/usePacientes';
import { useConsultas } from '@/hooks/useConsultas';
import { useMedicalAgendaSidebar } from '@/hooks/useMedicalAgendaSidebar';
import { createClient } from '@/lib/supabase/client';
import { Temporal } from '@js-temporal/polyfill';
import { CONSULT_TYPES, CONSULT_DURATION_RULES } from '@/types/agenda';

const supabase = createClient();

const TIPO_LABELS: Record<string, string> = {
  primera_vez: 'Primera vez',
  subsecuente: 'Subsecuente',
  control_post_op: 'Control post-operatorio',
  urgencia: 'Urgencia',
  procedimiento_menor: 'Procedimiento menor',
  valoracion_prequirurgica: 'Valoración prequirúrgica',
  teleconsulta: 'Teleconsulta',
};

interface FormData {
  pacienteId: string;
  fecha: string;
  hora: string;
  duracionMinutos: number;
  tipo: string;
  sede: 'POLANCO' | 'SATELITE';
  motivoConsulta: string;
}

export function QuickAddAppointmentModal() {
  const { isAddModalOpen, setAddModalOpen, selectedDate } = useMedicalAgendaSidebar();
  const { pacientes } = usePacientes();
  const { refetch } = useConsultas();

  const [formData, setFormData] = useState<FormData>({
    pacienteId: '',
    fecha: '',
    hora: '09:00',
    duracionMinutos: 30,
    tipo: 'primera_vez',
    sede: 'POLANCO',
    motivoConsulta: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<string[]>([]);

  // Inicializar fecha con la fecha seleccionada
  useEffect(() => {
    if (isAddModalOpen) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      setFormData((prev) => ({ ...prev, fecha: dateStr }));
      setError(null);
      setConflicts([]);
    }
  }, [isAddModalOpen, selectedDate]);

  // Validar conflictos de horario
  useEffect(() => {
    const validateConflicts = async () => {
      if (!formData.fecha || !formData.hora) return;

      try {
        const { data: existingAppointments } = await supabase
          .from('consultas')
          .select('*')
          .eq('fecha_consulta', formData.fecha)
          .eq('sede', formData.sede)
          .in('estado_cita', ['Programada', 'Confirmada', 'Reagendada', 'En_Curso']);

        if (existingAppointments && existingAppointments.length > 0) {
          const requestedStart = new Date(`${formData.fecha}T${formData.hora}`);
          const requestedEnd = new Date(requestedStart.getTime() + formData.duracionMinutos * 60000);

          const conflictingAppointments = existingAppointments.filter((apt) => {
            const aptStart = new Date(`${apt.fecha_consulta}T${apt.hora_consulta}`);
            const aptEnd = new Date(aptStart.getTime() + (apt.duracion_minutos || 30) * 60000);

            return (
              (requestedStart >= aptStart && requestedStart < aptEnd) ||
              (requestedEnd > aptStart && requestedEnd <= aptEnd) ||
              (requestedStart <= aptStart && requestedEnd >= aptEnd)
            );
          });

          if (conflictingAppointments.length > 0) {
            setConflicts(
              conflictingAppointments.map(
                (apt) => `${apt.hora_consulta.substring(0, 5)} - Paciente existente`
              )
            );
          } else {
            setConflicts([]);
          }
        }
      } catch (err) {
        console.error('Error validating conflicts:', err);
      }
    };

    validateConflicts();
  }, [formData.fecha, formData.hora, formData.duracionMinutos, formData.sede]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validar campos requeridos
      if (!formData.pacienteId || !formData.fecha || !formData.hora) {
        setError('Por favor completa todos los campos requeridos');
        setLoading(false);
        return;
      }

      // Advertir sobre conflictos
      if (conflicts.length > 0) {
        const confirm = window.confirm(
          `Hay ${conflicts.length} cita(s) en conflicto. ¿Deseas continuar de todos modos?`
        );
        if (!confirm) {
          setLoading(false);
          return;
        }
      }

      // Crear ZonedDateTime
      const timezone = 'America/Mexico_City';
      const dateTimeStr = `${formData.fecha}T${formData.hora}`;
      const plainDateTime = Temporal.PlainDateTime.from(dateTimeStr);
      const zonedDateTime = plainDateTime.toZonedDateTime(timezone);
      const endDateTime = zonedDateTime.add({ minutes: formData.duracionMinutos });

      // Generar consulta_id único
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 8);
      const consultaId = `CONS-${timestamp}-${random}`.toUpperCase();

      // Insertar en base de datos
      const { error: insertError } = await supabase.from('consultas').insert({
        consulta_id: consultaId,
        paciente_id: formData.pacienteId,
        fecha_hora_utc: zonedDateTime.toInstant().toString(),
        fecha_consulta: formData.fecha,
        hora_consulta: formData.hora + ':00',
        timezone,
        sede: formData.sede,
        tipo_cita: formData.tipo,
        duracion_minutos: formData.duracionMinutos,
        motivo_consulta: formData.motivoConsulta || null,
        estado_cita: 'Programada',
        estado_confirmacion: 'Pendiente',
        confirmado_paciente: false,
        canal_origen: 'sidebar_rapida',
      });

      if (insertError) throw insertError;

      // Recargar datos
      await refetch();

      // Cerrar modal
      setAddModalOpen(false);
      setFormData({
        pacienteId: '',
        fecha: '',
        hora: '09:00',
        duracionMinutos: 30,
        tipo: 'primera_vez',
        sede: 'POLANCO',
        motivoConsulta: '',
      });
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleTipoChange = (tipo: string) => {
    const rule = CONSULT_DURATION_RULES[tipo as keyof typeof CONSULT_DURATION_RULES];
    setFormData((prev) => ({
      ...prev,
      tipo,
      duracionMinutos: rule?.duracionDefecto || 30,
    }));
  };

  if (!isAddModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setAddModalOpen(false)}
      />

      <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-white/20 bg-gradient-to-b from-[#0a1429]/95 via-[#060b18]/92 to-[#02040a]/96 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Nueva Cita</h2>
          <button
            onClick={() => setAddModalOpen(false)}
            className="rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Conflict warnings */}
        {conflicts.length > 0 && (
          <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
            <p className="text-xs font-medium text-yellow-300 mb-1">
              ⚠️ Conflictos de horario detectados:
            </p>
            {conflicts.map((conflict, i) => (
              <p key={i} className="text-xs text-yellow-200">
                • {conflict}
              </p>
            ))}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Paciente */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Paciente <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.pacienteId}
              onChange={(e) => setFormData((prev) => ({ ...prev, pacienteId: e.target.value }))}
              className={cn(
                'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white',
                'focus:border-blue-400/50 focus:bg-white/10 focus:outline-none'
              )}
              required
            >
              <option value="">Seleccionar paciente</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#0a1429] text-white">
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Fecha <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData((prev) => ({ ...prev, fecha: e.target.value }))}
                className={cn(
                  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white',
                  'focus:border-blue-400/50 focus:bg-white/10 focus:outline-none'
                )}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Hora <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                value={formData.hora}
                onChange={(e) => setFormData((prev) => ({ ...prev, hora: e.target.value }))}
                className={cn(
                  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white',
                  'focus:border-blue-400/50 focus:bg-white/10 focus:outline-none'
                )}
                required
              />
            </div>
          </div>

          {/* Tipo de Consulta */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Tipo de Consulta <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => handleTipoChange(e.target.value)}
              className={cn(
                'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white',
                'focus:border-blue-400/50 focus:bg-white/10 focus:outline-none'
              )}
              required
            >
              {CONSULT_TYPES.map((tipo) => (
                <option key={tipo} value={tipo} className="bg-[#0a1429] text-white">
                  {TIPO_LABELS[tipo] || tipo}
                </option>
              ))}
            </select>
          </div>

          {/* Duración y Sede */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Duración (min)
              </label>
              <input
                type="number"
                value={formData.duracionMinutos}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, duracionMinutos: parseInt(e.target.value) }))
                }
                min="15"
                max="120"
                step="15"
                className={cn(
                  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white',
                  'focus:border-blue-400/50 focus:bg-white/10 focus:outline-none'
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Sede <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.sede}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, sede: e.target.value as 'POLANCO' | 'SATELITE' }))
                }
                className={cn(
                  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white',
                  'focus:border-blue-400/50 focus:bg-white/10 focus:outline-none'
                )}
              >
                <option value="POLANCO" className="bg-[#0a1429] text-white">
                  POLANCO
                </option>
                <option value="SATELITE" className="bg-[#0a1429] text-white">
                  SATÉLITE
                </option>
              </select>
            </div>
          </div>

          {/* Motivo de Consulta */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Motivo de Consulta
            </label>
            <textarea
              value={formData.motivoConsulta}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, motivoConsulta: e.target.value }))
              }
              rows={3}
              className={cn(
                'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white resize-none',
                'focus:border-blue-400/50 focus:bg-white/10 focus:outline-none'
              )}
              placeholder="Describe brevemente el motivo..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className={cn(
                'flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white/70',
                'hover:bg-white/10 hover:text-white transition-all',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={cn(
                'flex-1 rounded-lg bg-blue-500/20 border border-blue-500/30 px-4 py-2 text-sm font-medium text-blue-300',
                'hover:bg-blue-500/30 hover:text-blue-200 transition-all',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center justify-center gap-2'
              )}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Crear Cita
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
