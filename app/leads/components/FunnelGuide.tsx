'use client';

import React, { useState } from 'react';
import { 
  Info, 
  ChevronDown, 
  ChevronRight,
  ArrowRight,
  Clock,
  Target,
  MessageSquare,
  Copy,
  Check
} from 'lucide-react';
import { ETAPAS_FUNNEL, PLANTILLAS_MENSAJE, personalizarPlantilla } from '@/app/lib/funnel-config';

/**
 * ============================================================
 * GUÍA DEL EMBUDO DE VENTAS
 * ============================================================
 * Componente educativo para que el doctor entienda el proceso
 * de conversión de leads a pacientes.
 */

export function FunnelGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedEtapa, setExpandedEtapa] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (mensaje: string, id: string) => {
    try {
      await navigator.clipboard.writeText(mensaje);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="mb-4">
      {/* Toggle button - más grande para touch */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground 
                   transition-colors py-2 px-1 -mx-1 rounded-lg active:bg-muted/50"
      >
        <Info className="w-4 h-4" />
        <span>¿Cómo funciona el embudo de ventas?</span>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Contenido expandible */}
      {isOpen && (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border space-y-6 animate-in slide-in-from-top-2">
          
          {/* Introducción */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">
              📊 Proceso de Conversión de Pacientes
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              El embudo de ventas muestra el camino que sigue cada persona desde que nos contacta 
              hasta que se convierte en paciente. Cada etapa tiene acciones específicas y plantillas 
              de mensaje listas para usar.
            </p>
          </div>

          {/* Diagrama visual del embudo - scroll horizontal en móvil */}
          <div className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide 
                          md:justify-center md:flex-wrap -mx-4 px-4 md:mx-0 md:px-0">
            {ETAPAS_FUNNEL.slice(0, 5).map((etapa, idx) => (
              <React.Fragment key={etapa.estado}>
                <div 
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border whitespace-nowrap shrink-0
                             ${etapa.color === 'blue' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30' : ''}
                             ${etapa.color === 'amber' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30' : ''}
                             ${etapa.color === 'purple' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30' : ''}
                             ${etapa.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' : ''}`}
                >
                  <span className="mr-1">{etapa.icon}</span>
                  {etapa.nombre}
                </div>
                {idx < 4 && <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />}
              </React.Fragment>
            ))}
          </div>

          {/* Detalle de cada etapa */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Detalle por Etapa
            </h4>
            
            {ETAPAS_FUNNEL.map((etapa) => (
              <div 
                key={etapa.estado}
                className="border border-border rounded-md overflow-hidden"
              >
                {/* Header de etapa - touch optimizado */}
                <button
                  onClick={() => setExpandedEtapa(expandedEtapa === etapa.estado ? null : etapa.estado)}
                  className="w-full flex items-center gap-3 p-3 md:p-3 py-4 hover:bg-muted/50 
                             transition-colors text-left active:bg-muted/70 min-h-[56px]"
                >
                  <span className="text-lg">{etapa.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{etapa.nombre}</p>
                    <p className="text-xs text-muted-foreground truncate">{etapa.descripcion}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{etapa.tiempoIdeal}</span>
                  </div>
                  {expandedEtapa === etapa.estado 
                    ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  }
                </button>

                {/* Contenido expandido */}
                {expandedEtapa === etapa.estado && (
                  <div className="border-t border-border p-3 bg-background space-y-3">
                    {/* Objetivo */}
                    <div className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-foreground">Objetivo</p>
                        <p className="text-xs text-muted-foreground">{etapa.objetivo}</p>
                      </div>
                    </div>

                    {/* Acciones disponibles */}
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-foreground mb-1">Acciones</p>
                        <div className="flex flex-wrap gap-1">
                          {etapa.acciones.map((accion) => (
                            <span 
                              key={accion.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] 
                                         bg-muted rounded-full text-muted-foreground"
                            >
                              <span>{accion.icon}</span>
                              {accion.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Plantillas de mensaje */}
                    <div>
                      <p className="text-xs font-medium text-foreground mb-2">
                        📝 Plantillas de mensaje
                      </p>
                      <div className="space-y-2">
                        {PLANTILLAS_MENSAJE
                          .filter(p => p.etapasAplica.includes(etapa.estado))
                          .map((plantilla) => (
                            <div 
                              key={plantilla.id}
                              className="bg-muted/50 rounded-md p-2 group"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium">{plantilla.nombre}</span>
                                <button
                                  onClick={() => handleCopy(
                                    personalizarPlantilla(plantilla.mensaje, { nombre: '[NOMBRE]' }),
                                    plantilla.id
                                  )}
                                  className="text-xs text-muted-foreground hover:text-foreground 
                                             flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 
                                             transition-opacity p-1 -m-1 rounded active:bg-muted"
                                >
                                  {copiedId === plantilla.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-500" />
                                      <span className="text-emerald-500">Copiado</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copiar</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <p className="text-[10px] text-muted-foreground whitespace-pre-line line-clamp-3">
                                {plantilla.mensaje.substring(0, 150)}...
                              </p>
                            </div>
                          ))
                        }
                        {PLANTILLAS_MENSAJE.filter(p => p.etapasAplica.includes(etapa.estado)).length === 0 && (
                          <p className="text-[10px] text-muted-foreground italic">
                            No hay plantillas específicas para esta etapa
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-md p-3">
            <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
              💡 Tips para Maximizar Conversiones
            </h4>
            <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
              <li>• <strong>Tiempo de respuesta:</strong> Responder en menos de 1 hora aumenta 7x la conversión</li>
              <li>• <strong>Seguimiento:</strong> El 80% de ventas requiere 5+ contactos de seguimiento</li>
              <li>• <strong>Personalización:</strong> Usa el nombre del paciente en cada mensaje</li>
              <li>• <strong>Claridad:</strong> Incluye siempre el siguiente paso (precio, fecha, ubicación)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default FunnelGuide;
