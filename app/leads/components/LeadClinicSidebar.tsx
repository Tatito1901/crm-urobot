'use client';

import React, { useState, useCallback } from 'react';
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
  Brain,
  TrendingUp,
  Target,
  Megaphone,
  ExternalLink,
  ShieldCheck,
  Lightbulb,
  MessageCircle,
  Phone,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
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
import { SidebarChatViewer } from './SidebarChatViewer';

// ── Temperature config ──
const TEMP_CONFIG: Record<string, { bg: string; text: string; label: string; ring: string }> = {
  frio:         { bg: 'bg-blue-500',    text: 'text-blue-400',  label: 'Frío',         ring: 'ring-blue-500/30' },
  tibio:        { bg: 'bg-amber-500',   text: 'text-amber-400', label: 'Tibio',        ring: 'ring-amber-500/30' },
  caliente:     { bg: 'bg-rose-500',    text: 'text-rose-400',  label: 'Caliente',     ring: 'ring-rose-500/30' },
  muy_caliente: { bg: 'bg-red-600',     text: 'text-red-400',   label: 'Muy caliente', ring: 'ring-red-500/30' },
  urgente:      { bg: 'bg-red-600',     text: 'text-red-400',   label: 'Urgente',      ring: 'ring-red-500/40' },
};


interface LeadClinicSidebarProps {
  lead: Lead;
  onClose: () => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  onRefresh?: () => void;
}

type SidebarTab = 'resumen' | 'conversacion';

export function LeadClinicSidebar({ lead, onClose, onNavigate, hasPrev, hasNext, onRefresh }: LeadClinicSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('resumen');
  const [copiado, setCopiado] = useState(false);
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

  const tempCfg = TEMP_CONFIG[lead.temperatura] ?? TEMP_CONFIG.frio;

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

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleCopyPhone = useCallback(async () => {
    await navigator.clipboard.writeText(lead.telefono);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }, [lead.telefono]);

  const whatsappUrl = `https://wa.me/52${lead.telefono.replace(/\D/g, '')}`;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col h-full bg-card w-full">

        {/* ── Header ── */}
        <div className="shrink-0 border-b border-border">
          {/* Top bar: nav + close */}
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-1">
              {onNavigate && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onNavigate('prev')}
                        disabled={!hasPrev}
                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">Lead anterior</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onNavigate('next')}
                        disabled={!hasNext}
                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">Siguiente lead</TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="text-xs">Cerrar (Esc)</TooltipContent>
            </Tooltip>
          </div>

          {/* Profile card */}
          <div className="px-4 pb-3">
            <div className="flex items-start gap-3">
              {/* Avatar with temperature ring */}
              <div className={cn('relative shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold ring-2', tempCfg.bg, tempCfg.ring)}>
                {getInitials(lead.nombreDisplay)}
                {/* Score badge */}
                {lead.scoreTotal > 0 && (
                  <div className={cn(
                    'absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-card',
                    lead.scoreTotal >= 70 ? 'bg-emerald-500 text-white' :
                    lead.scoreTotal >= 40 ? 'bg-amber-500 text-white' :
                    'bg-muted text-muted-foreground'
                  )}>
                    {lead.scoreTotal}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-foreground truncate leading-tight">
                  {lead.nombreDisplay}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <button
                    onClick={handleCopyPhone}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono group"
                  >
                    {lead.telefono}
                    {copiado
                      ? <Check className="w-3 h-3 text-emerald-500" />
                      : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    }
                  </button>
                </div>
                {/* Estado + Temperatura badges */}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                    lead.esEnPipeline ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                  )}>
                    {lead.estadoDisplay}
                  </span>
                  <span className={cn(
                    'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                    `${tempCfg.bg}/15 ${tempCfg.text}`
                  )}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', tempCfg.bg)} />
                    {tempCfg.label}
                  </span>
                  {lead.esMetaAds && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400">
                      AD
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick stats strip */}
          <div className="grid grid-cols-4 border-t border-border divide-x divide-border">
            <QuickStat label="Score" value={lead.scoreTotal > 0 ? String(lead.scoreTotal) : '—'} color={lead.scoreTotal >= 70 ? 'text-emerald-400' : lead.scoreTotal >= 40 ? 'text-amber-400' : undefined} />
            <QuickStat label="Msgs" value={String(lead.totalMensajes)} />
            <QuickStat label="Días" value={lead.diasDesdeUltimaInteraccion === null ? '—' : lead.diasDesdeUltimaInteraccion === 0 ? 'Hoy' : `${lead.diasDesdeUltimaInteraccion}d`} color={lead.diasDesdeUltimaInteraccion !== null && lead.diasDesdeUltimaInteraccion > 3 ? 'text-amber-400' : undefined} />
            <QuickStat label="Fuente" value={lead.fuente === 'Meta Ads' ? 'Meta' : lead.fuente === 'WhatsApp Directo' ? 'WA' : lead.fuente === 'Google Ads' ? 'Google' : lead.fuente.slice(0, 6)} />
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="shrink-0 px-2 bg-secondary/20 border-b border-border">
          <div className="flex gap-0.5 py-1">
            <TabPill active={activeTab === 'resumen'} onClick={() => setActiveTab('resumen')} icon={<Stethoscope className="w-3.5 h-3.5" />} label="Resumen" />
            <TabPill active={activeTab === 'conversacion'} onClick={() => setActiveTab('conversacion')} icon={<MessageCircle className="w-3.5 h-3.5" />} label="Chat" badge={lead.totalMensajes > 0 ? lead.totalMensajes : undefined} />
          </div>
        </div>

        {/* ── Tab content ── */}
        {activeTab === 'conversacion' ? (
          <div className="flex-1 overflow-hidden">
            <SidebarChatViewer telefono={lead.telefono} nombreDisplay={lead.nombreDisplay} />
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
                  <span className="text-xs text-muted-foreground">Cargando datos clínicos…</span>
                </div>
              ) : !hasData ? (
                <SidebarEmptyState />
              ) : (
                <>
                  {/* ── Urgencia alert ── */}
                  {clinico?.es_urgencia_medica && (
                    <div className="flex items-center gap-2.5 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg animate-in fade-in duration-300">
                      <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="text-xs font-semibold text-red-400">Urgencia médica detectada</span>
                    </div>
                  )}

                  <Accordion type="multiple" defaultValue={defaultOpenSections} className="space-y-1.5">
                    {/* Síntomas reportados */}
                    {clinico?.sintomas_reportados && clinico.sintomas_reportados.length > 0 && (
                      <AccordionItem value="sintomas" className="border-none rounded-lg bg-secondary/50 px-3">
                        <AccordionTrigger className="py-2.5 hover:no-underline gap-2">
                          <div className="flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                            <span className="text-xs font-semibold text-foreground">Síntomas</span>
                            <Badge variant="default" className="text-xs px-2 py-0 h-5 rounded-md">{clinico.sintomas_reportados.length}</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 pt-0">
                          <div className="flex flex-wrap gap-1.5">
                            {clinico.sintomas_reportados.map((s, i) => (
                              <Badge key={i} variant="default" className="text-xs font-medium rounded-md px-2 py-0.5">{s}</Badge>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {/* Banderas rojas */}
                    {clinico?.banderas_rojas && clinico.banderas_rojas.length > 0 && (
                      <AccordionItem value="banderas" className="border-none rounded-lg bg-red-500/5 px-3">
                        <AccordionTrigger className="py-2.5 hover:no-underline gap-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            <span className="text-xs font-semibold text-foreground">Banderas rojas</span>
                            <Badge variant="destructive" className="text-xs px-2 py-0 h-5 rounded-md">{clinico.banderas_rojas.length}</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 pt-0">
                          <div className="flex flex-wrap gap-1.5">
                            {clinico.banderas_rojas.map((b, i) => (
                              <Badge key={i} variant="destructive" className="text-xs font-medium rounded-md px-2 py-0.5">
                                <AlertTriangle className="w-3 h-3 mr-1" />{b}
                              </Badge>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {/* Zona afectada */}
                    {clinico?.zona_afectada && (
                      <AccordionItem value="zona" className="border-none rounded-lg bg-secondary/50 px-3">
                        <AccordionTrigger className="py-2.5 hover:no-underline gap-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="text-xs font-semibold text-foreground">Zona afectada</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 pt-0">
                          <p className="text-sm text-muted-foreground leading-relaxed">{clinico.zona_afectada}</p>
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {/* Tiempo de evolución */}
                    {clinico?.tiempo_evolucion && (
                      <AccordionItem value="tiempo" className="border-none rounded-lg bg-secondary/50 px-3">
                        <AccordionTrigger className="py-2.5 hover:no-underline gap-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="text-xs font-semibold text-foreground">Tiempo de evolución</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 pt-0">
                          <p className="text-sm text-muted-foreground leading-relaxed">{clinico.tiempo_evolucion}</p>
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {/* Resumen del caso */}
                    {clinico?.resumen_caso && (
                      <AccordionItem value="resumen" className="border-none rounded-lg bg-secondary/50 px-3">
                        <AccordionTrigger className="py-2.5 hover:no-underline gap-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <span className="text-xs font-semibold text-foreground">Resumen del caso</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 pt-0">
                          <p className="text-sm text-muted-foreground leading-relaxed">{clinico.resumen_caso}</p>
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {/* Score del lead */}
                    {lead.scoreTotal > 0 && (
                      <AccordionItem value="score" className="border-none rounded-lg bg-secondary/50 px-3">
                        <AccordionTrigger className="py-2.5 hover:no-underline gap-2">
                          <div className="flex items-center gap-2">
                            <HeartPulse className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="text-xs font-semibold text-foreground">Score</span>
                            <Badge
                              variant={lead.scoreTotal >= 70 ? 'success' : lead.scoreTotal >= 40 ? 'warning' : 'secondary'}
                              className="text-xs px-2 py-0 h-5 rounded-md font-bold"
                            >
                              {lead.scoreTotal}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 pt-0">
                          <div className="space-y-3">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground font-medium">Score total</span>
                                <span className={cn(
                                  'text-sm font-bold tabular-nums',
                                  lead.scoreTotal >= 70 ? 'text-emerald-500' :
                                  lead.scoreTotal >= 40 ? 'text-amber-500' : 'text-muted-foreground'
                                )}>{lead.scoreTotal}/100</span>
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
                            {lead.scores && (
                              <div className="space-y-2">
                                <ScoreBar label="Clínico" value={lead.scores.clinical} max={30} color="text-teal-500" />
                                <ScoreBar label="Intención" value={lead.scores.intent} max={35} color="text-blue-500" />
                                <ScoreBar label="Engagement" value={lead.scores.engagement} max={20} color="text-violet-500" />
                                <ScoreBar label="BANT" value={lead.scores.bant} max={15} color="text-amber-500" />
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {/* Perfil Behavioral */}
                    {lead.signals && (
                      <AccordionItem value="behavioral" className="border-none rounded-lg bg-violet-500/5 px-3">
                        <AccordionTrigger className="py-2.5 hover:no-underline gap-2">
                          <div className="flex items-center gap-2">
                            <Brain className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                            <span className="text-xs font-semibold text-foreground">Behavioral</span>
                            {lead.signals.prediccion_conversion && (
                              <Badge
                                variant={lead.signals.prediccion_conversion === 'alta' ? 'success' : lead.signals.prediccion_conversion === 'media' ? 'warning' : 'secondary'}
                                className="text-xs px-2 py-0 h-5 rounded-md"
                              >
                                {lead.signals.prediccion_conversion}
                              </Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 pt-0">
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              {lead.signals.perfil_paciente && (
                                <InfoCard icon={<Target className="w-3.5 h-3.5" />} label="Perfil" value={lead.signals.perfil_paciente} />
                              )}
                              {lead.signals.prediccion_conversion && (
                                <InfoCard icon={<TrendingUp className="w-3.5 h-3.5" />} label="Conversión" value={lead.signals.prediccion_conversion} />
                              )}
                            </div>
                            {lead.signals.nivel_compromiso !== null && (
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground font-medium">Compromiso</span>
                                  <span className="text-xs font-bold tabular-nums text-violet-500">{lead.signals.nivel_compromiso}/10</span>
                                </div>
                                <Progress value={lead.signals.nivel_compromiso * 10} className="h-1.5 [&>[data-slot=progress-indicator]]:bg-violet-500" />
                              </div>
                            )}
                            {lead.signals.barrera_principal && (
                              <div className="flex items-center gap-2 px-2.5 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Barrera</p>
                                  <p className="text-xs font-semibold text-foreground capitalize">{lead.signals.barrera_principal.replace(/_/g, ' ')}</p>
                                </div>
                              </div>
                            )}
                            {lead.signals.emociones.length > 0 && (
                              <div className="space-y-1.5">
                                <span className="text-xs text-muted-foreground font-medium block">Emociones</span>
                                <div className="flex flex-wrap gap-1">
                                  {lead.signals.emociones.map((emo, i) => (
                                    <Badge key={i} variant="outline" className="text-xs px-2 py-0 h-6 rounded-md capitalize">{emo}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {lead.signals.incentivo_sugerido && (
                              <div className="flex items-center gap-2 px-2.5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                <Lightbulb className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Incentivo</p>
                                  <p className="text-xs font-semibold text-foreground capitalize">{lead.signals.incentivo_sugerido.replace(/_/g, ' ')}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {/* Meta Ads */}
                    {lead.esMetaAds && (
                      <AccordionItem value="metaads" className="border-none rounded-lg bg-blue-500/5 px-3">
                        <AccordionTrigger className="py-2.5 hover:no-underline gap-2">
                          <div className="flex items-center gap-2">
                            <Megaphone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="text-xs font-semibold text-foreground">Meta Ads</span>
                            <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 rounded bg-blue-500/20 text-blue-400 border-0">AD</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 pt-0">
                          <div className="space-y-2">
                            {lead.campanaHeadline && (
                              <div className="space-y-0.5">
                                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Headline</span>
                                <p className="text-xs font-semibold text-foreground">{lead.campanaHeadline}</p>
                              </div>
                            )}
                            {lead.campanaUrl && (
                              <div className="space-y-0.5">
                                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">URL</span>
                                <a href={lead.campanaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors truncate">
                                  <ExternalLink className="w-3 h-3 shrink-0" /><span className="truncate">{lead.campanaUrl}</span>
                                </a>
                              </div>
                            )}
                            {lead.ctwaClid && (
                              <div className="space-y-0.5">
                                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Click ID</span>
                                <p className="text-xs text-muted-foreground font-mono truncate">{lead.ctwaClid}</p>
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
        )}

        {/* ── Footer: Quick actions ── */}
        <div className="shrink-0 border-t border-border px-3 py-2.5 bg-secondary/20">
          <div className="flex items-center gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/15 text-emerald-400 text-xs font-semibold rounded-lg hover:bg-emerald-500/25 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              WhatsApp
            </a>
            <a
              href={`/conversaciones?search=${lead.telefono}`}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary/10 text-primary text-xs font-semibold rounded-lg hover:bg-primary/20 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver completo
            </a>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

// ── Sub-components ──

function QuickStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col items-center py-2 px-1">
      <span className={cn('text-xs font-bold tabular-nums', color || 'text-foreground')}>{value}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

function TabPill({ active, onClick, icon, label, badge }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-lg transition-all',
        active
          ? 'bg-card text-foreground shadow-sm border border-border'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
      )}
    >
      {icon}
      {label}
      {badge !== undefined && (
        <span className={cn(
          'text-[9px] font-bold tabular-nums px-1.5 rounded-full min-w-[18px] text-center',
          active ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
        )}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}

function SidebarEmptyState() {
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
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] sm:text-xs text-muted-foreground font-medium">{label}</span>
        <span className={cn('text-[11px] sm:text-xs font-bold tabular-nums', color)}>{value}/{max}</span>
      </div>
      <div className="h-1 bg-secondary rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color.replace('text-', 'bg-'))} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-card rounded-lg border border-border">
      <div className="text-muted-foreground">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-xs font-semibold text-foreground capitalize truncate">{value.replace(/_/g, ' ')}</p>
      </div>
    </div>
  );
}
