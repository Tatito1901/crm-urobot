'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { spacing, cards } from '@/app/lib/design-system';
import { Skeleton } from '@/app/components/common/SkeletonLoader';
import { 
  useImpactStats, 
  formatTiempoRespuesta, 
  formatVariacion, 
  getVariacionColor,
  type CanalRendimiento 
} from '@/hooks/estadisticas/useImpactStats';
import { 
  TrendingUp, 
  TrendingDown, 
  Bot, 
  Target, 
  Clock, 
  Users, 
  MessageSquare,
  Zap,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Repeat
} from 'lucide-react';

// Lazy load de gráficos
const TrendChart = dynamic(
  () => import('./components/TrendChart').then(mod => ({ default: mod.TrendChart })),
  { loading: () => <Skeleton className="h-[250px] w-full" />, ssr: false }
);

const ChannelBarChart = dynamic(
  () => import('./components/ChannelBarChart').then(mod => ({ default: mod.ChannelBarChart })),
  { loading: () => <Skeleton className="h-[300px] w-full" />, ssr: false }
);

// ============================================================
// COMPONENTES DE MÉTRICAS
// ============================================================

function ComparativaCard({ 
  titulo, 
  valorActual, 
  valorAnterior, 
  variacion, 
  icon: Icon,
  formato = 'numero'
}: { 
  titulo: string; 
  valorActual: number; 
  valorAnterior: number; 
  variacion: number;
  icon: React.ElementType;
  formato?: 'numero' | 'porcentaje';
}) {
  const isPositive = variacion >= 0;
  const displayValue = formato === 'porcentaje' ? `${valorActual}%` : valorActual.toLocaleString('es-MX');

  return (
    <div className="bg-card border border-border rounded-xl p-3 sm:p-4 hover:border-primary/30 transition-all">
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="p-1.5 sm:p-2 bg-primary/15 rounded-lg">
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
          isPositive 
            ? 'bg-emerald-500/15 text-emerald-400' 
            : 'bg-red-500/15 text-red-400'
        }`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {formatVariacion(variacion)}
        </div>
      </div>
      <div className="text-xl sm:text-2xl font-bold text-foreground mb-0.5 sm:mb-1">{displayValue}</div>
      <div className="text-[10px] sm:text-xs text-muted-foreground">{titulo}</div>
      <div className="text-[9px] sm:text-[10px] text-muted-foreground/70 mt-0.5 sm:mt-1">
        Mes anterior: {formato === 'porcentaje' ? `${valorAnterior}%` : valorAnterior.toLocaleString('es-MX')}
      </div>
    </div>
  );
}

function ImpactoUrobotCard({ 
  titulo, 
  valor, 
  subtitulo, 
  icon: Icon,
  highlight = false
}: { 
  titulo: string; 
  valor: string | number; 
  subtitulo: string;
  icon: React.ElementType;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl p-3 sm:p-4 border transition-all ${
      highlight 
        ? 'bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/20' 
        : 'bg-card border-border hover:border-primary/30'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${highlight ? 'text-cyan-400' : 'text-muted-foreground'}`} />
        <span className={`text-[11px] font-medium uppercase tracking-wide ${
          highlight ? 'text-cyan-300' : 'text-muted-foreground'
        }`}>{titulo}</span>
      </div>
      <div className={`text-xl sm:text-2xl font-bold ${highlight ? 'text-cyan-300' : 'text-foreground'}`}>
        {valor}
      </div>
      <div className="text-[11px] text-muted-foreground mt-1">{subtitulo}</div>
    </div>
  );
}

function EficienciaBar({ 
  label, 
  valor, 
  colorClass = 'bg-primary'
}: { 
  label: string; 
  valor: number;
  colorClass?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-bold text-foreground">{valor}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(valor, 100)}%` }}
        />
      </div>
    </div>
  );
}

function CanalRow({ canal }: { canal: CanalRendimiento }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-foreground truncate">{canal.canal}</div>
        <div className="text-xs text-muted-foreground">
          {canal.leads_total} leads → {canal.leads_convertidos} convertidos
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right">
          <div className="text-sm font-bold text-emerald-400">
            {canal.tasa_conversion}%
          </div>
          <div className="text-[10px] text-muted-foreground">conversión</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-foreground">
            {canal.consultas_completadas}
          </div>
          <div className="text-[10px] text-muted-foreground">consultas</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PÁGINA PRINCIPAL
// ============================================================

export default function ImpactoPage() {
  const { 
    loading, 
    refresh,
    rendimientoCanales,
    impactoUrobot,
    comparativaMensual,
    eficiencia,
    evolucion6Meses
  } = useImpactStats();

  if (loading) {
    return (
      <PageShell 
        title="Impacto y Rendimiento" 
        eyebrow="Cargando..."
        description="Analizando métricas..."
        fullWidth
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </PageShell>
    );
  }

  const { mesActual, mesAnterior, variaciones } = comparativaMensual;

  return (
    <PageShell
      accent
      fullWidth
      eyebrow="Business Intelligence"
      title="Impacto y Rendimiento"
      description="Métricas que demuestran el valor de tu consulta con Urobot"
      headerSlot={
        <button
          onClick={() => refresh()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 text-primary text-sm font-medium hover:bg-primary/25 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      }
    >
      {/* ============================================================ */}
      {/* SECCIÓN 1: COMPARATIVA MES ACTUAL VS ANTERIOR */}
      {/* ============================================================ */}
      <section className="mb-4 sm:mb-8">
        <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 sm:mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Comparativa: {mesActual.periodo} vs {mesAnterior.periodo}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <ComparativaCard
            titulo="Consultas Programadas"
            valorActual={mesActual.consultasProgramadas}
            valorAnterior={mesAnterior.consultasProgramadas}
            variacion={variaciones.consultas}
            icon={Calendar}
          />
          <ComparativaCard
            titulo="Pacientes Nuevos"
            valorActual={mesActual.pacientesNuevos}
            valorAnterior={mesAnterior.pacientesNuevos}
            variacion={variaciones.pacientes}
            icon={Users}
          />
          <ComparativaCard
            titulo="Leads Captados"
            valorActual={mesActual.leadsNuevos}
            valorAnterior={mesAnterior.leadsNuevos}
            variacion={variaciones.leads}
            icon={Target}
          />
          <ComparativaCard
            titulo="Leads Convertidos"
            valorActual={mesActual.leadsConvertidos}
            valorAnterior={mesAnterior.leadsConvertidos}
            variacion={mesAnterior.leadsConvertidos > 0 
              ? Math.round((mesActual.leadsConvertidos - mesAnterior.leadsConvertidos) / mesAnterior.leadsConvertidos * 100) 
              : 0}
            icon={CheckCircle2}
          />
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECCIÓN 2: IMPACTO DE UROBOT */}
      {/* ============================================================ */}
      <section className="mb-4 sm:mb-8">
        <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 sm:mb-4 flex items-center gap-2">
          <Bot className="w-4 h-4 text-cyan-500" />
          Impacto de Urobot este mes
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
          <ImpactoUrobotCard
            titulo="Usuarios Atendidos"
            valor={impactoUrobot.usuariosUnicos}
            subtitulo="personas únicas"
            icon={Users}
            highlight
          />
          <ImpactoUrobotCard
            titulo="Mensajes Procesados"
            valor={impactoUrobot.mensajesAtendidos.toLocaleString('es-MX')}
            subtitulo="respuestas automáticas"
            icon={MessageSquare}
          />
          <ImpactoUrobotCard
            titulo="Citas por Bot"
            valor={impactoUrobot.citasAgendadasBot}
            subtitulo="agendadas sin intervención"
            icon={Calendar}
            highlight
          />
          <ImpactoUrobotCard
            titulo="Fuera de Horario"
            valor={impactoUrobot.mensajesFueraHorario}
            subtitulo="atendidos 24/7"
            icon={Clock}
          />
          <ImpactoUrobotCard
            titulo="Tiempo Respuesta"
            valor={formatTiempoRespuesta(impactoUrobot.tiempoPromedioRespuestaMs)}
            subtitulo="promedio de respuesta"
            icon={Zap}
          />
          <ImpactoUrobotCard
            titulo="Tasa de Éxito"
            valor={`${impactoUrobot.tasaExito}%`}
            subtitulo="sin errores"
            icon={CheckCircle2}
          />
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECCIÓN 3: RENDIMIENTO POR CANAL + EFICIENCIA */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-8">
        {/* Rendimiento por Canal */}
        <Card className={cards.base}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              Rendimiento por Canal de Marketing
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Conversión de leads a consultas por fuente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rendimientoCanales.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Sin datos de canales aún
              </div>
            ) : (
              <div className="divide-y divide-border">
                {rendimientoCanales.slice(0, 6).map((canal) => (
                  <CanalRow key={canal.canal} canal={canal} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Métricas de Eficiencia */}
        <Card className={cards.base}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500" />
              Eficiencia Operativa
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Indicadores clave de rendimiento de la consulta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <EficienciaBar 
              label="Tasa de Confirmación" 
              valor={eficiencia.tasaConfirmacion}
              colorClass="bg-gradient-to-r from-emerald-500 to-green-400"
            />
            <EficienciaBar 
              label="Tasa de Asistencia" 
              valor={eficiencia.tasaAsistencia}
              colorClass="bg-gradient-to-r from-blue-500 to-indigo-400"
            />
            <EficienciaBar 
              label="Tasa de Cancelación" 
              valor={eficiencia.tasaCancelacion}
              colorClass="bg-gradient-to-r from-red-500 to-rose-400"
            />
            
            {/* Métricas adicionales */}
            <div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Repeat className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase tracking-wide">Recurrentes</span>
                </div>
                <div className="text-xl font-bold text-foreground">{eficiencia.pacientesRecurrentes}</div>
                <div className="text-[10px] text-muted-foreground">pacientes fieles</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase tracking-wide">Promedio</span>
                </div>
                <div className="text-xl font-bold text-foreground">{eficiencia.promedioConsultasPorPaciente || 0}</div>
                <div className="text-[10px] text-muted-foreground">consultas/paciente</div>
              </div>
            </div>

            {eficiencia.tiempoPromedioConversion && (
              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Tiempo lead → cita
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    ~{eficiencia.tiempoPromedioConversion} días
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ============================================================ */}
      {/* SECCIÓN 4: GRÁFICO DE TENDENCIA */}
      {/* ============================================================ */}
      <Card className={cards.base}>
        <CardHeader className={spacing.cardHeader}>
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            Evolución de Consultas (6 meses)
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Tendencia histórica de crecimiento de tu consulta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TrendChart data={evolucion6Meses} />
        </CardContent>
      </Card>

      {/* ============================================================ */}
      {/* SECCIÓN 5: RESUMEN DE VALOR */}
      {/* ============================================================ */}
      <div className="mt-4 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/20 rounded-2xl">
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
          <Bot className="w-5 h-5 text-cyan-400" />
          Resumen de Valor - Urobot
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-cyan-300">
              {impactoUrobot.mensajesFueraHorario}
            </div>
            <div className="text-sm text-muted-foreground">
              Pacientes atendidos fuera de horario laboral que habrían esperado hasta el día siguiente
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-cyan-300">
              {formatTiempoRespuesta(impactoUrobot.tiempoPromedioRespuestaMs)}
            </div>
            <div className="text-sm text-muted-foreground">
              Tiempo de respuesta promedio vs ~30min-2hrs de respuesta manual
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-cyan-300">
              24/7
            </div>
            <div className="text-sm text-muted-foreground">
              Disponibilidad continua para agendar citas y resolver dudas
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
