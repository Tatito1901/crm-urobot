export const CONSULTA_ESTADOS = ['Programada', 'Confirmada', 'Reagendada', 'Cancelada', 'Completada', 'No Asistió'] as const;
export const CONSULTA_SEDES = ['POLANCO', 'SATELITE'] as const;

export type ConsultaEstado = (typeof CONSULTA_ESTADOS)[number];
export type ConsultaSede = (typeof CONSULTA_SEDES)[number];

export interface Consulta {
  id: string;
  uuid: string;
  paciente: string;
  pacienteId: string | null;
  sede: ConsultaSede;
  tipo: string;
  estado: ConsultaEstado;
  
  // Sistema de confirmación completo
  estadoConfirmacion: 'Pendiente' | 'Confirmada' | 'No Confirmada';
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

export function isConsultaEstado(value: unknown): value is ConsultaEstado {
  return typeof value === 'string' && (CONSULTA_ESTADOS as readonly string[]).includes(value);
}

export function isConsultaSede(value: unknown): value is ConsultaSede {
  return typeof value === 'string' && (CONSULTA_SEDES as readonly string[]).includes(value);
}
