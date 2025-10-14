'use client';

import { mockData, formatDate, formatTimeSlot, STATE_COLORS } from '@/app/lib/crm-data';
import { StatCard, Badge } from '@/app/components/crm/ui';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { GrowthChart } from '@/app/components/analytics/GrowthChart';
import { ComparisonBars } from '@/app/components/analytics/ComparisonBars';

const metrics = (() => {
  const dm = mockData.dashboardMetricas;
  return [
    {
      title: 'Leads totales',
      value: dm.leads_totales.toLocaleString('es-MX'),
      hint: `Convertidos ${dm.leads_convertidos.toLocaleString('es-MX')}`,
    },
    {
      title: 'Leads este mes',
      value: dm.leads_mes.toLocaleString('es-MX'),
      hint: 'Actualizado con flujos n8n',
    },
    {
      title: 'Tasa de conversión',
      value: `${dm.tasa_conversion_pct}%`,
      hint: `Meta mensual 35% · ${dm.leads_convertidos} convertidos`,
    },
    {
      title: 'Pacientes activos',
      value: dm.pacientes_activos.toLocaleString('es-MX'),
      hint: `Total pacientes ${dm.total_pacientes.toLocaleString('es-MX')}`,
    },
    {
      title: 'Consultas futuras',
      value: dm.consultas_futuras.toLocaleString('es-MX'),
      hint: `Polanco ${dm.polanco_futuras} · Satélite ${dm.satelite_futuras}`,
    },
    {
      title: 'Pendientes confirmación',
      value: dm.pendientes_confirmacion.toLocaleString('es-MX'),
      hint: `Consultas de hoy ${dm.consultas_hoy}`,
    },
  ];
})();

const leadTrend = [
  { label: 'May', value: 22 },
  { label: 'Jun', value: 28 },
  { label: 'Jul', value: 31 },
  { label: 'Ago', value: 35 },
  { label: 'Sep', value: 38 },
  { label: 'Oct', value: mockData.dashboardMetricas.leads_mes },
];

const sedeDistribution = [
  {
    label: 'Polanco',
    value: mockData.dashboardMetricas.polanco_futuras,
    hint: 'Próximas 4 semanas',
  },
  {
    label: 'Satélite',
    value: mockData.dashboardMetricas.satelite_futuras,
    hint: 'Próximas 4 semanas',
  },
];

const confirmStatus = [
  {
    label: 'Confirmadas',
    value: mockData.consultas.filter((consulta) => consulta.estado === 'Confirmada').length,
    hint: 'Citas con estatus confirmado',
  },
  {
    label: 'Pendientes',
    value: mockData.dashboardMetricas.pendientes_confirmacion,
    hint: 'Recordatorios programados',
  },
  {
    label: 'Reagendadas',
    value: mockData.consultas.filter((consulta) => consulta.estado === 'Reagendada').length,
    hint: 'Por confirmar nuevo horario',
  },
  {
    label: 'Canceladas',
    value: mockData.consultas.filter((consulta) => consulta.estado === 'Cancelada').length,
  },
];

const recentLeads = mockData.leads
  .slice()
  .sort((a, b) => new Date(b.primerContacto).getTime() - new Date(a.primerContacto).getTime())
  .slice(0, 4);

const topPacientes = mockData.pacientes
  .slice()
  .sort((a, b) => b.totalConsultas - a.totalConsultas)
  .slice(0, 4);

const upcomingConsultas = mockData.consultas
  .slice()
  .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
  .slice(0, 4);

const upcomingRecordatorios = mockData.recordatorios
  .slice()
  .sort((a, b) => new Date(a.programado).getTime() - new Date(b.programado).getTime())
  .slice(0, 4);

const quickActions = [
  'Revisar leads sin seguimiento en las últimas 48h.',
  'Confirmar consultas reagendadas con pacientes sensibles.',
  'Sincronizar nuevos contactos desde Google Ads a Supabase.',
];

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#123456,_#050b1a_60%,_#03060f)] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden>
        <div className="absolute left-1/2 top-[-10%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-500/40 blur-[180px]" />
      </div>
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 pb-20 pt-10">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-200/60">Panel operativo</p>
          <h1 className="text-3xl font-semibold text-white">Resumen general</h1>
          <p className="text-sm text-white/60">
            Visión consolidada de leads, pacientes y flujo de consultas para el equipo asistido por IA.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => (
            <StatCard key={metric.title} title={metric.title} value={metric.value} hint={metric.hint} />
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-white/[0.03]">
            <CardHeader className="flex flex-col gap-1 space-y-0 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-white">Leads recientes</CardTitle>
                  <CardDescription>Últimos contactos ingresados al CRM</CardDescription>
                </div>
                <Badge label={`${mockData.leads.length} totales`} variant="outline" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 text-sm text-white/70">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-white">{lead.nombre}</p>
                    <p className="text-xs text-white/40">
                      {formatDate(lead.primerContacto)} · {lead.fuente}
                    </p>
                  </div>
                  <Badge label={lead.estado} tone={STATE_COLORS[lead.estado]} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white/[0.03]">
            <CardHeader className="flex flex-col gap-1 space-y-0 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-white">Pacientes destacados</CardTitle>
                  <CardDescription>Mayores historiales de consulta</CardDescription>
                </div>
                <Badge label={`${mockData.pacientes.length} activos`} variant="outline" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 text-sm text-white/70">
              {topPacientes.map((paciente) => (
                <div
                  key={paciente.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-white">{paciente.nombre}</p>
                    <p className="text-xs text-white/40">
                      {paciente.telefono} · {paciente.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge label={paciente.estado} tone={STATE_COLORS[paciente.estado]} />
                    <p className="mt-1 text-xs text-white/50">{paciente.totalConsultas} consultas</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <GrowthChart title="Crecimiento de leads" data={leadTrend} />
          <ComparisonBars title="Consultas por sede" items={sedeDistribution} />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-white/[0.03]">
            <CardHeader className="flex flex-col gap-1 space-y-0 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-white">Consultas próximas</CardTitle>
                  <CardDescription>Agenda consolidada de ambas sedes</CardDescription>
                </div>
                <Badge label={`${mockData.consultas.length} totales`} variant="outline" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 text-sm text-white/70">
              {upcomingConsultas.map((consulta) => (
                <div
                  key={consulta.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-white">
                      {formatTimeSlot(consulta.fecha, consulta.timezone)} · {consulta.paciente}
                    </p>
                    <p className="text-xs text-white/40">
                      {consulta.sede.toLowerCase()} · {formatDate(consulta.fecha)}
                    </p>
                  </div>
                  <Badge label={consulta.estado} tone={STATE_COLORS[consulta.estado]} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white/[0.03]">
            <CardHeader className="flex flex-col gap-1 space-y-0 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-white">Confirmaciones en curso</CardTitle>
                  <CardDescription>Recordatorios y follow-ups automatizados</CardDescription>
                </div>
                <Badge label={`${mockData.recordatorios.length} flujos`} variant="outline" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 text-sm text-white/70">
              {upcomingRecordatorios.map((recordatorio) => (
                <div
                  key={recordatorio.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-white">{recordatorio.paciente}</p>
                    <p className="text-xs text-white/40">
                      {formatDate(recordatorio.programado)} · {recordatorio.canal.toUpperCase()}
                    </p>
                    <p className="text-xs text-white/40">Consulta {recordatorio.consultaId}</p>
                  </div>
                  <Badge label={recordatorio.estado} tone={STATE_COLORS[recordatorio.estado]} />
                </div>
              ))}
              <div className="space-y-2 border-t border-white/10 pt-4 text-xs text-white/50">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Próximas acciones</p>
                <div className="space-y-2 text-sm text-white/70">
                  {quickActions.map((action) => (
                    <div key={action} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      {action}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <ComparisonBars title="Estatus de confirmaciones" items={confirmStatus} />
          <Card className="bg-white/[0.03]">
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-white">Resumen operativo</CardTitle>
              <CardDescription>Indicadores sintetizados del día y del mes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white/70">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span className="text-white/50">Leads convertidos este mes</span>
                <span className="font-semibold text-white">{mockData.dashboardMetricas.leads_convertidos}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span className="text-white/50">Pacientes activos</span>
                <span className="font-semibold text-white">{mockData.dashboardMetricas.pacientes_activos}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span className="text-white/50">Consultas hoy</span>
                <span className="font-semibold text-white">{mockData.dashboardMetricas.consultas_hoy}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span className="text-white/50">Pendientes de confirmación</span>
                <span className="font-semibold text-white">{mockData.dashboardMetricas.pendientes_confirmacion}</span>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
