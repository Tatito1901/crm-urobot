'use client';

import React, { useState } from 'react';
import { 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  User,
  Calendar,
  Phone,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { useLeadsCleanup, type LeadToClean } from '@/hooks/useLeadsCleanup';

interface LeadsCleanupPanelProps {
  onComplete?: () => void;
}

export function LeadsCleanupPanel({ onComplete }: LeadsCleanupPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'actualizar' | 'eliminar'>('actualizar');
  
  const {
    isScanning,
    isCleaning,
    leadsPendientes,
    lastResult,
    error,
    escanearLeads,
    limpiarLeads,
    limpiarUno,
    reset,
  } = useLeadsCleanup();

  const handleScan = async () => {
    setIsExpanded(true);
    await escanearLeads();
  };

  const handleCleanAll = async () => {
    const result = await limpiarLeads(selectedMode);
    if (result.errores.length === 0) {
      onComplete?.();
    }
  };

  const handleCleanOne = async (leadId: string) => {
    const success = await limpiarUno(leadId, selectedMode);
    if (success && leadsPendientes.length === 1) {
      onComplete?.();
    }
  };

  const getRazonBadge = (razon: LeadToClean['razon']) => {
    switch (razon) {
      case 'tiene_citas':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
            <Calendar className="w-3 h-3" />
            Tiene citas
          </span>
        );
      case 'paciente_existente':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
            <User className="w-3 h-3" />
            Es paciente
          </span>
        );
      case 'tiene_nombre':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
            <Sparkles className="w-3 h-3" />
            Con nombre
          </span>
        );
    }
  };

  // Si hay resultado, mostrar resumen
  if (lastResult) {
    return (
      <div className="rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-emerald-900 dark:text-emerald-100">Limpieza completada</h4>
            <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
              {lastResult.leadsActualizados > 0 && (
                <span>{lastResult.leadsActualizados} leads actualizados a Convertido. </span>
              )}
              {lastResult.leadsEliminados > 0 && (
                <span>{lastResult.leadsEliminados} leads eliminados. </span>
              )}
              {lastResult.errores.length > 0 && (
                <span className="text-amber-600">{lastResult.errores.length} errores.</span>
              )}
            </p>
            {lastResult.errores.length > 0 && (
              <ul className="mt-2 text-xs text-red-600 dark:text-red-400 space-y-1">
                {lastResult.errores.map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
              </ul>
            )}
            <button
              onClick={reset}
              className="mt-3 text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              ← Volver a escanear
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${isScanning ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">Limpieza de Leads</span>
          {leadsPendientes.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
              {leadsPendientes.length} pendientes
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleScan();
              }}
              disabled={isScanning}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isScanning ? 'Escaneando...' : 'Escanear'}
            </button>
          )}
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Contenido expandido */}
      {isExpanded && (
        <div className="border-t border-border">
          {/* Descripción */}
          <div className="px-4 py-3 bg-muted/10 border-b border-border/50">
            <p className="text-xs text-muted-foreground">
              Identifica leads que ya son pacientes o tienen citas programadas. 
              Puedes <strong>actualizarlos</strong> (marcar como Convertido) o <strong>eliminarlos</strong> de la base de datos.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 bg-red-50 dark:bg-red-500/10 border-b border-red-200 dark:border-red-500/30">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="px-4 py-3 flex flex-wrap items-center gap-3 border-b border-border/50">
            <button
              onClick={handleScan}
              disabled={isScanning || isCleaning}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-secondary text-foreground hover:bg-accent transition-colors disabled:opacity-50"
            >
              {isScanning ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              {isScanning ? 'Escaneando...' : 'Escanear leads'}
            </button>

            {leadsPendientes.length > 0 && (
              <>
                <div className="h-4 w-px bg-border" />
                
                <select
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value as 'actualizar' | 'eliminar')}
                  className="px-2 py-1.5 text-xs rounded-md border border-border bg-background"
                >
                  <option value="actualizar">Marcar como Convertido</option>
                  <option value="eliminar">Eliminar leads</option>
                </select>

                <button
                  onClick={handleCleanAll}
                  disabled={isCleaning || leadsPendientes.length === 0}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-50 ${
                    selectedMode === 'eliminar'
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-emerald-500 text-white hover:bg-emerald-600'
                  }`}
                >
                  {isCleaning ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : selectedMode === 'eliminar' ? (
                    <Trash2 className="w-3.5 h-3.5" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  {isCleaning 
                    ? 'Procesando...' 
                    : `${selectedMode === 'eliminar' ? 'Eliminar' : 'Actualizar'} todos (${leadsPendientes.length})`
                  }
                </button>
              </>
            )}
          </div>

          {/* Lista de leads */}
          {leadsPendientes.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                {isScanning 
                  ? 'Buscando leads para limpiar...' 
                  : 'No hay leads para limpiar. Presiona "Escanear leads" para buscar.'
                }
              </p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Lead</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Paciente</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Razón</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {leadsPendientes.map((lead) => (
                    <tr key={lead.id} className="hover:bg-muted/20">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <div>
                            <div className="font-medium text-foreground">
                              {lead.nombreLead || lead.telefono}
                            </div>
                            {lead.nombreLead && (
                              <div className="text-xs text-muted-foreground">{lead.telefono}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        {lead.pacienteId ? (
                          <div>
                            <div className="text-foreground">{lead.nombrePaciente || '—'}</div>
                            {lead.tieneCitas && (
                              <div className="text-xs text-muted-foreground">
                                {lead.totalCitas} cita{lead.totalCitas !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        {getRazonBadge(lead.razon)}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => handleCleanOne(lead.id)}
                          disabled={isCleaning}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors disabled:opacity-50 ${
                            selectedMode === 'eliminar'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30'
                              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30'
                          }`}
                        >
                          {selectedMode === 'eliminar' ? (
                            <>
                              <Trash2 className="w-3 h-3" />
                              Eliminar
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Convertir
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LeadsCleanupPanel;
