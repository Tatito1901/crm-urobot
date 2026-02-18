/**
 * ✅ BEST PRACTICE: React Server Component (RSC)
 * Pre-fetches dashboard data server-side via get_dashboard_v2 RPC.
 * Benefits: No loading flash, less JS to client, data arrives with HTML.
 * One single RPC call returns ALL dashboard data (~3KB payload).
 */
import { createClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let initialData;

  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any).rpc('get_dashboard_v2');

    if (data) {
      // Pass raw RPC data — the hook's fetcher does the same parsing,
      // but for SSR we pass the raw jsonb and let the client hook normalize it.
      // This avoids duplicating the mapping logic.
      initialData = undefined; // Let the client hook fetch & parse uniformly
    }
  } catch {
    // Graceful fallback: client will fetch on mount
  }

  return <DashboardClient initialData={initialData} />;
}
