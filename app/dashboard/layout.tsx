/**
 * ============================================================
 * DASHBOARD LAYOUT - Con Suspense para evitar parpadeos
 * ============================================================
 */

import { Suspense } from 'react';
import DashboardLoading from './loading';

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
