'use client';

import { useMemo, useState } from 'react';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
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
    <PageShell
      accent
      eyebrow="Pipeline"
      title="Leads activos"
      description="Seguimiento de primeras conversaciones y conversiones recientes."
      headerSlot={
        <Card className="bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-[0.3em] text-white/60">Buscar</CardTitle>
            <CardDescription className="text-[0.68rem] text-white/40">
              Nombre, teléfono o fuente
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 pt-0 sm:flex-row sm:items-center">
            <span className="text-white/40">🔍</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, teléfono o fuente"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-300/40 sm:border-none sm:bg-transparent sm:px-0 sm:py-0"
            />
          </CardContent>
        </Card>
      }
    >
      <Card className="bg-white/[0.03]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white">Listado de leads</CardTitle>
          <CardDescription>Todas las etapas del funnel en un solo lugar</CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden pt-0">
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
        </CardContent>
      </Card>
    </PageShell>
  );
}
