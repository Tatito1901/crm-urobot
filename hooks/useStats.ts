import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface KPIData {
  totalPacientes: number;
  pacientesNuevosMes: number;
  consultasMes: number;
  consultasConfirmadasMes: number;
  tasaAsistencia: number; // porcentaje
  tasaConversion: number; // porcentaje
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
  name: string; // Mes (Ene, Feb...)
  consultas: number;
  pacientes: number;
  leads: number;
  [key: string]: string | number | undefined;
}

// Interfaces para tipado de datos crudos de Supabase
interface RawPaciente {
  id: string;
  fecha_registro: string;
  estado: string;
}

interface RawConsulta {
  id: string;
  fecha_consulta: string;
  sede: string;
  estado_cita: string;
  confirmado_paciente: boolean;
}

interface RawLead {
  id: string;
  estado: string;
  created_at: string;
  fuente_lead: string;
  canal_marketing: string;
  total_mensajes_enviados: number;
  total_mensajes_recibidos: number;
}

export function useStats() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [kpi, setKpi] = useState<KPIData>({
    totalPacientes: 0,
    pacientesNuevosMes: 0,
    consultasMes: 0,
    consultasConfirmadasMes: 0,
    tasaAsistencia: 0,
    tasaConversion: 0,
    totalLeads: 0,
    leadsNuevosMes: 0,
  });
  
  const [consultasPorSede, setConsultasPorSede] = useState<ChartData[]>([]);
  const [estadoCitas, setEstadoCitas] = useState<ChartData[]>([]);
  const [evolucionMensual, setEvolucionMensual] = useState<MonthlyData[]>([]);
  const [funnelLeads, setFunnelLeads] = useState<ChartData[]>([]);
  
  // Nuevos estados para Marketing y Mensajería
  const [fuentesCaptacion, setFuentesCaptacion] = useState<ChartData[]>([]);
  const [metricasMensajeria, setMetricasMensajeria] = useState<ChartData[]>([]);

  const supabase = createClient();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      
      // Parallel Fetching
      const [
        { data: pacientes, error: errPacientes },
        { data: consultas, error: errConsultas },
        { data: leads, error: errLeads }
      ] = await Promise.all([
        supabase.from('pacientes').select('id, fecha_registro, estado'),
        supabase.from('consultas').select('id, fecha_consulta, sede, estado_cita, confirmado_paciente'),
        // Se agregan campos de marketing y mensajería
        supabase.from('leads').select('id, estado, created_at, fuente_lead, canal_marketing, total_mensajes_enviados, total_mensajes_recibidos')
      ]);

      if (errPacientes) throw errPacientes;
      if (errConsultas) throw errConsultas;
      if (errLeads) throw errLeads;

      // Casteo seguro de tipos
      const safePacientes: RawPaciente[] = (pacientes || []) as unknown as RawPaciente[];
      const safeConsultas: RawConsulta[] = (consultas || []) as unknown as RawConsulta[];
      const safeLeads: RawLead[] = (leads || []) as unknown as RawLead[];

      // --- CALCULOS KPI ---
      const pacientesNuevos = safePacientes.filter(p => p.fecha_registro >= firstDayOfMonth).length;
      const consultasEsteMes = safeConsultas.filter(c => c.fecha_consulta >= firstDayOfMonth);
      const consultasConfirmadas = consultasEsteMes.filter(c => c.confirmado_paciente).length;
      
      const citasPasadas = safeConsultas.filter(c => ['Confirmada', 'No Asistió', 'Cancelada'].includes(c.estado_cita));
      const citasAsistidas = citasPasadas.filter(c => c.estado_cita === 'Confirmada').length;
      const tasaAsist = citasPasadas.length > 0 ? Math.round((citasAsistidas / citasPasadas.length) * 100) : 0;

      const leadsNuevos = safeLeads.filter(l => l.created_at >= firstDayOfMonth).length;
      const leadsConvertidos = safeLeads.filter(l => l.estado === 'Convertido' || l.estado === 'Ganado').length;
      const tasaConv = safeLeads.length > 0 ? Math.round((leadsConvertidos / safeLeads.length) * 100) : 0;

      setKpi({
        totalPacientes: safePacientes.length,
        pacientesNuevosMes: pacientesNuevos,
        consultasMes: consultasEsteMes.length,
        consultasConfirmadasMes: consultasConfirmadas,
        tasaAsistencia: tasaAsist,
        tasaConversion: tasaConv,
        totalLeads: safeLeads.length,
        leadsNuevosMes: leadsNuevos
      });

      // --- CHARTS: Consultas por Sede (Alto Contraste) ---
      const sedesMap = safeConsultas.reduce((acc: Record<string, number>, curr) => {
        const sede = curr.sede || 'SIN SEDE';
        acc[sede] = (acc[sede] || 0) + 1;
        return acc;
      }, {});
      
      setConsultasPorSede([
        { name: 'Polanco', value: sedesMap['POLANCO'] || 0, fill: '#c084fc' }, // Violet 400
        { name: 'Satélite', value: sedesMap['SATELITE'] || 0, fill: '#22d3ee' }, // Cyan 400
      ]);

      // --- CHARTS: Estado Citas (Semáforo Vibrante) ---
      const estadosMap = safeConsultas.reduce((acc: Record<string, number>, curr) => {
        const estado = curr.estado_cita || 'Desconocido';
        acc[estado] = (acc[estado] || 0) + 1;
        return acc;
      }, {});

      setEstadoCitas([
        { name: 'Programada', value: estadosMap['Programada'] || 0, fill: '#60a5fa' }, // Blue 400
        { name: 'Confirmada', value: estadosMap['Confirmada'] || 0, fill: '#4ade80' }, // Green 400
        { name: 'Cancelada', value: estadosMap['Cancelada'] || 0, fill: '#f87171' }, // Red 400
        { name: 'No Asistió', value: estadosMap['No Asistió'] || 0, fill: '#fbbf24' }, // Amber 400
      ]);

      // --- CHARTS: Funnel Leads (Gradiente Visual) ---
      const funnelOrder = ['Nuevo', 'Contactado', 'Interesado', 'Calificado', 'Convertido'];
      const funnelColors = ['#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#312e81']; // Indigo scale
      
      const funnelData = funnelOrder.map((estado, idx) => ({
        name: estado,
        value: safeLeads.filter(l => l.estado === estado).length,
        fill: funnelColors[idx] || '#6366f1'
      }));
      setFunnelLeads(funnelData);

      // --- CHARTS: Fuentes de Captación (Marketing) ---
      const fuentesMap = safeLeads.reduce((acc: Record<string, number>, curr) => {
        const fuente = curr.canal_marketing || curr.fuente_lead || 'Desconocido';
        acc[fuente] = (acc[fuente] || 0) + 1;
        return acc;
      }, {});

      // Colores vibrantes para fuentes: Instagram, Facebook, Google, WhatsApp, etc.
      const marketingColors = ['#f472b6', '#38bdf8', '#fbbf24', '#4ade80', '#94a3b8']; 
      setFuentesCaptacion(Object.entries(fuentesMap).map(([name, value], idx) => ({
        name,
        value,
        fill: marketingColors[idx % marketingColors.length]
      })).sort((a, b) => b.value - a.value)); // Ordenar por volumen

      // --- METRICAS: Mensajería ---
      const totalEnviados = safeLeads.reduce((sum, l) => sum + (l.total_mensajes_enviados || 0), 0);
      const totalRecibidos = safeLeads.reduce((sum, l) => sum + (l.total_mensajes_recibidos || 0), 0);
      
      setMetricasMensajeria([
        { name: 'Enviados (Bot/Agente)', value: totalEnviados, fill: '#38bdf8' },
        { name: 'Recibidos (Pacientes)', value: totalRecibidos, fill: '#a78bfa' }
      ]);

      // --- CHARTS: Evolución Mensual ---
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        return d;
      });

      const monthlyData = last6Months.map(date => {
        const monthKey = date.toISOString().slice(0, 7);
        const label = date.toLocaleDateString('es-MX', { month: 'short' });
        
        return {
          name: label.charAt(0).toUpperCase() + label.slice(1),
          consultas: safeConsultas.filter(c => String(c.fecha_consulta).startsWith(monthKey)).length,
          pacientes: safePacientes.filter(p => String(p.fecha_registro).startsWith(monthKey)).length,
          leads: safeLeads.filter(l => l.created_at && l.created_at.startsWith(monthKey)).length
        };
      });
      
      setEvolucionMensual(monthlyData);

    } catch (err: unknown) {
      console.error('Error fetching stats:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    loading,
    error,
    refresh: fetchStats,
    kpi,
    consultasPorSede,
    estadoCitas,
    evolucionMensual,
    funnelLeads,
    fuentesCaptacion,
    metricasMensajeria
  };
}
