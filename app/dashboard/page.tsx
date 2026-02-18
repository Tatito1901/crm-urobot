/**
 * ✅ BEST PRACTICE: React Server Component (RSC)
 * Pre-fetches dashboard data server-side, passes to client as fallbackData.
 * Benefits: No loading flash, less JS to client, data arrives with HTML.
 */
import { createClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let initialStats;
  let initialActivity;

  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    // ✅ Parallel server-side fetches (eliminates client waterfall)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [statsResult, leadsResult, consultasResult] = await Promise.all([
      (supabase as any).rpc('get_dashboard_stats_fast'),
      supabase
        .from('leads')
        .select('id, nombre, telefono, estado, fuente, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('consultas')
        .select('id, fecha_hora_inicio, sede_id, estado_cita, pacientes(nombre)')
        .gte('fecha_hora_inicio', now)
        .order('fecha_hora_inicio', { ascending: true })
        .limit(5),
    ]);

    // Parse stats
    if (statsResult.data) {
      const d = statsResult.data as Record<string, Record<string, unknown>>;
      const leads = d.leads || {};
      const consultas = d.consultas || {};
      const pacientes = d.pacientes || {};
      const porEstado = (leads.por_estado || {}) as Record<string, number>;

      initialStats = {
        kpi: {
          totalPacientes: Number(pacientes.total) || 0,
          pacientesNuevosMes: Number(pacientes.nuevos_mes) || 0,
          consultasMes: Number(consultas.completadas_mes) || 0,
          consultasConfirmadasMes: Number(consultas.programadas) || 0,
          tasaAsistencia: 0,
          tasaConversion: 0,
          totalLeads: Number(leads.total) || 0,
          leadsNuevosMes: Number(leads.hoy) || 0,
        },
        consultasPorSede: [] as Array<{ name: string; value: number; fill?: string }>,
        funnelLeads: Object.entries(porEstado).map(([name, value]) => ({ name, value: Number(value) })),
      };
    }

    // Parse activity
    const recentLeads = (leadsResult.data || []).map((l: Record<string, unknown>) => ({
      id: l.id as string,
      nombre: (l.nombre as string) || (l.telefono as string) || 'Sin nombre',
      telefono: (l.telefono as string) || '',
      estado: (l.estado as string) || 'nuevo',
      fuente: (l.fuente as string) || 'Otro',
      primerContacto: (l.created_at as string) || null,
    }));

    const upcomingConsultas = (consultasResult.data || []).map((c: Record<string, unknown>) => {
      const paciente = c.pacientes as { nombre?: string } | null;
      return {
        id: c.id as string,
        paciente: paciente?.nombre || 'Paciente',
        fechaHoraInicio: c.fecha_hora_inicio as string,
        sede: (c.sede_id as string) || '',
        estadoCita: (c.estado_cita as string) || 'Programada',
      };
    });

    initialActivity = { recentLeads, upcomingConsultas };
  } catch {
    // Graceful fallback: client will fetch on mount
  }

  return (
    <DashboardClient
      initialStats={initialStats}
      initialActivity={initialActivity}
    />
  );
}
