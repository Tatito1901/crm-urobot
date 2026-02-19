import type { Metadata } from 'next';
import { Suspense } from 'react';
import { StatisticsTabs } from './components/StatisticsTabs';

export const metadata: Metadata = {
  title: 'Estadísticas',
  description: 'Análisis y métricas del sistema CRM',
};

export default function EstadisticasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full min-h-full bg-background">
      {/* Navegación Superior (Tabs) — Client Component con usePathname, 
          envuelto en Suspense para evitar CSR bailout en rutas dinámicas */}
      <Suspense fallback={<div className="h-[57px] border-b border-border bg-background" />}>
        <StatisticsTabs />
      </Suspense>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-x-hidden bg-muted/5">
        {children}
      </main>
    </div>
  );
}
