'use client';

import { useMemo, useState } from 'react';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { STATE_COLORS, formatDate } from '@/app/lib/crm-data';
import type { Lead } from '@/types/leads';
import { useLeads } from '@/hooks/useLeads';
import { ContentLoader, TableContentSkeleton } from '@/app/components/common/ContentLoader';
import { typography, spacing, cards } from '@/app/lib/design-system';

export const dynamic = 'force-dynamic';

export default function LeadsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Nuevo' | 'En seguimiento' | 'Convertido' | 'Descartado'>('all');
  
  // ✅ Datos reales de Supabase
  const { leads, loading, error, refetch } = useLeads();
  
  const leadsStats = useMemo(() => {
    const total = leads.length;
    const nuevo = leads.filter((l) => l.estado === 'Nuevo').length;
    const seguimiento = leads.filter((l) => l.estado === 'En seguimiento').length;
    const convertido = leads.filter((l) => l.estado === 'Convertido').length;
    const descartado = leads.filter((l) => l.estado === 'Descartado').length;
    const enProceso = nuevo + seguimiento;
    return { total, nuevo, seguimiento, convertido, descartado, enProceso };
  }, [leads]);
  
  const filteredLeads = useMemo(() => {
    const term = search.trim().toLowerCase();
    let base = leads;

    if (statusFilter !== 'all') {
      base = base.filter((lead) => lead.estado === statusFilter);
    }

    if (!term) return base;
    return base.filter((lead) =>
      [lead.nombre, lead.telefono, lead.fuente].some((field) => field.toLowerCase().includes(term)),
    );
  }, [search, leads, statusFilter]);

  return (
    <PageShell
      accent
      eyebrow="Pipeline"
      title="Leads activos"
      description="Seguimiento de primeras conversaciones y conversiones recientes."
      headerSlot={
        <div className="w-full sm:w-auto">
          <div className="flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-3 py-2 shadow-sm shadow-black/20">
            <span className="text-white/40 text-base">
              🔍
            </span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, teléfono o fuente"
              className="w-full bg-transparent border-none text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-0"
            />
          </div>
        </div>
      }
    >
      <Card className={cards.base}>
        <CardHeader className={spacing.cardHeader}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className={typography.cardTitle}>
                Listado de leads
              </CardTitle>
              <CardDescription className={typography.cardDescription}>
                {error 
                  ? `Error: ${error.message}` 
                  : 'Todas las etapas del funnel en un solo lugar'
                }
              </CardDescription>
            </div>
            <button
              onClick={() => refetch()}
              disabled={loading}
              className="rounded-lg bg-blue-600/20 px-3 py-2 text-sm font-medium text-blue-300 hover:bg-blue-600/30 disabled:opacity-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              ↻
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/10">
            <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs text-white/70">
              <span className="rounded-full bg-white/5 px-3 py-1">
                Total:
                <span className="ml-1 font-semibold text-white">{leadsStats.total}</span>
              </span>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1">
                Convertidos:
                <span className="ml-1 font-semibold text-emerald-300">{leadsStats.convertido}</span>
              </span>
              <span className="rounded-full bg-blue-500/10 px-3 py-1">
                En proceso:
                <span className="ml-1 font-semibold text-blue-300">{leadsStats.enProceso}</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs">
              {[
                { key: 'all' as const, label: 'Todos' },
                { key: 'Nuevo' as const, label: 'Nuevos' },
                { key: 'En seguimiento' as const, label: 'Seguimiento' },
                { key: 'Convertido' as const, label: 'Convertidos' },
                { key: 'Descartado' as const, label: 'Descartados' },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setStatusFilter(option.key)}
                  className={`rounded-full px-3 py-1 border text-xs sm:text-[11px] transition ${
                    statusFilter === option.key
                      ? 'bg-white/15 border-white/40 text-white'
                      : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <ContentLoader
            loading={loading}
            error={error}
            onRetry={refetch}
            isEmpty={filteredLeads.length === 0}
            minHeight="min-h-[500px]"
            skeleton={<TableContentSkeleton rows={8} />}
            emptyState={
              <div className="text-center space-y-2">
                <p className="text-4xl">📋</p>
                <p className="text-sm text-slate-400">
                  {search ? 'No se encontraron leads' : 'No hay leads registrados'}
                </p>
              </div>
            }
          >
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
          </ContentLoader>
        </CardContent>
      </Card>
    </PageShell>
  );
}
