// ✅ Estados EXACTOS de la BD (consultas.estado_cita CHECK constraint)
export const CONSULTA_ESTADOS = ['Programada', 'Confirmada', 'Reagendada', 'Cancelada', 'Completada', 'No Asistió'] as const;
export const CONSULTA_SEDES = ['POLANCO', 'SATELITE'] as const;

// ✅ Tipos de Consulta (Centralizado)
export const CONSULTA_TIPOS = [
  'primera_vez',
  'subsecuente',
  'control_post_op',
  'urgencia',
  'procedimiento_menor',
  'valoracion_prequirurgica',
  'teleconsulta',
] as const;

export const CONSULTA_ESTADOS_CONFIRMACION = ['Pendiente', 'Confirmada', 'No Confirmada'] as const;

export type ConsultaEstado = (typeof CONSULTA_ESTADOS)[number];
export type ConsultaSede = (typeof CONSULTA_SEDES)[number];
export type ConsultaTipo = (typeof CONSULTA_TIPOS)[number];
export type ConsultaEstadoConfirmacion = (typeof CONSULTA_ESTADOS_CONFIRMACION)[number];

// ✅ Interface adaptado EXACTAMENTE a lo que existe en Supabase
export interface Consulta {
  id: string;
  uuid: string;
  paciente: string;
  pacienteId: string | null;
  sede: ConsultaSede;
  tipo: ConsultaTipo; // tipo_cita en BD (Tipado estricto)
  estado: ConsultaEstado; // estado_cita en BD
  
  // Sistema de confirmación completo
  estadoConfirmacion: ConsultaEstadoConfirmacion;
  confirmadoPaciente: boolean;
  fechaConfirmacion: string | null;
  fechaLimiteConfirmacion: string | null;
  
  // Recordatorios enviados
  remConfirmacionInicialEnviado: boolean;
  rem48hEnviado: boolean;
  rem24hEnviado: boolean;
  rem3hEnviado: boolean;
  
  // Métricas calculadas
  horasHastaConsulta: number | null;
  diasHastaConsulta: number | null;
  requiereConfirmacion: boolean;
  confirmacionVencida: boolean;
  
  fecha: string;
  fechaConsulta: string;
  horaConsulta: string;
  timezone: string;
  motivoConsulta: string | null;
  duracionMinutos: number;
  calendarEventId: string | null;
  calendarLink: string | null;
  canalOrigen: string | null;
  canceladoPor?: string | null;
  motivoCancelacion?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_CONSULTA_ESTADO: ConsultaEstado = 'Programada';
export const DEFAULT_CONSULTA_SEDE: ConsultaSede = 'POLANCO';
export const DEFAULT_CONSULTA_TIPO: ConsultaTipo = 'primera_vez';

export function isConsultaEstado(value: unknown): value is ConsultaEstado {
  return typeof value === 'string' && (CONSULTA_ESTADOS as readonly string[]).includes(value);
}

export function isConsultaSede(value: unknown): value is ConsultaSede {
  return typeof value === 'string' && (CONSULTA_SEDES as readonly string[]).includes(value);
}

export function isConsultaTipo(value: unknown): value is ConsultaTipo {
  return typeof value === 'string' && (CONSULTA_TIPOS as readonly string[]).includes(value);
}

