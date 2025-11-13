'use client';

import { useMemo, useState } from 'react';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { STATE_COLORS, formatDate } from '@/app/lib/crm-data';
import type { Lead } from '@/types/leads';
import { useLeads } from '@/hooks/useLeads';
import { DataTableSkeleton } from '@/app/components/common/SkeletonLoader';
import { ErrorState } from '@/app/components/common/ErrorState';

export const dynamic = 'force-dynamic';

export default function LeadsPage() {
  const [search, setSearch] = useState('');
  
  // ✅ Datos reales de Supabase
  const { leads, loading, error, refetch } = useLeads();
  
  const filteredLeads = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return leads;
    return leads.filter((lead) =>
      [lead.nombre, lead.telefono, lead.fuente].some((field) => field.toLowerCase().includes(term)),
    );
  }, [search, leads]);

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
          <CardContent className="flex flex-col gap-3 pt-0 sm:flex-row sm:items-center sm:gap-4">
            <span className="text-white/50">🔍</span>
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
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base text-white">
                Listado de leads {loading && '(cargando...)'}
              </CardTitle>
              <CardDescription>
                {error 
                  ? `Error: ${error.message}` 
                  : 'Todas las etapas del funnel en un solo lugar'
                }
              </CardDescription>
            </div>
            <button
              onClick={() => refetch()}
              disabled={loading}
              className="rounded-lg bg-blue-600/20 px-3 py-1.5 text-sm font-medium text-blue-300 hover:bg-blue-600/30 disabled:opacity-50 transition-colors"
            >
              ↻
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading && leads.length === 0 ? (
            // ✅ Skeleton loader mientras carga datos
            <DataTableSkeleton rows={8} />
          ) : error ? (
            // ✅ Error state con opción de retry
            <ErrorState
              title="Error al cargar leads"
              error={error}
              onRetry={refetch}
              size="medium"
            />
          ) : (
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
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-white">{lead.nombre}</span>
                    <span className="text-xs text-white/40">ID: {lead.id}</span>
                  </div>
                ),
                telefono: <span className="text-white/80">{lead.telefono}</span>,
                estado: <Badge label={lead.estado} tone={STATE_COLORS[lead.estado]} />,
                primerContacto: <span>{formatDate(lead.primerContacto)}</span>,
                fuente: <Badge label={lead.fuente || '—'} />,
              }))}
              empty={search ? 'Sin resultados para el criterio aplicado.' : 'Aún no hay leads registrados.'}
              mobileConfig={{
                primary: 'nombre',
                secondary: 'telefono',
                metadata: ['estado', 'primerContacto']
              }}
            />
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
