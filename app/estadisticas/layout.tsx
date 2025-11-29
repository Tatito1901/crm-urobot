'use client';

import React from 'react';
import { StatisticsTabs } from './components/StatisticsTabs';

export default function EstadisticasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full min-h-screen bg-background">
      {/* Navegación Superior (Tabs) */}
      <StatisticsTabs />

      {/* Contenido Principal */}
      <main className="flex-1 overflow-x-hidden bg-muted/5">
        {children}
      </main>
    </div>
  );
}
