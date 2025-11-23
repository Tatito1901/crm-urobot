'use client';

import React from 'react';
import { StatisticsSidebar } from './components/StatisticsSidebar';

export default function EstadisticasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col lg:flex-row h-full min-h-screen bg-slate-50 dark:bg-[#0b101a]">
      {/* Sidebar de Estadísticas - Fijo en Desktop, Fluido en Móvil */}
      <div className="hidden lg:block h-screen sticky top-0 z-30">
        <StatisticsSidebar />
      </div>

      {/* Versión Móvil Simplificada (Opcional: Podría ser un Drawer) */}
      <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
         {/* En móvil podríamos poner un select o un menú horizontal, 
             por ahora mostramos el sidebar completo pero colapsable sería ideal.
             Para mantenerlo simple y funcional, renderizamos una versión adaptada o el mismo componente si es responsive.
         */}
         <div className="h-auto max-h-60 overflow-y-auto">
            <StatisticsSidebar />
         </div>
      </div>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
