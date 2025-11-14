/**
 * ============================================================
 * COMPONENTE: QuickAppointmentDetails
 * ============================================================
 * Modal para ver detalles y gestionar citas desde la sidebar
 */

'use client';

import { useState } from 'react';
import { cn } from '@/app/lib/utils';
import { useMedicalAgendaSidebar } from '@/hooks/useMedicalAgendaSidebar';
import { useConsultas } from '@/hooks/useConsultas';
import { createClient } from '@/lib/supabase/client';
import {
  X,
  User,
  Calendar,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const supabase = createClient();

export function QuickAppointmentDetails() {
  const { selectedAppointment, isDetailsModalOpen, setDetailsModalOpen, setSelectedAppointment } =
    useMedicalAgendaSidebar();
  const { refetch } = useConsultas();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!selectedAppointment || !isDetailsModalOpen) return null;

  // Handlers
  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('consultas')
        .update({
          estado_cita: 'Confirmada',
          confirmado_paciente: true,
          estado_confirmacion: 'Confirmado',
        })
        .eq('id', selectedAppointment.uuid);

      if (updateError) throw updateError;

      await refetch();
      setDetailsModalOpen(false);
      setSelectedAppointment(null);
    } catch (err) {
      console.error('Error confirming appointment:', err);
      setError(err instanceof Error ? err.message : 'Error al confirmar la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    const reason = prompt('Motivo de cancelación:');
    if (!reason) return;

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('consultas')
        .update({
          estado_cita: 'Cancelada',
          motivo_cancelacion: reason,
          cancelado_por: 'doctor',
        })
        .eq('id', selectedAppointment.uuid);

      if (updateError) throw updateError;

      await refetch();
      setDetailsModalOpen(false);
      setSelectedAppointment(null);
    } catch (err) {
      console.error('Error canceling appointment:', err);
      setError(err instanceof Error ? err.message : 'Error al cancelar la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm(
      '¿Estás seguro de eliminar esta cita? Esta acción no se puede deshacer.'
    );
    if (!confirm) return;

    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('consultas')
        .delete()
        .eq('id', selectedAppointment.uuid);

      if (deleteError) throw deleteError;

      await refetch();
      setDetailsModalOpen(false);
      setSelectedAppointment(null);
    } catch (err) {
      console.error('Error deleting appointment:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    // Redirigir a la página de agenda para edición completa
    window.location.href = `/agenda?edit=${selectedAppointment.id}`;
  };

  // Formatear fecha
  const formattedDate = new Date(selectedAppointment.fechaConsulta).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = selectedAppointment.horaConsulta.substring(0, 5);

  // Estado config
  const getStatusColor = () => {
    switch (selectedAppointment.estado) {
      case 'Confirmada':
        return 'text-green-400';
      case 'Programada':
        return 'text-blue-400';
      case 'Cancelada':
        return 'text-red-400';
      case 'Completada':
        return 'text-purple-400';
      default:
        return 'text-white/60';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setDetailsModalOpen(false)}
      />

      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/20 bg-gradient-to-b from-[#0a1429]/95 via-[#060b18]/92 to-[#02040a]/96 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Detalles de la Cita</h2>
            <p className={cn('text-sm font-medium mt-1', getStatusColor())}>
              {selectedAppointment.estado}
            </p>
          </div>
          <button
            onClick={() => setDetailsModalOpen(false)}
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

        {/* Content */}
        <div className="space-y-4">
          {/* Paciente */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-full bg-blue-500/10 p-2">
                <User className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-white/50">Paciente</p>
                <p className="text-base font-semibold text-white">
                  {selectedAppointment.paciente}
                </p>
              </div>
            </div>

            {selectedAppointment.confirmadoPaciente && (
              <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2 border border-green-500/20">
                <Phone className="h-4 w-4 text-green-400" />
                <span className="text-xs text-green-300 font-medium">
                  Confirmado por paciente
                </span>
              </div>
            )}
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-white/40" />
                <p className="text-xs text-white/50">Fecha</p>
              </div>
              <p className="text-sm text-white font-medium capitalize">{formattedDate}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-white/40" />
                <p className="text-xs text-white/50">Hora</p>
              </div>
              <p className="text-sm text-white font-medium">
                {formattedTime} ({selectedAppointment.duracionMinutos} min)
              </p>
            </div>
          </div>

          {/* Sede y Tipo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-white/40" />
                <p className="text-xs text-white/50">Sede</p>
              </div>
              <p className="text-sm text-white font-medium">{selectedAppointment.sede}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-white/40" />
                <p className="text-xs text-white/50">Tipo</p>
              </div>
              <p className="text-sm text-white font-medium">{selectedAppointment.tipo}</p>
            </div>
          </div>

          {/* Motivo de Consulta */}
          {selectedAppointment.motivoConsulta && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/50 mb-2">Motivo de Consulta</p>
              <p className="text-sm text-white/80">{selectedAppointment.motivoConsulta}</p>
            </div>
          )}

          {/* Motivo de Cancelación */}
          {selectedAppointment.estado === 'Cancelada' && selectedAppointment.motivoCancelacion && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-xs text-red-400 mb-2">Motivo de Cancelación</p>
              <p className="text-sm text-red-300">{selectedAppointment.motivoCancelacion}</p>
              {selectedAppointment.canceladoPor && (
                <p className="text-xs text-red-300/60 mt-2">
                  Cancelado por: {selectedAppointment.canceladoPor}
                </p>
              )}
            </div>
          )}

          {/* Acciones */}
          <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
            {selectedAppointment.estado === 'Programada' && (
              <button
                onClick={handleConfirm}
                disabled={loading}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg bg-green-500/20 border border-green-500/30 px-4 py-2.5 text-sm font-medium text-green-300',
                  'hover:bg-green-500/30 hover:text-green-200 transition-all',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Confirmar Cita
                  </>
                )}
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleEdit}
                disabled={loading || selectedAppointment.estado === 'Cancelada'}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white/70',
                  'hover:bg-white/10 hover:text-white transition-all',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <Edit className="h-4 w-4" />
                Editar
              </button>

              {selectedAppointment.estado !== 'Cancelada' && (
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-300',
                    'hover:bg-yellow-500/20 hover:text-yellow-200 transition-all',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  <XCircle className="h-4 w-4" />
                  Cancelar
                </button>
              )}
            </div>

            <button
              onClick={handleDelete}
              disabled={loading}
              className={cn(
                'flex items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300',
                'hover:bg-red-500/20 hover:text-red-200 transition-all',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Eliminar Cita
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
