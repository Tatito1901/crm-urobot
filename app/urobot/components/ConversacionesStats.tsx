'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/app/components/metrics/MetricCard';
import type { ConversacionesKPI, TipoInteraccion, TopPregunta, MensajesPorHora } from '@/hooks/conversaciones/useConversacionesStats';
import { 
  MessageCircle,
  Send,
  Users,
  Clock,
  Calendar,
  HelpCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Bot,
  UserCheck,
} from 'lucide-react';

// ============================================================
// KPIs DE CONVERSACIONES
// ============================================================

interface ConversacionesKPIsProps {
  kpi: ConversacionesKPI;
}

export const ConversacionesKPIs = React.memo(function ConversacionesKPIs({ kpi }: ConversacionesKPIsProps) {
  return (
    <div className="space-y-2 sm:space-y-4">
      {/* Fila principal: Mensajes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <MetricCard
          variant="kpi"
          title="Mensajes Recibidos"
          value={kpi.totalMensajesRecibidos.toLocaleString()}
          subtitle={`${kpi.mensajesRecibidosHoy} hoy`}
          iconComponent={ArrowDownLeft}
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <MetricCard
          variant="kpi"
          title="Mensajes Enviados"
          value={kpi.totalMensajesEnviados.toLocaleString()}
          subtitle={`${kpi.mensajesEnviadosHoy} hoy`}
          iconComponent={ArrowUpRight}
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <MetricCard
          variant="kpi"
          title="Conversaciones"
          value={kpi.totalConversaciones.toLocaleString()}
          subtitle={`${kpi.conversacionesHoy} hoy`}
          iconComponent={MessageCircle}
          iconColor="text-purple-600 dark:text-purple-400"
        />
        <MetricCard
          variant="kpi"
          title="Tasa Respuesta"
          value={`${kpi.tasaRespuesta}%`}
          iconComponent={TrendingUp}
          iconColor={kpi.tasaRespuesta >= 90 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}
        />
      </div>

      {/* Fila secundaria: UroBot */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <MetricCard
          variant="kpi"
          title="Preguntas Respondidas"
          value={kpi.preguntasRespondidas.toLocaleString()}
          iconComponent={HelpCircle}
          iconColor="text-cyan-600 dark:text-cyan-400"
        />
        <MetricCard
          variant="kpi"
          title="Citas por Bot"
          value={kpi.citasAgendadasPorBot}
          iconComponent={Calendar}
          iconColor="text-violet-600 dark:text-violet-400"
        />
        <MetricCard
          variant="kpi"
          title="Usuarios Recurrentes"
          value={kpi.usuariosRecurrentes}
          iconComponent={UserCheck}
          iconColor="text-indigo-600 dark:text-indigo-400"
        />
        <MetricCard
          variant="kpi"
          title="Tiempo Respuesta"
          value={`${(kpi.tiempoRespuestaPromedio / 1000).toFixed(1)}s`}
          iconComponent={Clock}
          iconColor={kpi.tiempoRespuestaPromedio < 3000 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}
        />
      </div>
    </div>
  );
});

// ============================================================
// RESUMEN VISUAL DE MENSAJES
// ============================================================

interface MensajesResumenProps {
  recibidos: number;
  enviados: number;
  conversaciones: number;
}

export const MensajesResumen = React.memo(function MensajesResumen({ recibidos, enviados, conversaciones }: MensajesResumenProps) {
  const total = recibidos + enviados;
  const porcentajeRecibidos = total > 0 ? (recibidos / total) * 100 : 50;
  
  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Bot className="w-4 h-4 flex-shrink-0 text-cyan-600 dark:text-cyan-400" />
          <span className="truncate">Resumen de Actividad</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 overflow-hidden">
        {/* Barra visual */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Recibidos: {recibidos.toLocaleString()}</span>
            <span>Enviados: {enviados.toLocaleString()}</span>
          </div>
          <div className="h-4 rounded-full bg-muted overflow-hidden flex">
            <div 
              className="bg-blue-500 dark:bg-blue-400 transition-all duration-500"
              style={{ width: `${porcentajeRecibidos}%` }}
            />
            <div 
              className="bg-emerald-500 dark:bg-emerald-400 transition-all duration-500"
              style={{ width: `${100 - porcentajeRecibidos}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {porcentajeRecibidos.toFixed(0)}% entrantes
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {(100 - porcentajeRecibidos).toFixed(0)}% salientes
            </span>
          </div>
        </div>

        {/* Stats rápidos */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold text-foreground">{total.toLocaleString()}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide">Total mensajes</p>
          </div>
          <div className="text-center border-x border-border">
            <p className="text-lg sm:text-2xl font-bold text-foreground">{conversaciones}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide">Contactos</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold text-foreground">
              {conversaciones > 0 ? Math.round(total / conversaciones) : 0}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Msgs/contacto</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// ============================================================
// TIPOS DE INTERACCIÓN
// ============================================================

interface TiposInteraccionCardProps {
  tipos: TipoInteraccion[];
}

export const TiposInteraccionCard = React.memo(function TiposInteraccionCard({ tipos }: TiposInteraccionCardProps) {
  if (tipos.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tipos de Interacción
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">Sin datos</p>
        </CardContent>
      </Card>
    );
  }

  const maxCantidad = Math.max(...tipos.map(t => t.cantidad));

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <HelpCircle className="w-4 h-4 flex-shrink-0 text-purple-600 dark:text-purple-400" />
          <span className="truncate">Tipos de Interacción</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 overflow-hidden">
        {tipos.map((tipo) => (
          <div key={tipo.tipo} className="space-y-1 min-w-0">
            <div className="flex justify-between items-center text-xs gap-2">
              <span className="font-medium truncate min-w-0 flex-1">{tipo.tipo}</span>
              <span className="text-muted-foreground flex-shrink-0">{tipo.cantidad} ({tipo.porcentaje}%)</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-violet-500 dark:from-purple-400 dark:to-violet-400 rounded-full transition-all duration-500"
                style={{ width: `${(tipo.cantidad / maxCantidad) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
});

// ============================================================
// TOP PREGUNTAS
// ============================================================

interface TopPreguntasCardProps {
  preguntas: TopPregunta[];
}

export const TopPreguntasCard = React.memo(function TopPreguntasCard({ preguntas }: TopPreguntasCardProps) {
  if (preguntas.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Temas Más Consultados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">Sin datos suficientes</p>
        </CardContent>
      </Card>
    );
  }

  const colores = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-purple-500',
    'bg-rose-500',
    'bg-cyan-500',
  ];

  const total = preguntas.reduce((sum, p) => sum + p.cantidad, 0);

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="truncate">Temas Más Consultados</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 overflow-hidden">
        {preguntas.slice(0, 6).map((pregunta, idx) => {
          const porcentaje = total > 0 ? Math.round((pregunta.cantidad / total) * 100) : 0;
          return (
            <div key={pregunta.categoria} className="flex items-center gap-2 min-w-0">
              <div className={`w-3 h-3 flex-shrink-0 rounded-full ${colores[idx % colores.length]}`} />
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-xs font-medium truncate">{pregunta.categoria}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold">{pregunta.cantidad}</p>
                <p className="text-[10px] text-muted-foreground">{porcentaje}%</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
});

// ============================================================
// ACTIVIDAD POR HORA (Mini heatmap)
// ============================================================

interface ActividadPorHoraProps {
  datos: MensajesPorHora[];
}

export const ActividadPorHora = React.memo(function ActividadPorHora({ datos }: ActividadPorHoraProps) {
  if (datos.length === 0) return null;

  const maxTotal = Math.max(...datos.map(d => d.recibidos + d.enviados));
  
  // Solo mostrar horas con actividad
  const horasActivas = datos.filter(d => d.recibidos + d.enviados > 0);
  
  // Encontrar hora pico
  const horaPico = datos.reduce((max, d) => 
    (d.recibidos + d.enviados) > (max.recibidos + max.enviados) ? d : max
  , datos[0]);

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Clock className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="truncate">Actividad por Hora</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 overflow-hidden">
        {/* Mini heatmap */}
        <div className="grid grid-cols-12 gap-0.5">
          {datos.slice(6, 22).map((hora) => {
            const total = hora.recibidos + hora.enviados;
            const intensidad = maxTotal > 0 ? total / maxTotal : 0;
            return (
              <div
                key={hora.hora}
                className="aspect-square rounded-sm transition-colors relative group"
                style={{
                  backgroundColor: intensidad > 0 
                    ? `rgba(59, 130, 246, ${0.1 + intensidad * 0.8})`
                    : 'var(--muted)',
                }}
                title={`${hora.hora}: ${total} mensajes`}
              >
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 
                                opacity-0 group-hover:opacity-100 transition-opacity
                                bg-popover border border-border rounded px-2 py-1 text-[10px] 
                                whitespace-nowrap z-10 pointer-events-none shadow-lg">
                  {hora.hora}: {total}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>6:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>22:00</span>
        </div>

        {/* Hora pico */}
        {horaPico && (
          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Hora pico:</span>
            <span className="text-sm font-semibold text-foreground">
              {horaPico.hora} ({horaPico.recibidos + horaPico.enviados} msgs)
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
