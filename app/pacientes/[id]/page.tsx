/**
 * ============================================================
 * PÁGINA: Perfil de Paciente
 * ============================================================
 * Vista detallada del paciente con historial completo de citas
 * Similar a Doctoralia: Sidebar con datos + Panel con historial
 */

'use client';

import React, { useCallback, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { usePacienteDetallado } from '@/hooks/usePacienteDetallado';
import { PatientSidebar } from './components/PatientSidebar';
import { PatientHistory } from './components/PatientHistory';
import { ErrorState } from '@/app/components/common/ErrorState';
import { updatePacienteDestino, updatePacienteNotas } from './services/paciente-service';
import type { DestinoPaciente } from '@/types/pacientes';

export default function PacientePerfilPage() {
  const params = useParams();
  const router = useRouter();
  const pacienteId = params.id as string;

  const { paciente, consultas, loading, error, refetch } = usePacienteDetallado(pacienteId);
  
  // Estado para notificaciones
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Handler para actualizar el destino
  const handleUpdateDestino = useCallback(async (destino: DestinoPaciente) => {
    if (!paciente?.id) return;
    
    const result = await updatePacienteDestino(paciente.id, destino);
    
    if (result.success) {
      setNotification({ type: 'success', message: 'Destino actualizado correctamente' });
      setTimeout(() => setNotification(null), 3000);
      refetch(); // Recargar datos
    } else {
      setNotification({ type: 'error', message: result.error || 'Error al actualizar' });
      setTimeout(() => setNotification(null), 5000);
    }
  }, [paciente?.id, refetch]);

  // Handler para actualizar notas
  const handleUpdateNotas = useCallback(async (notas: string) => {
    if (!paciente?.id) return;
    
    const result = await updatePacienteNotas(paciente.id, notas);
    
    if (result.success) {
      setNotification({ type: 'success', message: 'Notas guardadas correctamente' });
      setTimeout(() => setNotification(null), 3000);
      refetch();
    } else {
      setNotification({ type: 'error', message: result.error || 'Error al guardar notas' });
      setTimeout(() => setNotification(null), 5000);
    }
  }, [paciente?.id, refetch]);

  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando perfil del paciente...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !paciente) {
    return (
      <div className="h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full">
          <ErrorState
            title="Error al cargar paciente"
            error={error || new Error('Paciente no encontrado')}
            onRetry={refetch}
            size="large"
          />
          <button
            onClick={() => router.push('/pacientes')}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-muted hover:bg-accent text-foreground rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Pacientes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-[#0b101a] transition-colors">
      {/* Notificación Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
          notification.type === 'success' 
            ? 'bg-emerald-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header superior */}
      <header className="border-b border-slate-200 dark:border-blue-900/20 bg-white/80 dark:bg-[#0b101a]/80 backdrop-blur-md px-6 py-4 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/pacientes')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-all shadow-sm dark:shadow-none"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver a Pacientes</span>
            <span className="sm:hidden">Volver</span>
          </button>

          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{paciente.nombre}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Perfil de paciente • N° {paciente.pacienteId}</p>
          </div>

          <div className="hidden lg:flex items-center gap-6 text-sm">
            <div className="text-right">
              <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-0.5">Total de citas</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{paciente.totalConsultas}</p>
            </div>
            <div className="h-10 w-px bg-slate-200 dark:bg-slate-700"></div>
            <div className="text-right">
              <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-0.5">Estado</p>
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                paciente.estado === 'Activo' 
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                  : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
              }`}>
                {paciente.estado}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs móvil */}
      <div className="lg:hidden flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b101a]">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'info'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400'
          }`}
        >
          Información
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400'
          }`}
        >
          Historial Clínico
        </button>
      </div>

      {/* Layout principal: Sidebar + Historial */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar - Visible en desktop o si activeTab es 'info' */}
        <div className={`
          w-full lg:w-auto lg:block absolute inset-0 lg:static z-20 bg-white dark:bg-[#0b101a] lg:bg-transparent transition-transform duration-300 ease-in-out
          ${activeTab === 'info' ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <PatientSidebar 
            paciente={paciente}
            onUpdateNotas={handleUpdateNotas}
            onUpdateDestino={handleUpdateDestino}
          />
        </div>

        {/* Panel de historial - Visible en desktop o si activeTab es 'history' */}
        <div className={`
          flex-1 w-full absolute inset-0 lg:static z-10 transition-transform duration-300 ease-in-out bg-slate-50 dark:bg-[#0b101a]
          ${activeTab === 'history' ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <PatientHistory
            consultas={consultas}
            onModificarCita={(consultaId) => {
              console.log('Modificar cita:', consultaId);
              // TODO: Abrir modal de edición de cita
            }}
            onVerEpisodio={(consultaId) => {
              console.log('Ver episodio:', consultaId);
              // TODO: Abrir episodio clínico
            }}
          />
        </div>
      </div>

      {/* Vista móvil: Sidebar como modal o sección colapsable (Eliminado placeholder) */}
    </div>
  );
}
