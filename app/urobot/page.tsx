'use client';

import { useState, useMemo } from 'react';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUrobotStats, marcarAlertaRevisada, type ErrorLog, type Alerta } from '@/hooks/useUrobotStats';
import { 
  Bot, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Users, 
  MessageSquare,
  TrendingUp,
  Zap,
  RefreshCw,
  Eye,
  XCircle,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from 'recharts';

// ============================================================
// COMPONENTES
// ============================================================

function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'text-foreground',
}: { 
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-muted/50 ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ErrorsTable({ errors }: { errors: ErrorLog[] }) {
  if (errors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <CheckCircle2 className="w-12 h-12 mb-2 text-emerald-500" />
        <p>Sin errores recientes 🎉</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Hora</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Teléfono</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Tipo</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {errors.slice(0, 10).map((err) => (
            <tr key={err.id} className="border-b border-border/50 hover:bg-muted/30">
              <td className="py-2 px-3 text-xs text-muted-foreground">
                {new Date(err.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </td>
              <td className="py-2 px-3 font-mono text-xs">{err.telefono}</td>
              <td className="py-2 px-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  err.tipo_error === 'HALLUCINATION_DETECTED' ? 'bg-orange-500/20 text-orange-400' :
                  err.tipo_error === 'EMPTY_RESPONSE' ? 'bg-red-500/20 text-red-400' :
                  err.tipo_error === 'TOOL_FAILURE' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-slate-500/20 text-slate-400'
                }`}>
                  {err.tipo_error || 'Desconocido'}
                </span>
              </td>
              <td className="py-2 px-3 text-xs text-muted-foreground max-w-[200px] truncate">
                {err.detalle_error || err.razones_fallo?.join(', ') || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AlertasPanel({ alertas, onRevisar }: { alertas: Alerta[]; onRevisar: (id: string) => void }) {
  if (alertas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <CheckCircle2 className="w-12 h-12 mb-2 text-emerald-500" />
        <p>Sin alertas pendientes</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alertas.slice(0, 5).map((alerta) => (
        <div 
          key={alerta.id} 
          className={`p-3 rounded-lg border flex items-start justify-between gap-3 ${
            alerta.severidad === 'critica' ? 'border-red-500/50 bg-red-500/10' :
            alerta.severidad === 'alta' ? 'border-orange-500/50 bg-orange-500/10' :
            'border-yellow-500/50 bg-yellow-500/10'
          }`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold uppercase ${
                alerta.severidad === 'critica' ? 'text-red-400' :
                alerta.severidad === 'alta' ? 'text-orange-400' :
                'text-yellow-400'
              }`}>
                {alerta.severidad}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(alerta.created_at).toLocaleString('es-MX')}
              </span>
            </div>
            <p className="text-sm text-foreground">{alerta.tipo_alerta}</p>
            {alerta.mensaje && (
              <p className="text-xs text-muted-foreground mt-1 truncate">{alerta.mensaje}</p>
            )}
            {alerta.telefono && (
              <p className="text-xs text-muted-foreground font-mono mt-1">{alerta.telefono}</p>
            )}
          </div>
          <button
            onClick={() => onRevisar(alerta.id)}
            className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground"
            title="Marcar como revisada"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// PÁGINA PRINCIPAL
// ============================================================

export default function UrobotPage() {
  const [dias, setDias] = useState(7);
  const { stats, kpi, isLoading, refetch } = useUrobotStats(dias);

  const handleRevisarAlerta = async (alertaId: string) => {
    try {
      await marcarAlertaRevisada(alertaId);
      refetch();
    } catch (error) {
      console.error('Error al marcar alerta:', error);
    }
  };

  // Calcular estado general
  const estadoGeneral = useMemo(() => {
    if (kpi.tasaExito >= 95) return { status: 'Óptimo', color: 'text-emerald-500', bg: 'bg-emerald-500' };
    if (kpi.tasaExito >= 85) return { status: 'Estable', color: 'text-yellow-500', bg: 'bg-yellow-500' };
    return { status: 'Atención', color: 'text-red-500', bg: 'bg-red-500' };
  }, [kpi.tasaExito]);

  return (
    <PageShell
      eyebrow="Monitoreo"
      title={
        <div className="flex items-center gap-3">
          <Bot className="w-7 h-7 text-cyan-400" />
          <span>Estado de UroBot</span>
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${estadoGeneral.bg}/20 ${estadoGeneral.color}`}>
            <span className={`w-2 h-2 rounded-full ${estadoGeneral.bg} animate-pulse`} />
            {estadoGeneral.status}
          </div>
        </div>
      }
      description="Monitoreo en tiempo real del asistente virtual"
      headerSlot={
        <div className="flex items-center gap-3">
          <select
            value={dias}
            onChange={(e) => setDias(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg bg-muted border border-border text-sm"
          >
            <option value={1}>Últimas 24h</option>
            <option value={7}>Últimos 7 días</option>
            <option value={30}>Últimos 30 días</option>
          </select>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/30 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      }
    >
      {/* KPIs principales */}
      <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <KPICard
          title="Mensajes"
          value={kpi.totalMensajes.toLocaleString()}
          subtitle={`${kpi.mensajesHoy} hoy`}
          icon={MessageSquare}
          color="text-blue-400"
        />
        <KPICard
          title="Tasa Éxito"
          value={`${kpi.tasaExito}%`}
          icon={TrendingUp}
          color={kpi.tasaExito >= 90 ? 'text-emerald-400' : 'text-yellow-400'}
        />
        <KPICard
          title="Errores"
          value={kpi.totalErrores}
          subtitle={`${kpi.erroresHoy} hoy`}
          icon={XCircle}
          color={kpi.totalErrores > 0 ? 'text-red-400' : 'text-emerald-400'}
        />
        <KPICard
          title="Tiempo Resp."
          value={`${(kpi.tiempoPromedioMs / 1000).toFixed(1)}s`}
          icon={Clock}
          color={kpi.tiempoPromedioMs < 3000 ? 'text-emerald-400' : 'text-yellow-400'}
        />
        <KPICard
          title="Usuarios"
          value={kpi.usuariosUnicos}
          icon={Users}
          color="text-purple-400"
        />
        <KPICard
          title="Alertas"
          value={kpi.alertasPendientes}
          icon={AlertTriangle}
          color={kpi.alertasPendientes > 0 ? 'text-orange-400' : 'text-emerald-400'}
        />
        <KPICard
          title="Hoy"
          value={kpi.mensajesHoy}
          subtitle="mensajes"
          icon={Activity}
          color="text-cyan-400"
        />
        <KPICard
          title="Errores Hoy"
          value={kpi.erroresHoy}
          icon={Zap}
          color={kpi.erroresHoy > 0 ? 'text-red-400' : 'text-emerald-400'}
        />
      </section>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Evolución temporal */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Actividad (últimas 24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.evolucionHoras}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hora" tick={{ fontSize: 10 }} stroke="#6b7280" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="mensajes" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3} 
                    name="Mensajes"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="errores" 
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.3} 
                    name="Errores"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tipos de interacción */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tipos de Interacción
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.interaccionesPorTipo as unknown as Record<string, unknown>[]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {stats.interaccionesPorTipo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segunda fila de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Errores por tipo */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Errores por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              {stats.erroresPorTipo.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.erroresPorTipo} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10 }} stroke="#6b7280" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="#6b7280" width={100} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {stats.erroresPorTipo.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-500" />
                  Sin errores en el período
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Herramientas usadas */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Herramientas Más Usadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              {stats.herramientasUsadas.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.herramientasUsadas} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10 }} stroke="#6b7280" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} stroke="#6b7280" width={120} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {stats.herramientasUsadas.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Sin datos de herramientas
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sentiment */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sentiment de Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              {stats.sentimentDistribucion.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.sentimentDistribucion as unknown as Record<string, unknown>[]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                    >
                      {stats.sentimentDistribucion.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Sin datos de sentiment
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tablas de errores y alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Últimos errores */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400" />
              Últimos Errores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorsTable errors={stats.ultimosErrores} />
          </CardContent>
        </Card>

        {/* Alertas pendientes */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              Alertas Pendientes ({stats.alertasPendientes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AlertasPanel alertas={stats.alertasPendientes} onRevisar={handleRevisarAlerta} />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
