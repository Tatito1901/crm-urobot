'use client';

import { formatDate, STATE_COLORS } from '@/app/lib/crm-data';
import { StatCard, Badge } from '@/app/components/crm/ui';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useLeads } from '@/hooks/useLeads';
import { useConsultas } from '@/hooks/useConsultas';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';

export default function DashboardPage() {
  // ✅ Datos reales de Supabase con real-time
  const { metrics: dm, loading: loadingMetrics } = useDashboardMetrics();
  const { leads, loading: loadingLeads } = useLeads();
  const { consultas, loading: loadingConsultas } = useConsultas();

  // Métricas balanceadas para MVP
  const metrics = dm ? [
    {
      title: 'Leads totales',
      value: dm.leadsTotal.toLocaleString('es-MX'),
      hint: `${dm.leadsConvertidos} convertidos`,
    },
    {
      title: 'Tasa de conversión',
      value: `${dm.tasaConversion}%`,
      hint: 'Meta: 35%',
    },
    {
      title: 'Pacientes activos',
      value: dm.pacientesActivos.toLocaleString('es-MX'),
      hint: `Total: ${dm.totalPacientes}`,
    },
    {
      title: 'Consultas futuras',
      value: dm.consultasFuturas.toLocaleString('es-MX'),
      hint: `Hoy: ${dm.consultasHoy}`,
    },
    {
      title: 'Pendientes confirmación',
      value: dm.pendientesConfirmacion.toLocaleString('es-MX'),
      hint: 'Requieren seguimiento',
    },
  ] : [];

  // Datos para MVP
  const recentLeads = leads
    .slice()
    .sort((a, b) => new Date(b.primerContacto).getTime() - new Date(a.primerContacto).getTime())
    .slice(0, 5);

  const upcomingConsultas = consultas
    .slice()
    .filter((c) => new Date(c.fecha) >= new Date()) // Solo futuras
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(0, 5);

  // Estados de consultas
  const consultasStats = {
    confirmadas: consultas.filter((c) => c.estado === 'Confirmada').length,
    programadas: consultas.filter((c) => c.estado === 'Programada').length,
    polanco: dm?.polancoFuturas || 0,
    satelite: dm?.sateliteFuturas || 0,
  };
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#123456,_#050b1a_60%,_#03060f)] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden>
        <div className="absolute left-1/2 top-[-10%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-500/40 blur-[180px]" />
      </div>
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 pb-24 pt-6 sm:gap-8 sm:px-6 sm:pb-28 sm:pt-8 md:gap-10 md:pt-10 lg:pb-20">
        {/* Header */}
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-200/60">Panel operativo</p>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">Resumen general</h1>
          <p className="text-sm text-white/60">
            Visión consolidada ·
          </p>
        </header>

        {/* Métricas principales */}
        {loadingMetrics ? (
          <div className="text-center text-white/60">Cargando métricas...</div>
        ) : (
          <section className="grid gap-3 grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {metrics.map((metric) => (
              <StatCard key={metric.title} title={metric.title} value={metric.value} hint={metric.hint} />
            ))}
          </section>
        )}

        {/* Actividad reciente */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Leads recientes */}
          <Card className="bg-white/[0.03]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-white">
                    Leads recientes {loadingLeads && '(cargando...)'}
                  </CardTitle>
                  <CardDescription>Últimos contactos ingresados</CardDescription>
                </div>
                <Badge label={`${leads.length} totales`} variant="outline" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentLeads.length === 0 ? (
                <p className="text-center text-sm text-white/40 py-8">No hay leads registrados</p>
              ) : (
                recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-white">{lead.nombre}</p>
                      <p className="text-xs text-white/50">
                        {formatDate(lead.primerContacto)} · {lead.fuente}
                      </p>
                    </div>
                    <Badge label={lead.estado} tone={STATE_COLORS[lead.estado]} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Consultas próximas */}
          <Card className="bg-white/[0.03]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-white">
                    Consultas próximas {loadingConsultas && '(cargando...)'}
                  </CardTitle>
                  <CardDescription>Agenda de ambas sedes</CardDescription>
                </div>
                <Badge label={`${upcomingConsultas.length} próximas`} variant="outline" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingConsultas.length === 0 ? (
                <p className="text-center text-sm text-white/40 py-8">No hay consultas programadas</p>
              ) : (
                upcomingConsultas.map((consulta) => (
                  <div
                    key={consulta.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-white">{consulta.paciente}</p>
                      <p className="text-xs text-white/50">
                        {formatDate(consulta.fecha)} · {consulta.sede}
                      </p>
                    </div>
                    <Badge label={consulta.estado} tone={STATE_COLORS[consulta.estado]} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        {/* Resumen operativo */}
        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-white/[0.03]">
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-white">Estado de consultas</CardTitle>
              <CardDescription>Distribución por estado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <span className="text-sm text-white/70">Confirmadas</span>
                <span className="font-semibold text-white">{consultasStats.confirmadas}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <span className="text-sm text-white/70">Programadas</span>
                <span className="font-semibold text-white">{consultasStats.programadas}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.03]">
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-white">Consultas por sede</CardTitle>
              <CardDescription>Próximas 4 semanas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <span className="text-sm text-white/70">Polanco</span>
                <span className="font-semibold text-white">{consultasStats.polanco}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <span className="text-sm text-white/70">Satélite</span>
                <span className="font-semibold text-white">{consultasStats.satelite}</span>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
