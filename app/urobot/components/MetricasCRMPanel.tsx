'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/app/components/metrics/MetricCard';
import type { 
  MetricasCRMResumen, 
  IntentDistribucion, 
  ConversionFunnel,
  ActividadPorHora 
} from '@/hooks/urobot/useUrobotMetricasCRM';
import { 
  MessageCircle,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  PhoneForwarded,
  TrendingUp,
  Clock,
  AlertTriangle,
  Target,
  Smile,
  Frown,
  Zap,
} from 'lucide-react';

// ============================================================
// KPIs PRINCIPALES CRM
// ============================================================

interface MetricasCRMKPIsProps {
  resumen: MetricasCRMResumen;
}

export const MetricasCRMKPIs = React.memo(function MetricasCRMKPIs({ resumen }: MetricasCRMKPIsProps) {
  return (
    <div className="space-y-2 sm:space-y-4">
      {/* Fila 1: Conversiones */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <MetricCard
          variant="kpi"
          title="Citas Agendadas"
          value={resumen.citasAgendadas}
          subtitle={`${resumen.citasAgendadasHoy} hoy`}
          iconComponent={Calendar}
          iconColor="text-emerald-400"
        />
        <MetricCard
          variant="kpi"
          title="Confirmaciones"
          value={resumen.confirmaciones}
          iconComponent={CheckCircle}
          iconColor="text-violet-400"
        />
        <MetricCard
          variant="kpi"
          title="Tasa Conversión"
          value={`${resumen.tasaConversion}%`}
          subtitle="intención → cita"
          iconComponent={Target}
          iconColor={resumen.tasaConversion >= 50 ? 'text-emerald-400' : 'text-amber-400'}
        />
        <MetricCard
          variant="kpi"
          title="Escalaciones"
          value={resumen.escalaciones}
          iconComponent={PhoneForwarded}
          iconColor={resumen.escalaciones > 5 ? 'text-amber-400' : 'text-blue-400'}
        />
      </div>

      {/* Fila 2: Volumen y Performance */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <MetricCard
          variant="kpi"
          title="Total Mensajes"
          value={resumen.totalMensajes.toLocaleString()}
          subtitle={`${resumen.mensajesHoy} hoy`}
          iconComponent={MessageCircle}
          iconColor="text-blue-400"
        />
        <MetricCard
          variant="kpi"
          title="Tiempo Respuesta"
          value={`${(resumen.avgTiempoMs / 1000).toFixed(1)}s`}
          iconComponent={Clock}
          iconColor={resumen.avgTiempoMs < 3000 ? 'text-emerald-400' : 'text-amber-400'}
        />
        <MetricCard
          variant="kpi"
          title="Cancelaciones"
          value={resumen.citasCanceladas}
          iconComponent={XCircle}
          iconColor="text-red-400"
        />
        <MetricCard
          variant="kpi"
          title="Reagendamientos"
          value={resumen.citasReagendadas}
          iconComponent={RefreshCw}
          iconColor="text-cyan-400"
        />
      </div>
    </div>
  );
});

// ============================================================
// FUNNEL DE CONVERSIÓN
// ============================================================

interface FunnelConversionProps {
  funnel: ConversionFunnel[];
}

export const FunnelConversion = React.memo(function FunnelConversion({ funnel }: FunnelConversionProps) {
  if (funnel.length === 0) return null;
  
  const maxCantidad = Math.max(...funnel.map(f => f.cantidad));

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Target className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span className="truncate">Funnel de Conversión</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 overflow-hidden">
        {funnel.map((etapa, idx) => (
          <div key={etapa.etapa} className="space-y-1 min-w-0">
            <div className="flex justify-between items-center text-xs gap-2">
              <span className="font-medium truncate min-w-0 flex-1">{etapa.etapa}</span>
              <span className="text-muted-foreground">
                {etapa.cantidad.toLocaleString()} 
                {idx > 0 && ` (${etapa.porcentaje}%)`}
              </span>
            </div>
            <div className="h-8 rounded-lg bg-muted overflow-hidden relative">
              <div 
                className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                style={{ 
                  width: `${maxCantidad > 0 ? (etapa.cantidad / maxCantidad) * 100 : 0}%`,
                  backgroundColor: etapa.color,
                  minWidth: etapa.cantidad > 0 ? '40px' : '0'
                }}
              >
                <span className="text-white text-xs font-semibold drop-shadow">
                  {etapa.cantidad}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {/* Tasa de conversión destacada */}
        {funnel.length >= 2 && funnel[0].cantidad > 0 && (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Conversión total:</span>
              <span className="text-lg font-bold text-emerald-400">
                {Math.round((funnel[1].cantidad / funnel[0].cantidad) * 100)}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// ============================================================
// DISTRIBUCIÓN DE INTENCIONES
// ============================================================

interface IntentsDistribucionProps {
  intents: IntentDistribucion[];
}

export const IntentsDistribucion = React.memo(function IntentsDistribucion({ intents }: IntentsDistribucionProps) {
  if (intents.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            ¿Qué Buscan los Usuarios?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">Sin datos</p>
        </CardContent>
      </Card>
    );
  }

  const total = intents.reduce((sum, i) => sum + i.cantidad, 0);
  const colores = [
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500',
    'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-pink-500'
  ];

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4 flex-shrink-0 text-blue-400" />
          <span className="truncate">¿Qué Buscan los Usuarios?</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden">
        {/* Barra de distribución */}
        <div className="h-6 rounded-full overflow-hidden flex mb-4">
          {intents.slice(0, 5).map((intent, idx) => (
            <div
              key={intent.intent}
              className={`${colores[idx % colores.length]} transition-all duration-300`}
              style={{ width: `${intent.porcentaje}%` }}
              title={`${intent.intent}: ${intent.porcentaje}%`}
            />
          ))}
        </div>
        
        {/* Lista de intenciones */}
        <div className="space-y-2">
          {intents.slice(0, 6).map((intent, idx) => (
            <div key={intent.intent} className="flex items-center gap-2 min-w-0">
              <div className={`w-3 h-3 flex-shrink-0 rounded-full ${colores[idx % colores.length]}`} />
              <span className="text-base flex-shrink-0">{intent.icono}</span>
              <span className="flex-1 text-xs font-medium capitalize truncate min-w-0">{intent.intent}</span>
              <span className="text-sm font-semibold flex-shrink-0">{intent.cantidad}</span>
              <span className="text-xs text-muted-foreground w-8 text-right flex-shrink-0">{intent.porcentaje}%</span>
            </div>
          ))}
        </div>
        
        {/* Total */}
        <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Total interacciones</span>
          <span className="text-sm font-semibold">{total.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
});

// ============================================================
// SENTIMENT PANEL
// ============================================================

interface SentimentPanelProps {
  positivo: number;
  negativo: number;
  urgente: number;
  neutral: number;
}

export const SentimentPanel = React.memo(function SentimentPanel({ positivo, negativo, urgente, neutral }: SentimentPanelProps) {
  const total = positivo + negativo + urgente + neutral;
  if (total === 0) return null;

  const pctPositivo = Math.round((positivo / total) * 100);
  const pctNegativo = Math.round((negativo / total) * 100);
  const pctUrgente = Math.round((urgente / total) * 100);
  const pctNeutral = Math.round((neutral / total) * 100);

  const sentiments = [
    { label: 'Positivo', value: positivo, pct: pctPositivo, icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-500' },
    { label: 'Neutral', value: neutral, pct: pctNeutral, icon: MessageCircle, color: 'text-slate-400', bg: 'bg-slate-400' },
    { label: 'Negativo', value: negativo, pct: pctNegativo, icon: Frown, color: 'text-red-500', bg: 'bg-red-500' },
    { label: 'Urgente', value: urgente, pct: pctUrgente, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500' },
  ];

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Smile className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span className="truncate">Sentiment de Usuarios</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden">
        {/* Barra de sentiment */}
        <div className="h-4 rounded-full overflow-hidden flex mb-4">
          <div className="bg-emerald-500 transition-all" style={{ width: `${pctPositivo}%` }} />
          <div className="bg-slate-400 transition-all" style={{ width: `${pctNeutral}%` }} />
          <div className="bg-red-500 transition-all" style={{ width: `${pctNegativo}%` }} />
          <div className="bg-amber-500 transition-all" style={{ width: `${pctUrgente}%` }} />
        </div>
        
        {/* Grid de sentiments */}
        <div className="grid grid-cols-2 gap-3">
          {sentiments.map(s => (
            <div key={s.label} className="flex items-center gap-2 min-w-0">
              <s.icon className={`w-4 h-4 flex-shrink-0 ${s.color}`} />
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-xs text-muted-foreground truncate">{s.label}</p>
                <p className="text-sm font-semibold truncate">{s.value} <span className="text-muted-foreground font-normal">({s.pct}%)</span></p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Score de satisfacción */}
        {total > 0 && (
          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Score de satisfacción</span>
              <span className={`text-lg font-bold ${pctPositivo >= 70 ? 'text-emerald-500' : pctPositivo >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                {pctPositivo}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// ============================================================
// HEATMAP DE ACTIVIDAD
// ============================================================

interface ActividadHeatmapProps {
  datos: ActividadPorHora[];
}

export const ActividadHeatmap = React.memo(function ActividadHeatmap({ datos }: ActividadHeatmapProps) {
  if (datos.length === 0) return null;

  const maxMensajes = Math.max(...datos.map(d => d.mensajes));
  const horaPico = datos.reduce((max, d) => d.mensajes > max.mensajes ? d : max, datos[0]);
  const horasActivas = datos.filter(d => d.mensajes > 0);
  
  // Solo mostrar de 7am a 10pm
  const horasVisibles = datos.filter(d => d.hora >= 7 && d.hora <= 22);

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Clock className="w-4 h-4 flex-shrink-0 text-amber-400" />
          <span className="truncate">Actividad por Hora</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 overflow-hidden">
        {/* Heatmap */}
        <div className="grid grid-cols-8 sm:grid-cols-16 gap-0.5 overflow-hidden">
          {horasVisibles.map((hora) => {
            const intensidad = maxMensajes > 0 ? hora.mensajes / maxMensajes : 0;
            return (
              <div
                key={hora.hora}
                className="aspect-square rounded-sm transition-colors relative group cursor-default"
                style={{
                  backgroundColor: intensidad > 0 
                    ? `rgba(59, 130, 246, ${0.15 + intensidad * 0.85})`
                    : 'var(--muted)',
                }}
                title={`${hora.hora}:00 - ${hora.mensajes} mensajes`}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 
                                opacity-0 group-hover:opacity-100 transition-opacity
                                bg-popover border border-border rounded px-2 py-1 text-[10px] 
                                whitespace-nowrap z-10 pointer-events-none shadow-lg">
                  {hora.hora}:00 → {hora.mensajes} msgs
                  {hora.agendadas > 0 && ` (${hora.agendadas} citas)`}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Leyenda */}
        <div className="flex justify-between text-[10px] text-muted-foreground px-1">
          <span>7am</span>
          <span>12pm</span>
          <span>5pm</span>
          <span>10pm</span>
        </div>

        {/* Stats */}
        <div className="pt-2 border-t border-border grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">Hora pico</p>
            <p className="text-sm font-semibold">{horaPico.hora}:00 <span className="text-muted-foreground font-normal">({horaPico.mensajes} msgs)</span></p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">Horas activas</p>
            <p className="text-sm font-semibold">{horasActivas.length} <span className="text-muted-foreground font-normal">de 24</span></p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
