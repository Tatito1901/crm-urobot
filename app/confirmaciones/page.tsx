'use client';

import { useMemo, useState } from 'react';
import { Badge, DataTable } from '@/app/components/crm/ui';
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
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#101c3b,_#02040a_70%)] text-white">
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 pb-20 pt-10">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-200/60">Orquestación n8n</p>
            <h1 className="text-3xl font-semibold text-white">Confirmaciones y recordatorios</h1>
            <p className="text-sm text-white/60">
              Automatización de follow-ups multicanal para reducir no-shows y asegurar la agenda del día.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white/70 shadow-inner">
            <span className="text-white/40">🔍</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por paciente o ID de consulta"
              className="w-64 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
            />
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/70">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Pendientes</p>
            <p className="mt-1 text-2xl font-semibold text-white">{pendientes}</p>
            <p className="text-xs text-white/50">Aguardando confirmación del paciente</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/70">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Enviados</p>
            <p className="mt-1 text-2xl font-semibold text-white">{enviados}</p>
            <p className="text-xs text-white/50">Recordatorios completados exitosamente</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/70">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Errores</p>
            <p className="mt-1 text-2xl font-semibold text-white">{errores}</p>
            <p className="text-xs text-white/50">Automatizaciones que requieren revisión</p>
          </div>
        </section>

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
      </div>
    </div>
  );
}
