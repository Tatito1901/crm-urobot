'use client';

import { PageShell } from '@/app/components/crm/page-shell';
import { Activity } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function RealtimePage() {
  return (
    <PageShell
      accent
      fullWidth
      eyebrow="En vivo"
      title="Real-time Operations"
      description="Monitoreo en tiempo real de la actividad del consultorio."
    >
      <div className="flex flex-col items-center justify-center py-20 space-y-4 border border-dashed border-slate-800 rounded-xl bg-slate-950/50">
        <div className="p-4 bg-blue-500/10 rounded-full">
          <Activity className="w-8 h-8 text-blue-400 animate-pulse" />
        </div>
        <h3 className="text-lg font-semibold text-white">Monitoreo en tiempo real</h3>
        <p className="text-slate-400 text-sm max-w-md text-center">
          Próximamente podrás ver aquí los logs de actividad, conexiones de usuarios y eventos del sistema en tiempo real a través de Supabase Realtime.
        </p>
      </div>
    </PageShell>
  );
}
