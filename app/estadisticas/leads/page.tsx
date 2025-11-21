'use client';

import { useStats } from '@/hooks/useStats';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cards, spacing } from '@/app/lib/design-system';
import { Users, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/app/components/common/SkeletonLoader';

export const dynamic = 'force-dynamic';

export default function LeadsAnalysisPage() {
  const { kpi, loading } = useStats();

  if (loading) {
    return (
      <PageShell 
        title="Análisis de Leads" 
        description="Cargando datos..." 
        fullWidth
        eyebrow="Crecimiento"
      >
        <Skeleton className="h-96 w-full" />
      </PageShell>
    );
  }

  return (
    <PageShell
      accent
      fullWidth
      eyebrow="Crecimiento"
      title="Análisis de Leads"
      description="Desglose detallado de la adquisición y calidad de leads."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card className="bg-slate-950 border-slate-800">
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{kpi.totalLeads}</div>
            <p className="text-xs text-slate-400">Histórico acumulado</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 border-slate-800">
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Nuevos (Mes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">+{kpi.leadsNuevosMes}</div>
            <p className="text-xs text-slate-400">Crecimiento mensual</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Aquí se podría agregar una tabla detallada de leads con filtros avanzados */}
      <div className="p-12 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-500 text-sm">
        Análisis profundo de cohortes próximamente
      </div>
    </PageShell>
  );
}
