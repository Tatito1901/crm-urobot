/**
 * ============================================================
 * HOOK: useStats - Dashboard KPIs & Charts
 * ============================================================
 * ✅ OPTIMIZADO: Migrado a SWR para caching y deduplicación
 * ✅ Parallel fetching para minimizar latencia
 * ✅ Datos cacheados por 5 minutos (reduce llamadas API)
 */

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { SWR_CONFIG_DASHBOARD, CACHE_KEYS } from '@/lib/swr-config';

export interface KPIData {
  totalPacientes: number;
  pacientesNuevosMes: number;
  consultasMes: number;
  consultasConfirmadasMes: number;
  tasaAsistencia: number;
  tasaConversion: number;
  totalLeads: number;
  leadsNuevosMes: number;
}

export interface ChartData {
  name: string;
  value: number;
  fill?: string;
  [key: string]: string | number | undefined;
}

export interface MonthlyData {
  name: string;
  consultas: number;
  pacientes: number;
  leads: number;
  [key: string]: string | number | undefined;
}

// Interfaces para tipado de datos crudos de Supabase
interface RawPaciente {
  id: string;
  created_at: string;
}

interface RawConsulta {
  id: string;
  fecha_hora_inicio: string;
  sede: string;
  estado_cita: string;
}

interface RawLead {
  id: string;
  estado: string;
  created_at: string;
  fuente_lead: string;
  canal_marketing: string;
  total_interacciones: number;
}

interface RawDestino {
  id: string;
  tipo_destino: string;
  created_at: string;
}

interface StatsData {
  kpi: KPIData;
  consultasPorSede: ChartData[];
  estadoCitas: ChartData[];
  evolucionMensual: MonthlyData[];
  funnelLeads: ChartData[];
  fuentesCaptacion: ChartData[];
  metricasMensajeria: ChartData[];
  destinosPacientes: ChartData[];
}

// Valores por defecto para carga inicial instantánea
const defaultKPI: KPIData = {
  totalPacientes: 0,
  pacientesNuevosMes: 0,
  consultasMes: 0,
  consultasConfirmadasMes: 0,
  tasaAsistencia: 0,
  tasaConversion: 0,
  totalLeads: 0,
  leadsNuevosMes: 0,
};

const supabase = createClient();

/**
 * Fetcher optimizado - ejecuta queries en paralelo
 */
const fetchStats = async (): Promise<StatsData> => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  
  // Parallel Fetching - todas las queries al mismo tiempo
  const [
    { data: pacientes, error: errPacientes },
    { data: consultas, error: errConsultas },
    { data: leads, error: errLeads },
    { data: destinos, error: errDestinos }
  ] = await Promise.all([
    supabase.from('pacientes').select('id, created_at'),
    supabase.from('consultas').select('id, fecha_hora_inicio, sede, estado_cita'),
    supabase.from('leads').select('id, estado, created_at, fuente_lead, canal_marketing, total_interacciones'),
    supabase.from('destinos_pacientes').select('id, tipo_destino, created_at')
  ]);

  if (errPacientes) throw errPacientes;
  if (errConsultas) throw errConsultas;
  if (errLeads) throw errLeads;
  if (errDestinos) throw errDestinos;

  // Casteo seguro de tipos
  const safePacientes = (pacientes || []) as unknown as RawPaciente[];
  const safeConsultas = (consultas || []) as unknown as RawConsulta[];
  const safeLeads = (leads || []) as unknown as RawLead[];
  const safeDestinos = (destinos || []) as unknown as RawDestino[];

  // --- CALCULOS KPI ---
  const pacientesNuevos = safePacientes.filter(p => p.created_at >= firstDayOfMonth).length;
  const consultasEsteMes = safeConsultas.filter(c => c.fecha_hora_inicio >= firstDayOfMonth);
  const consultasConfirmadas = consultasEsteMes.filter(c => c.estado_cita === 'Confirmada').length;
  
  const citasPasadas = safeConsultas.filter(c => ['Confirmada', 'No Asistió', 'Cancelada'].includes(c.estado_cita));
  const citasAsistidas = citasPasadas.filter(c => c.estado_cita === 'Confirmada' || c.estado_cita === 'Completada').length;
  const tasaAsist = citasPasadas.length > 0 ? Math.round((citasAsistidas / citasPasadas.length) * 100) : 0;

  const leadsNuevos = safeLeads.filter(l => l.created_at >= firstDayOfMonth).length;
  const leadsConvertidos = safeLeads.filter(l => l.estado === 'Convertido' || l.estado === 'Ganado').length;
  const tasaConv = safeLeads.length > 0 ? Math.round((leadsConvertidos / safeLeads.length) * 100) : 0;

  const kpi: KPIData = {
    totalPacientes: safePacientes.length,
    pacientesNuevosMes: pacientesNuevos,
    consultasMes: consultasEsteMes.length,
    consultasConfirmadasMes: consultasConfirmadas,
    tasaAsistencia: tasaAsist,
    tasaConversion: tasaConv,
    totalLeads: safeLeads.length,
    leadsNuevosMes: leadsNuevos
  };

  // --- CHARTS: Consultas por Sede ---
  const sedesMap = safeConsultas.reduce((acc: Record<string, number>, curr) => {
    const sede = curr.sede || 'SIN SEDE';
    acc[sede] = (acc[sede] || 0) + 1;
    return acc;
  }, {});
  
  const consultasPorSede: ChartData[] = [
    { name: 'Polanco', value: sedesMap['POLANCO'] || 0, fill: '#c084fc' },
    { name: 'Satélite', value: sedesMap['SATELITE'] || 0, fill: '#22d3ee' },
  ];

  // --- CHARTS: Estado Citas ---
  const estadosMap = safeConsultas.reduce((acc: Record<string, number>, curr) => {
    const estado = curr.estado_cita || 'Desconocido';
    acc[estado] = (acc[estado] || 0) + 1;
    return acc;
  }, {});

  const estadoCitas: ChartData[] = [
    { name: 'Programada', value: estadosMap['Programada'] || 0, fill: '#60a5fa' },
    { name: 'Confirmada', value: estadosMap['Confirmada'] || 0, fill: '#4ade80' },
    { name: 'Cancelada', value: estadosMap['Cancelada'] || 0, fill: '#f87171' },
    { name: 'No Asistió', value: estadosMap['No Asistió'] || 0, fill: '#fbbf24' },
  ];

  // --- CHARTS: Funnel Leads ---
  const funnelOrder = ['Nuevo', 'Contactado', 'Interesado', 'Calificado', 'Convertido'];
  const funnelColors = ['#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#312e81'];
  
  const funnelLeads: ChartData[] = funnelOrder.map((estado, idx) => ({
    name: estado,
    value: safeLeads.filter(l => l.estado === estado).length,
    fill: funnelColors[idx] || '#6366f1'
  }));

  // --- CHARTS: Fuentes de Captación ---
  const fuentesMap = safeLeads.reduce((acc: Record<string, number>, curr) => {
    const fuente = curr.canal_marketing || curr.fuente_lead || 'Desconocido';
    acc[fuente] = (acc[fuente] || 0) + 1;
    return acc;
  }, {});

  const marketingColors = ['#f472b6', '#38bdf8', '#fbbf24', '#4ade80', '#94a3b8']; 
  const fuentesCaptacion: ChartData[] = Object.entries(fuentesMap)
    .map(([name, value], idx) => ({
      name,
      value,
      fill: marketingColors[idx % marketingColors.length]
    }))
    .sort((a, b) => b.value - a.value);

  // --- METRICAS: Mensajería ---
  const totalInteracciones = safeLeads.reduce((sum, l) => sum + (l.total_interacciones || 0), 0);
  
  const metricasMensajeria: ChartData[] = [
    { name: 'Total Interacciones', value: totalInteracciones, fill: '#38bdf8' }
  ];

  // --- CHARTS: Evolución Mensual ---
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return d;
  });

  const evolucionMensual: MonthlyData[] = last6Months.map(date => {
    const monthKey = date.toISOString().slice(0, 7);
    const label = date.toLocaleDateString('es-MX', { month: 'short' });
    
    return {
      name: label.charAt(0).toUpperCase() + label.slice(1),
      consultas: safeConsultas.filter(c => String(c.fecha_hora_inicio).startsWith(monthKey)).length,
      pacientes: safePacientes.filter(p => String(p.created_at).startsWith(monthKey)).length,
      leads: safeLeads.filter(l => l.created_at && l.created_at.startsWith(monthKey)).length
    };
  });

  // --- CHARTS: Destinos de Pacientes ---
  const destinosMap = safeDestinos.reduce((acc: Record<string, number>, curr) => {
    const tipo = curr.tipo_destino || 'pendiente';
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {});

  const destinoColors: Record<string, string> = {
    'alta_definitiva': '#10b981', // emerald-500
    'presupuesto_enviado': '#f59e0b', // amber-500
    'cirugia_realizada': '#3b82f6', // blue-500
    'seguimiento': '#6366f1', // indigo-500
    'pendiente': '#94a3b8' // slate-400
  };

  const destinoLabels: Record<string, string> = {
    'alta_definitiva': 'Alta Definitiva',
    'presupuesto_enviado': 'Presupuesto',
    'cirugia_realizada': 'Cirugía',
    'seguimiento': 'Seguimiento',
    'pendiente': 'Pendiente'
  };

  const destinosPacientes: ChartData[] = Object.entries(destinosMap)
    .map(([tipo, value]) => ({
      name: destinoLabels[tipo] || tipo,
      value,
      fill: destinoColors[tipo] || '#94a3b8'
    }))
    .sort((a, b) => b.value - a.value);

  return {
    kpi,
    consultasPorSede,
    estadoCitas,
    evolucionMensual,
    funnelLeads,
    fuentesCaptacion,
    metricasMensajeria,
    destinosPacientes
  };
};

/**
 * Hook useStats con SWR
 * ✅ Cache de 5 minutos
 * ✅ Mantiene datos previos mientras recarga
 * ✅ Deduplicación automática de requests
 */
export function useStats() {
  const { data, error, isLoading, mutate } = useSWR<StatsData>(
    CACHE_KEYS.STATS,
    fetchStats,
    SWR_CONFIG_DASHBOARD
  );

  return {
    loading: isLoading,
    error: error || null,
    refresh: () => mutate(),
    kpi: data?.kpi || defaultKPI,
    consultasPorSede: data?.consultasPorSede || [],
    estadoCitas: data?.estadoCitas || [],
    evolucionMensual: data?.evolucionMensual || [],
    funnelLeads: data?.funnelLeads || [],
    fuentesCaptacion: data?.fuentesCaptacion || [],
    metricasMensajeria: data?.metricasMensajeria || [],
    destinosPacientes: data?.destinosPacientes || [],
  };
}
