/**
 * ✅ BEST PRACTICE: React Server Component (RSC)
 * Pre-fetches dashboard data server-side via get_dashboard_v2 RPC.
 * Benefits: No loading flash, less JS to client, data arrives with HTML.
 * One single RPC call returns ALL dashboard data (~3KB payload).
 */
import { createClient } from '@/lib/supabase/server';
import { parseDashboardV2 } from '@/hooks/dashboard/dashboardV2-parser';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let initialData;

  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any).rpc('get_dashboard_v3');

    if (data) {
      initialData = parseDashboardV2(data);
    }
  } catch {
    // Graceful fallback: client will fetch on mount
  }

  return <DashboardClient initialData={initialData} />;
}
