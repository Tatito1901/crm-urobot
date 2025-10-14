'use client';

import { useMemo, useState } from 'react';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { mockData, STATE_COLORS, formatDate, Lead } from '@/app/lib/crm-data';

export default function LeadsPage() {
  const [search, setSearch] = useState('');
  const filteredLeads = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return mockData.leads;
    return mockData.leads.filter((lead) =>
      [lead.nombre, lead.telefono, lead.fuente].some((field) => field.toLowerCase().includes(term)),
    );
  }, [search]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#101c3b,_#02040a_70%)] text-white">
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 pb-20 pt-10">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-200/60">Pipeline</p>
            <h1 className="text-3xl font-semibold text-white">Leads activos</h1>
            <p className="text-sm text-white/60">Seguimiento de primeras conversaciones y conversiones recientes.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white/70 shadow-inner">
            <span className="text-white/40">🔍</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, teléfono o fuente"
              className="w-64 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
            />
          </div>
        </header>

        <DataTable
          headers={[
            { key: 'nombre', label: 'Nombre' },
            { key: 'telefono', label: 'Teléfono' },
            { key: 'estado', label: 'Estado' },
            { key: 'primerContacto', label: 'Primer contacto' },
            { key: 'fuente', label: 'Fuente' },
          ]}
          rows={filteredLeads.map((lead: Lead) => ({
            id: lead.id,
            nombre: (
              <div className="flex flex-col">
                <span className="font-medium text-white">{lead.nombre}</span>
                <span className="text-xs text-white/40">ID: {lead.id}</span>
              </div>
            ),
            telefono: <span className="text-white/80">{lead.telefono}</span>,
            estado: <Badge label={lead.estado} tone={STATE_COLORS[lead.estado]} />,
            primerContacto: <span>{formatDate(lead.primerContacto)}</span>,
            fuente: <Badge label={lead.fuente} />,
          }))}
          empty={search ? 'Sin resultados para el criterio aplicado.' : 'Aún no hay leads registrados.'}
        />
      </div>
    </div>
  );
}
