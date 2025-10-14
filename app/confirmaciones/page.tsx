'use client';

import { useMemo, useState } from 'react';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { mockData, STATE_COLORS, formatDate, Recordatorio } from '@/app/lib/crm-data';

export default function ConfirmacionesPage() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return mockData.recordatorios;
    return mockData.recordatorios.filter((recordatorio) =>
      [recordatorio.paciente, recordatorio.consultaId].some((field) => field.toLowerCase().includes(term)),
    );
  }, [search]);

  const pendientes = filtered.filter((item) => item.estado === 'pendiente').length;
  const enviados = filtered.filter((item) => item.estado === 'enviado').length;
  const errores = filtered.filter((item) => item.estado === 'error').length;

  return (
    <PageShell
      accent
      eyebrow="Orquestación n8n"
      title="Confirmaciones y recordatorios"
      description="Automatización de follow-ups multicanal para reducir no-shows y asegurar la agenda del día."
      headerSlot={
        <Card className="bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-[0.3em] text-white/60">Buscar</CardTitle>
            <CardDescription className="text-[0.68rem] text-white/40">
              Paciente o ID de consulta
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2 pt-0">
            <span className="text-white/40">🔍</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por paciente o ID de consulta"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
            />
          </CardContent>
        </Card>
      }
    >
      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Pendientes</CardTitle>
            <CardDescription>Aguardando confirmación</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-semibold text-white">{pendientes}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Enviados</CardTitle>
            <CardDescription>Recordatorios completados</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-semibold text-white">{enviados}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Errores</CardTitle>
            <CardDescription>Requieren revisión</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-semibold text-white">{errores}</p>
          </CardContent>
        </Card>
      </section>

      <Card className="bg-white/[0.03]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white">Detalle de confirmaciones</CardTitle>
          <CardDescription>Flujos automatizados por paciente</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <DataTable
            headers={[
              { key: 'programado', label: 'Programado' },
              { key: 'paciente', label: 'Paciente' },
              { key: 'consulta', label: 'Consulta' },
              { key: 'tipo', label: 'Tipo' },
              { key: 'estado', label: 'Estado' },
              { key: 'canal', label: 'Canal' },
            ]}
            rows={filtered
              .slice()
              .sort((a, b) => new Date(a.programado).getTime() - new Date(b.programado).getTime())
              .map((recordatorio: Recordatorio) => ({
                id: recordatorio.id,
                programado: <span>{formatDate(recordatorio.programado)}</span>,
                paciente: <span className="text-white/80">{recordatorio.paciente}</span>,
                consulta: <span className="font-medium text-white">{recordatorio.consultaId}</span>,
                tipo: <Badge label={recordatorio.tipo.replace(/_/g, ' ')} />,
                estado: <Badge label={recordatorio.estado} tone={STATE_COLORS[recordatorio.estado]} />,
                canal: <Badge label={recordatorio.canal} />,
              }))}
            empty={filtered.length === 0 ? 'No hay recordatorios para mostrar.' : 'Sin resultados.'}
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
