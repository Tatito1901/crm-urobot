/**
 * ============================================================
 * PATIENT HISTORY - Historial de citas y episodios clínicos
 * ============================================================
 * Panel derecho con pestañas: Citas, Episodios clínicos, Documentos
 */

'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, Edit, Eye, StickyNote } from 'lucide-react';
import type { Consulta } from '@/types/consultas';
import { NotaConsultaModal } from './NotaConsultaModal';
import { getNotaConsulta, saveNotaConsulta } from '../services/paciente-service';

interface PatientHistoryProps {
  consultas: Consulta[];
  onModificarCita?: (consultaId: string) => void;
  onVerEpisodio?: (consultaId: string) => void;
}

type TabType = 'citas' | 'datos';

export const PatientHistory: React.FC<PatientHistoryProps> = ({
  consultas,
  onModificarCita,
  onVerEpisodio
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('citas');
  
  // Estado para notas
  const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);
  const [notaActual, setNotaActual] = useState('');
  const [isNotaModalOpen, setIsNotaModalOpen] = useState(false);
  const [isLoadingNota, setIsLoadingNota] = useState(false);

  const handleOpenNota = async (consulta: Consulta) => {
    setSelectedConsulta(consulta);
    setIsLoadingNota(true);
    setIsNotaModalOpen(true);
    
    // Cargar nota existente
    const { nota } = await getNotaConsulta(consulta.id);
    setNotaActual(nota || '');
    setIsLoadingNota(false);
  };

  const handleSaveNota = async (nota: string) => {
    if (selectedConsulta) {
      await saveNotaConsulta(selectedConsulta.id, nota);
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Confirmada':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30';
      case 'Programada':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30';
      case 'Cancelada':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30';
      case 'Completada':
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30';
      case 'No Asistió':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // HH:MM
  };

  const tabs = [
    { id: 'citas' as TabType, label: 'Citas', count: consultas.length },
    { id: 'datos' as TabType, label: 'Datos del paciente', count: 0 },
  ];

  // Ordenar consultas por fecha (más recientes primero)
  const sortedConsultas = [...consultas].sort((a, b) => {
    return new Date(b.fechaConsulta).getTime() - new Date(a.fechaConsulta).getTime();
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-900/40 transition-colors">
      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800/40 bg-white dark:bg-slate-900/20">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:bg-blue-500/5'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-800/40'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido de las pestañas */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'citas' && (
          <div className="space-y-4">
            {sortedConsultas.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">No hay citas registradas</p>
              </div>
            ) : (
              sortedConsultas.map((consulta) => (
                <div
                  key={consulta.id}
                  className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 rounded-lg p-4 hover:border-slate-300 dark:hover:border-slate-600/50 transition-all shadow-sm dark:shadow-none"
                >
                  {/* Header de la cita */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {formatDate(consulta.fechaConsulta)}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {formatTime(consulta.horaConsulta)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onModificarCita?.(consulta.id)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs flex items-center gap-1 transition-colors"
                    >
                      <Edit className="h-3 w-3" />
                      Modificar cita
                    </button>
                  </div>

                  {/* Información de la sede */}
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mb-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>{consulta.sede}</span>
                  </div>

                  {/* Tipo y estado */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-slate-600 dark:text-slate-300 capitalize">
                      {consulta.tipoCita}
                    </span>
                    <span className="text-slate-400 dark:text-slate-600">•</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(consulta.estadoCita)}`}>
                      {consulta.estadoCita}
                    </span>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleOpenNota(consulta)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 dark:bg-slate-800/50 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300 rounded-lg text-sm transition-colors"
                    >
                      <StickyNote className="h-4 w-4 text-amber-500" />
                      Notas Clínicas
                    </button>
                    
                    {consulta.estadoCita === 'Completada' && (
                      <button
                        onClick={() => onVerEpisodio?.(consulta.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-lg text-sm transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Motivo de consulta */}
                  {consulta.motivoConsulta && (
                    <div className="mt-3">
                      <p className="text-xs text-slate-500 mb-1">Motivo:</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 italic">&quot;{consulta.motivoConsulta}&quot;</p>
                    </div>
                  )}

                  {/* Última modificación */}
                  {consulta.updatedAt && (
                    <div className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                      Última modificación: {formatDate(consulta.updatedAt)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'datos' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 rounded-lg p-4 shadow-sm dark:shadow-none">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Información del paciente</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Estado:</span>
                  <span className="text-slate-700 dark:text-slate-200">Activo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Canal de origen:</span>
                  <span className="text-slate-700 dark:text-slate-200">WhatsApp</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Notas */}
      <NotaConsultaModal
        isOpen={isNotaModalOpen}
        onClose={() => {
          setIsNotaModalOpen(false);
          setSelectedConsulta(null);
        }}
        onSave={handleSaveNota}
        notaInicial={isLoadingNota ? '' : notaActual}
        titulo={selectedConsulta ? `Consulta del ${formatDate(selectedConsulta.fechaConsulta)}` : ''}
        consulta={selectedConsulta ? {
          tipoCita: selectedConsulta.tipoCita || undefined,
          motivoConsulta: selectedConsulta.motivoConsulta || undefined,
          sede: selectedConsulta.sede || undefined,
        } : undefined}
      />
    </div>
  );
};
