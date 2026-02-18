/**
 * ============================================================
 * DASHBOARD LAYOUT - Con Suspense para evitar parpadeos
 * ============================================================
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import DashboardLoading from './loading';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Panel de control principal del CRM',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardLoading />}>
      {children}
    </Suspense>
  );
}
