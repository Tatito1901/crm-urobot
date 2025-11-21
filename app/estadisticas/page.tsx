'use client';

import { useStats, KPIData } from '@/hooks/useStats';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cards, spacing, typography } from '@/app/lib/design-system';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  Legend
} from 'recharts';
import { 
  Users, 
  Calendar, 
  Target, 
  TrendingUp, 
  ArrowUpRight, 
  Activity, 
  PieChart as PieChartIcon,
  Smartphone,
  MessageSquare,
  Share2
} from 'lucide-react';
import { Skeleton } from '@/app/components/common/SkeletonLoader';

export const dynamic = 'force-dynamic';

// Componente para tarjeta KPI pequeña
function KpiCard({ 
  title, 
  value, 
  subtext, 
  icon: Icon, 
  trend 
}: { 
  title: string; 
  value: string | number; 
  subtext: string; 
  icon: any; 
  trend?: string 
}) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden shadow-lg hover:border-slate-700 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div className="p-2.5 bg-slate-800 rounded-lg text-blue-400 border border-slate-700">
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
            <ArrowUpRight className="w-3 h-3" />
            {trend}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-1">{title}</h3>
        <div className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</div>
        <p className="text-xs font-medium text-slate-500">{subtext}</p>
      </div>
    </div>
  );
}

export default function EstadisticasPage() {
  const { 
    kpi, 
    consultasPorSede, 
    estadoCitas, 
    evolucionMensual, 
    funnelLeads, 
    fuentesCaptacion,
    metricasMensajeria,
    loading 
  } = useStats();

  if (loading) {
    return (
      <PageShell 
        title="Analítica y Reportes" 
        eyebrow="Cargando..."
        description="Cargando tablero de control..."
        fullWidth
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      accent
      fullWidth
      eyebrow="Business Intelligence"
      title="Analítica y Reportes"
      description="Visión estratégica del rendimiento operativo, comercial y de marketing."
    >
      {/* KPIs Principales */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          title="Pacientes Activos"
          value={kpi.totalPacientes}
          subtext={`+${kpi.pacientesNuevosMes} nuevos este mes`}
          icon={Users}
          trend={kpi.pacientesNuevosMes > 0 ? "Creciendo" : undefined}
        />
        <KpiCard
          title="Consultas (Mes)"
          value={kpi.consultasMes}
          subtext={`${kpi.consultasConfirmadasMes} confirmadas`}
          icon={Calendar}
        />
        <KpiCard
          title="Tasa Conversión"
          value={`${kpi.tasaConversion}%`}
          subtext="Leads a Pacientes"
          icon={Target}
          trend="+2.4%"
        />
        <KpiCard
          title="Mensajería Total"
          value={metricasMensajeria.reduce((acc, curr) => acc + curr.value, 0)}
          subtext="Interacciones Lead/Bot"
          icon={MessageSquare}
        />
      </section>

      {/* Gráficos Principales - Fila 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Evolución Mensual */}
        <Card className="bg-slate-950 border-slate-800">
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Crecimiento Operativo
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">Consultas vs Pacientes Nuevos (6 meses)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolucionMensual} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorConsultas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPacientes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="consultas" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorConsultas)" name="Consultas" />
                  <Area type="monotone" dataKey="pacientes" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPacientes)" name="Nuevos Pacientes" />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: '#94a3b8' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Funnel de Leads Mejorado */}
        <Card className="bg-slate-950 border-slate-800">
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" />
              Embudo de Conversión
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">Flujo de leads desde captura hasta cierre</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelLeads} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#e2e8f0" fontSize={11} tickLine={false} axisLine={false} width={80} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24} name="Leads">
                    {funnelLeads.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Gráficos Secundarios - Fila 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Marketing: Fuentes */}
        <Card className="bg-slate-950 border-slate-800">
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-pink-400" />
              Canales de Captación
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">Origen de los leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fuentesCaptacion}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {fuentesCaptacion.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(0,0,0,0.2)" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                  />
                  <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Operativo: Estado Citas */}
        <Card className="bg-slate-950 border-slate-800">
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Estado de Citas
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">Desglose operativo actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={estadoCitas} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                    {estadoCitas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sedes */}
        <Card className="bg-slate-950 border-slate-800">
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-purple-400" />
              Por Sede
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">Distribución geográfica</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={consultasPorSede}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {consultasPorSede.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(0,0,0,0.2)" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
    </PageShell>
  );
}
