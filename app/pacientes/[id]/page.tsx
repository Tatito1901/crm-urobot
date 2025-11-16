/**
 * ============================================================
 * PÁGINA: Perfil de Paciente
 * ============================================================
 * Vista detallada del paciente con historial completo de citas
 * Similar a Doctoralia: Sidebar con datos + Panel con historial
 */

'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { usePacienteDetallado } from '@/hooks/usePacienteDetallado';
import { PatientSidebar } from './components/PatientSidebar';
import { PatientHistory } from './components/PatientHistory';
import { ErrorState } from '@/app/components/common/ErrorState';

export default function PacientePerfilPage() {
  const params = useParams();
  const router = useRouter();
  const pacienteId = params.id as string;

  const { paciente, consultas, loading, error, refetch } = usePacienteDetallado(pacienteId);

  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-urobot">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando perfil del paciente...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !paciente) {
    return (
      <div className="h-screen flex items-center justify-center bg-urobot p-6">
        <div className="max-w-md w-full">
          <ErrorState
            title="Error al cargar paciente"
            error={error || new Error('Paciente no encontrado')}
            onRetry={refetch}
            size="large"
          />
          <button
            onClick={() => router.push('/pacientes')}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Pacientes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-urobot">
      {/* Header superior */}
      <header className="border-b border-slate-800/60 bg-slate-900/40 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/pacientes')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver a Pacientes</span>
            <span className="sm:hidden">Volver</span>
          </button>

          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{paciente.nombre}</h1>
            <p className="text-sm text-slate-400">Perfil de paciente • N° {paciente.pacienteId}</p>
          </div>

          <div className="hidden lg:flex items-center gap-4 text-sm">
            <div className="text-right">
              <p className="text-slate-400">Total de citas</p>
              <p className="text-2xl font-bold text-white">{paciente.totalConsultas}</p>
            </div>
            <div className="h-12 w-px bg-slate-700"></div>
            <div className="text-right">
              <p className="text-slate-400">Estado</p>
              <p className={`text-sm font-medium ${
                paciente.estado === 'Activo' 
                  ? 'text-emerald-400' 
                  : 'text-slate-500'
              }`}>
                {paciente.estado}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Layout principal: Sidebar + Historial */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Oculto en móvil, visible en desktop */}
        <div className="hidden lg:block">
          <PatientSidebar 
            paciente={paciente}
            onUpdateNotas={(notas) => {
              console.log('Actualizar notas:', notas);
              // TODO: Implementar actualización de notas
            }}
            onUpdateInfoMedica={(info) => {
              console.log('Actualizar info médica:', info);
              // TODO: Implementar actualización de info médica
            }}
          />
        </div>

        {/* Panel de historial */}
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

      {/* Vista móvil: Sidebar como modal o sección colapsable */}
      {/* TODO: Implementar vista móvil con tabs o drawer */}
    </div>
  );
}
