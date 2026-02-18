'use client';

import React from 'react';
import {
  X,
  AlertTriangle,
  Activity,
  Clock,
  MapPin,
  FileText,
  ShieldAlert,
  Loader2,
  Stethoscope,
  HeartPulse,
} from 'lucide-react';
import { useLeadClinico } from '@/hooks/leads/useLeadClinico';
import type { Lead } from '@/types/leads';

interface LeadClinicSidebarProps {
  lead: Lead;
  onClose: () => void;
}

export function LeadClinicSidebar({ lead, onClose }: LeadClinicSidebarProps) {
  const { clinico, isLoading } = useLeadClinico(lead.id);

  const hasData = clinico && (
    (clinico.sintomas_reportados && clinico.sintomas_reportados.length > 0) ||
    (clinico.banderas_rojas && clinico.banderas_rojas.length > 0) ||
    clinico.zona_afectada ||
    clinico.tiempo_evolucion ||
    clinico.resumen_caso
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-teal-100 dark:bg-teal-500/20 rounded-lg shrink-0">
            <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
              Perfil Clínico
            </h3>
            <p className="text-[10px] text-slate-500 truncate">
              {lead.nombreDisplay}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
          </div>
        ) : !hasData ? (
          <EmptyState />
        ) : (
          <>
            {/* Urgencia */}
            {clinico!.es_urgencia_medica && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                <span className="text-xs font-semibold text-red-700 dark:text-red-300">
                  Urgencia médica detectada
                </span>
              </div>
            )}

            {/* Síntomas reportados */}
            {clinico!.sintomas_reportados && clinico!.sintomas_reportados.length > 0 && (
              <Section icon={Activity} title="Síntomas reportados" color="teal">
                <div className="flex flex-wrap gap-1.5">
                  {clinico!.sintomas_reportados.map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg
                               bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300
                               border border-teal-200/60 dark:border-teal-500/20"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Banderas rojas */}
            {clinico!.banderas_rojas && clinico!.banderas_rojas.length > 0 && (
              <Section icon={AlertTriangle} title="Banderas rojas" color="red">
                <div className="flex flex-wrap gap-1.5">
                  {clinico!.banderas_rojas.map((b, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg
                               bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300
                               border border-red-200/60 dark:border-red-500/20"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      {b}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Zona afectada */}
            {clinico!.zona_afectada && (
              <Section icon={MapPin} title="Zona afectada" color="blue">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {clinico!.zona_afectada}
                </p>
              </Section>
            )}

            {/* Tiempo de evolución */}
            {clinico!.tiempo_evolucion && (
              <Section icon={Clock} title="Tiempo de evolución" color="amber">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {clinico!.tiempo_evolucion}
                </p>
              </Section>
            )}

            {/* Resumen del caso */}
            {clinico!.resumen_caso && (
              <Section icon={FileText} title="Resumen del caso" color="purple">
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {clinico!.resumen_caso}
                </p>
              </Section>
            )}

            {/* Scores clínicos */}
            {lead.scoreTotal > 0 && (
              <Section icon={HeartPulse} title="Score del lead" color="emerald">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Score total</span>
                    <span className={`text-sm font-bold ${
                      lead.scoreTotal >= 70 ? 'text-emerald-600' :
                      lead.scoreTotal >= 40 ? 'text-amber-600' :
                      'text-slate-500'
                    }`}>
                      {lead.scoreTotal}/100
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        lead.scoreTotal >= 70 ? 'bg-emerald-500' :
                        lead.scoreTotal >= 40 ? 'bg-amber-500' :
                        'bg-slate-400'
                      }`}
                      style={{ width: `${Math.min(lead.scoreTotal, 100)}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <ScoreBadge label="Temperatura" value={lead.temperatura} />
                    <ScoreBadge label="Estado" value={lead.estadoDisplay} />
                  </div>
                </div>
              </Section>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <Stethoscope className="w-3 h-3" />
          <span>Datos recopilados por el bot</span>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Stethoscope className="w-8 h-8 text-slate-300 dark:text-slate-600" />
      </div>
      <p className="text-sm font-semibold text-foreground">Sin datos clínicos</p>
      <p className="text-xs mt-2 text-slate-400 max-w-[200px] leading-relaxed">
        Los síntomas aparecerán aquí cuando el paciente los reporte al bot
      </p>
    </div>
  );
}

const SECTION_COLORS = {
  teal: 'text-teal-600 dark:text-teal-400',
  red: 'text-red-600 dark:text-red-400',
  blue: 'text-blue-600 dark:text-blue-400',
  amber: 'text-amber-600 dark:text-amber-400',
  purple: 'text-purple-600 dark:text-purple-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
} as const;

function Section({
  icon: Icon,
  title,
  color,
  children,
}: {
  icon: React.ElementType;
  title: string;
  color: keyof typeof SECTION_COLORS;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Icon className={`w-3.5 h-3.5 ${SECTION_COLORS[color]}`} />
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function ScoreBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">
      <span className="text-[10px] text-slate-400 uppercase">{label}</span>
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 capitalize">
        {value.replace(/_/g, ' ')}
      </span>
    </div>
  );
}
