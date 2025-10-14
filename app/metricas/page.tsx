'use client';

import { mockData } from '@/app/lib/crm-data';
import { PageShell } from '@/app/components/crm/page-shell';
import { StatCard } from '@/app/components/crm/ui';
import { GrowthChart } from '@/app/components/analytics/GrowthChart';
import { ComparisonBars } from '@/app/components/analytics/ComparisonBars';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';

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

export default function MetricasPage() {
  return (
    <PageShell
      accent
      eyebrow="Inteligencia Operativa"
      title="Métricas clave"
      description="Indicadores de performance y distribución operativa listos para conectar con Supabase y n8n."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <StatCard key={metric.title} title={metric.title} value={metric.value} hint={metric.hint} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <GrowthChart title="Crecimiento de leads" data={leadTrend} />
        <ComparisonBars title="Consultas por sede" items={sedeDistribution} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ComparisonBars title="Estatus de confirmaciones" items={confirmStatus} />
        <Card className="bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Próximos pasos sugeridos</CardTitle>
            <CardDescription>Ideas para la siguiente iteración</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3 text-sm text-white/70">
              <li className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                Integrar `dashboard_metricas` desde Supabase con revalidación cada hora.
              </li>
              <li className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                Activar alertas en n8n cuando los pendientes superen la meta semanal.
              </li>
              <li className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                Añadir métricas de satisfacción post-consulta para un ciclo completo.
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
