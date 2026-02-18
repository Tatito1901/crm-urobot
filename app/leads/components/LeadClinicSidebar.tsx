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
  Thermometer,
  Gauge,
  Brain,
  TrendingUp,
  Target,
  Megaphone,
  ExternalLink,
  ShieldCheck,
  Lightbulb,
} from 'lucide-react';
import { useLeadClinico } from '@/hooks/leads/useLeadClinico';
import type { Lead } from '@/types/leads';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface LeadClinicSidebarProps {
  lead: Lead;
  onClose: () => void;
}

export function LeadClinicSidebar({ lead, onClose }: LeadClinicSidebarProps) {
  const { clinico, isLoading } = useLeadClinico(lead.id);

  const hasClinico = clinico && (
    (clinico.sintomas_reportados && clinico.sintomas_reportados.length > 0) ||
    (clinico.banderas_rojas && clinico.banderas_rojas.length > 0) ||
    clinico.zona_afectada ||
    clinico.tiempo_evolucion ||
    clinico.resumen_caso
  );

  const hasSignals = !!lead.signals;
  const hasMetaAds = lead.esMetaAds;
  const hasData = hasClinico || hasSignals || hasMetaAds || lead.scoreTotal > 0;

  // Sections to auto-open
  const defaultOpenSections = React.useMemo(() => {
    const sections: string[] = [];
    if (clinico?.sintomas_reportados?.length) sections.push('sintomas');
    if (clinico?.banderas_rojas?.length) sections.push('banderas');
    if (clinico?.zona_afectada) sections.push('zona');
    if (clinico?.resumen_caso) sections.push('resumen');
    if (lead.scoreTotal > 0) sections.push('score');
    if (hasSignals) sections.push('behavioral');
    if (hasMetaAds) sections.push('metaads');
    return sections.length > 0 ? sections : ['score'];
  }, [clinico, lead.scoreTotal, hasSignals, hasMetaAds]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col h-full bg-card w-full">
        {/* ── Header ── */}
        <div className="shrink-0 px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 bg-teal-500/10 rounded-lg shrink-0">
              <Stethoscope className="w-4 h-4 text-teal-500" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-foreground truncate">
                Perfil Clínico
              </h3>
              <p className="text-[11px] text-muted-foreground truncate">
                {lead.nombreDisplay}
              </p>
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-secondary rounded-lg transition-colors shrink-0"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">Cerrar panel</TooltipContent>
          </Tooltip>
        </div>

        {/* ── Content ── */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
                <span className="text-xs text-muted-foreground">Cargando datos clínicos…</span>
              </div>
            ) : !hasData ? (
              <EmptyState />
            ) : (
              <>
                {/* ── Urgencia alert ── */}
                {clinico!.es_urgencia_medica && (
                  <div className="flex items-center gap-2.5 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg animate-in fade-in duration-300">
                    <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="text-xs font-semibold text-red-400">
                      Urgencia médica detectada
                    </span>
                  </div>
                )}

                {/* ── Accordion sections ── */}
                <Accordion
                  type="multiple"
                  defaultValue={defaultOpenSections}
                  className="space-y-1.5"
                >
                  {/* Síntomas reportados */}
                  {clinico!.sintomas_reportados && clinico!.sintomas_reportados.length > 0 && (
                    <AccordionItem value="sintomas" className="border-none rounded-lg bg-secondary/50 px-3">
                      <AccordionTrigger className="py-2.5 hover:no-underline gap-2">
                        <div className="flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                          <span className="text-xs font-semibold text-foreground">
                            Síntomas reportados
                          </span>
                          <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 rounded-md">
                            {clinico!.sintomas_reportados.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-3 pt-0">
                        <div className="flex flex-wrap gap-1.5">
                          {clinico!.sintomas_reportados.map((s, i) => (
                            <Badge
                              key={i}
                              variant="default"
                              className="text-[11px] font-medium rounded-md px-2 py-0.5"
                            >
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Banderas rojas */}
                  {clinico!.banderas_rojas && clinico!.banderas_rojas.length > 0 && (
                    <AccordionItem value="banderas" className="border-none rounded-lg bg-red-500/5 px-3">
                      <AccordionTrigger className="py-2.5 hover:no-underline gap-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span className="text-xs font-semibold text-foreground">
                            Banderas rojas
                          </span>
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 rounded-md">
                            {clinico!.banderas_rojas.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-3 pt-0">
                        <div className="flex flex-wrap gap-1.5">
                          {clinico!.banderas_rojas.map((b, i) => (
                            <Badge
                              key={i}
                              variant="destructive"
                              className="text-[11px] font-medium rounded-md px-2 py-0.5"
                            >
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {b}
                            </Badge>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Zona afectada */}
                  {clinico!.zona_afectada && (
                    <AccordionItem value="zona" className="border-none rounded-lg bg-secondary/50 px-3">
                      <AccordionTrigger className="py-2.5 hover:no-underline gap-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="text-xs font-semibold text-foreground">
                            Zona afectada
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-3 pt-0">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {clinico!.zona_afectada}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Tiempo de evolución */}
                  {clinico!.tiempo_evolucion && (
                    <AccordionItem value="tiempo" className="border-none rounded-lg bg-secondary/50 px-3">
                      <AccordionTrigger className="py-2.5 hover:no-underline gap-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="text-xs font-semibold text-foreground">
                            Tiempo de evolución
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-3 pt-0">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {clinico!.tiempo_evolucion}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Resumen del caso */}
                  {clinico!.resumen_caso && (
                    <AccordionItem value="resumen" className="border-none rounded-lg bg-secondary/50 px-3">
                      <AccordionTrigger className="py-2.5 hover:no-underline gap-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          <span className="text-xs font-semibold text-foreground">
                            Resumen del caso
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-3 pt-0">
                        <p className="text-[13px] text-muted-foreground leading-relaxed">
                          {clinico!.resumen_caso}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Score del lead */}
                  {lead.scoreTotal > 0 && (
                    <AccordionItem value="score" className="border-none rounded-lg bg-secondary/50 px-3">
                      <AccordionTrigger className="py-2.5 hover:no-underline gap-2">
                        <div className="flex items-center gap-2">
                          <HeartPulse className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="text-xs font-semibold text-foreground">
                            Score del lead
                          </span>
                          <Badge
                            variant={lead.scoreTotal >= 70 ? 'success' : lead.scoreTotal >= 40 ? 'warning' : 'secondary'}
                            className="text-[10px] px-1.5 py-0 h-4 rounded-md font-bold"
                          >
                            {lead.scoreTotal}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-3 pt-0">
                        <div className="space-y-3">
                          {/* Score bar */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-muted-foreground">Score total</span>
                              <span className={cn(
                                'text-sm font-bold tabular-nums',
                                lead.scoreTotal >= 70 ? 'text-emerald-500' :
                                lead.scoreTotal >= 40 ? 'text-amber-500' :
                                'text-muted-foreground'
                              )}>
                                {lead.scoreTotal}/100
                              </span>
                            </div>
                            <Progress
                              value={Math.min(lead.scoreTotal, 100)}
                              className={cn(
                                'h-2',
                                lead.scoreTotal >= 70 ? '[&>[data-slot=progress-indicator]]:bg-emerald-500' :
                                lead.scoreTotal >= 40 ? '[&>[data-slot=progress-indicator]]:bg-amber-500' :
                                '[&>[data-slot=progress-indicator]]:bg-muted-foreground'
                              )}
                            />
                          </div>

                          <Separator />

                          {/* Score breakdown */}
                          {lead.scores && (
                            <div className="space-y-2">
                              <ScoreBar label="Clínico" value={lead.scores.clinical} max={30} color="text-teal-500" />
                              <ScoreBar label="Intención" value={lead.scores.intent} max={35} color="text-blue-500" />
                              <ScoreBar label="Engagement" value={lead.scores.engagement} max={20} color="text-violet-500" />
                              <ScoreBar label="BANT" value={lead.scores.bant} max={15} color="text-amber-500" />
                            </div>
                          )}

                          {!lead.scores && <Separator />}

                          {/* Detail badges */}
                          <div className="grid grid-cols-2 gap-2">
                            <ScoreDetailCard
                              icon={<Thermometer className="w-3.5 h-3.5" />}
                              label="Temperatura"
                              value={lead.temperatura}
                            />
                            <ScoreDetailCard
                              icon={<Gauge className="w-3.5 h-3.5" />}
                              label="Estado"
                              value={lead.estadoDisplay}
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Perfil Behavioral (signals) */}
                  {lead.signals && (
                    <AccordionItem value="behavioral" className="border-none rounded-lg bg-violet-500/5 px-3">
                      <AccordionTrigger className="py-2.5 hover:no-underline gap-2">
                        <div className="flex items-center gap-2">
                          <Brain className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                          <span className="text-xs font-semibold text-foreground">
                            Perfil Behavioral
                          </span>
                          {lead.signals.prediccion_conversion && (
                            <Badge
                              variant={lead.signals.prediccion_conversion === 'alta' ? 'success' : lead.signals.prediccion_conversion === 'media' ? 'warning' : 'secondary'}
                              className="text-[10px] px-1.5 py-0 h-4 rounded-md"
                            >
                              {lead.signals.prediccion_conversion}
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-3 pt-0">
                        <div className="space-y-3">
                          {/* Perfil + Predicción row */}
                          <div className="grid grid-cols-2 gap-2">
                            {lead.signals.perfil_paciente && (
                              <ScoreDetailCard
                                icon={<Target className="w-3.5 h-3.5" />}
                                label="Perfil"
                                value={lead.signals.perfil_paciente}
                              />
                            )}
                            {lead.signals.prediccion_conversion && (
                              <ScoreDetailCard
                                icon={<TrendingUp className="w-3.5 h-3.5" />}
                                label="Conversión"
                                value={lead.signals.prediccion_conversion}
                              />
                            )}
                          </div>

                          {/* Nivel de compromiso */}
                          {lead.signals.nivel_compromiso !== null && (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] text-muted-foreground">Compromiso</span>
                                <span className="text-xs font-bold tabular-nums text-violet-500">
                                  {lead.signals.nivel_compromiso}/10
                                </span>
                              </div>
                              <Progress
                                value={lead.signals.nivel_compromiso * 10}
                                className="h-1.5 [&>[data-slot=progress-indicator]]:bg-violet-500"
                              />
                            </div>
                          )}

                          {/* Barrera principal */}
                          {lead.signals.barrera_principal && (
                            <div className="flex items-center gap-2 px-2.5 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Barrera</p>
                                <p className="text-xs font-semibold text-foreground capitalize">
                                  {lead.signals.barrera_principal.replace(/_/g, ' ')}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Emociones detectadas */}
                          {lead.signals.emociones.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[11px] text-muted-foreground">Emociones detectadas</span>
                              <div className="flex flex-wrap gap-1">
                                {lead.signals.emociones.map((emo, i) => (
                                  <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0 h-5 rounded-md capitalize">
                                    {emo}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Incentivo sugerido */}
                          {lead.signals.incentivo_sugerido && (
                            <div className="flex items-center gap-2 px-2.5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                              <Lightbulb className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Incentivo sugerido</p>
                                <p className="text-xs font-semibold text-foreground capitalize">
                                  {lead.signals.incentivo_sugerido.replace(/_/g, ' ')}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Meta Ads Attribution */}
                  {lead.esMetaAds && (
                    <AccordionItem value="metaads" className="border-none rounded-lg bg-blue-500/5 px-3">
                      <AccordionTrigger className="py-2.5 hover:no-underline gap-2">
                        <div className="flex items-center gap-2">
                          <Megaphone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="text-xs font-semibold text-foreground">
                            Meta Ads
                          </span>
                          <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 rounded-md bg-blue-500/20 text-blue-400 border-0">
                            Campaña
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-3 pt-0">
                        <div className="space-y-2">
                          {lead.campanaHeadline && (
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Headline</span>
                              <p className="text-xs font-semibold text-foreground">{lead.campanaHeadline}</p>
                            </div>
                          )}
                          {lead.campanaUrl && (
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">URL</span>
                              <a
                                href={lead.campanaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors truncate"
                              >
                                <ExternalLink className="w-3 h-3 shrink-0" />
                                <span className="truncate">{lead.campanaUrl}</span>
                              </a>
                            </div>
                          )}
                          {lead.ctwaClid && (
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Click ID</span>
                              <p className="text-[11px] text-muted-foreground font-mono truncate">{lead.ctwaClid}</p>
                            </div>
                          )}
                          {lead.campanaId && (
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Campaign ID</span>
                              <p className="text-[11px] text-muted-foreground font-mono truncate">{lead.campanaId}</p>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </>
            )}
          </div>
        </ScrollArea>

        {/* ── Footer ── */}
        <Separator />
        <div className="shrink-0 px-4 py-2.5 bg-secondary/30">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Stethoscope className="w-3 h-3" />
            <span>Datos recopilados por el bot</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

// ── Sub-components ──

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
        <Stethoscope className="w-7 h-7 text-muted-foreground/40" />
      </div>
      <p className="text-sm font-semibold text-foreground">Sin datos clínicos</p>
      <p className="text-xs mt-2 text-muted-foreground max-w-[200px] leading-relaxed">
        Los síntomas aparecerán aquí cuando el paciente los reporte al bot
      </p>
    </div>
  );
}

function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className={cn('text-[10px] font-bold tabular-nums', color)}>{value}/{max}</span>
      </div>
      <div className="h-1 bg-secondary rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color.replace('text-', 'bg-'))} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ScoreDetailCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 p-2 bg-card rounded-lg border border-border">
      <div className="text-muted-foreground">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-xs font-semibold text-foreground capitalize truncate">
          {value.replace(/_/g, ' ')}
        </p>
      </div>
    </div>
  );
}
