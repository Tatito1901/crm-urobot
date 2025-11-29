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
// DestinoPaciente imported from hook

export default function PacientePerfilPage() {
  const params = useParams();
  const router = useRouter();
  const pacienteId = params.id as string;

  const { paciente, consultas, loading, error, refetch } = usePacienteDetallado(pacienteId);
  
  // Estado para tabs en móvil
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');
  
  // Estado para notificaciones
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Handler para actualizar el destino
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateDestino = useCallback(async (destino: any) => {
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
    <div className="h-screen flex flex-col bg-background transition-colors">
      {/* Notificación Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border transition-all animate-in fade-in slide-in-from-top-4 ${
          notification.type === 'success' 
            ? 'bg-background border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-emerald-500/10' 
            : 'bg-background border-red-500/20 text-red-600 dark:text-red-400 shadow-red-500/10'
        }`}>
          <div className={`p-1 rounded-full ${notification.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            <CheckCircle className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-foreground">{notification.message}</span>
        </div>
      )}

      {/* Header superior */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md px-6 py-4 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/pacientes')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-background hover:bg-accent border border-border rounded-lg transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver a Pacientes</span>
            <span className="sm:hidden">Volver</span>
          </button>

          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{paciente.nombre}</h1>
            <p className="text-sm text-muted-foreground">Perfil de paciente • N° {paciente.id}</p>
          </div>

          <div className="hidden lg:flex items-center gap-6 text-sm">
            <div className="text-right">
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">Total de citas</p>
              <p className="text-2xl font-bold text-foreground leading-none">{paciente.totalConsultas}</p>
            </div>
            <div className="h-10 w-px bg-border"></div>
            <div className="text-right">
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">Estado</p>
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                paciente.estado === 'Activo' 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                  : 'bg-muted text-muted-foreground border-border'
              }`}>
                {paciente.estado}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs móvil */}
      <div className="lg:hidden flex border-b border-border bg-background">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'info'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground'
          }`}
        >
          Información
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground'
          }`}
        >
          Historial Clínico
        </button>
      </div>

      {/* Layout principal: Sidebar + Historial */}
      <div className="flex-1 flex overflow-hidden relative bg-muted/5">
        {/* Sidebar - Visible en desktop o si activeTab es 'info' */}
        <div className={`
          w-full lg:w-auto lg:block absolute inset-0 lg:static z-20 bg-background lg:bg-transparent transition-transform duration-300 ease-in-out
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
          flex-1 w-full absolute inset-0 lg:static z-10 transition-transform duration-300 ease-in-out bg-muted/5
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
    </div>
  );
}
