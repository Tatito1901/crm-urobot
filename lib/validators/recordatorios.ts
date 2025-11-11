import type { Tables } from '@/types/database';
import {
  DEFAULT_RECORDATORIO_CANAL,
  DEFAULT_RECORDATORIO_ESTADO,
  DEFAULT_RECORDATORIO_TIPO,
  isRecordatorioCanal,
  isRecordatorioEstado,
  isRecordatorioTipo,
} from '@/types/recordatorios';

export type ConsultaRow = Tables<'consultas'> & {
  paciente: {
    id: string;
    nombre_completo: string;
  } | null;
};

export type RecordatorioRow = Tables<'recordatorios'> & {
  consulta: ConsultaRow | null;
};

function sanitizePaciente(input: unknown): ConsultaRow['paciente'] {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const candidate = input as { id?: unknown; nombre_completo?: unknown };
  if (typeof candidate.id !== 'string' || typeof candidate.nombre_completo !== 'string') {
    return null;
  }

  return {
    id: candidate.id,
    nombre_completo: candidate.nombre_completo,
  };
}

function sanitizeConsulta(input: unknown): ConsultaRow | null {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const candidate = input as Partial<ConsultaRow>;
  if (typeof candidate.id !== 'string') {
    return null;
  }

  return {
    ...candidate,
    id: candidate.id,
    consulta_id: typeof candidate.consulta_id === 'string' ? candidate.consulta_id : null,
    sede: typeof candidate.sede === 'string' ? candidate.sede : null,
    estado_cita: typeof candidate.estado_cita === 'string' ? candidate.estado_cita : null,
    paciente: sanitizePaciente(candidate.paciente ?? null),
  } as ConsultaRow;
}

export function parseRecordatorioRows(input: unknown): RecordatorioRow[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const sanitized: RecordatorioRow[] = [];

  for (const entry of input) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }

    const candidate = entry as Partial<RecordatorioRow>;
    if (typeof candidate.id !== 'string' || typeof candidate.programado_para !== 'string') {
      continue;
    }

    const tipo =
      typeof candidate.tipo === 'string' && isRecordatorioTipo(candidate.tipo)
        ? candidate.tipo
        : DEFAULT_RECORDATORIO_TIPO;

    const estado =
      candidate.estado === null || (typeof candidate.estado === 'string' && isRecordatorioEstado(candidate.estado))
        ? candidate.estado
        : DEFAULT_RECORDATORIO_ESTADO;

    const canal =
      candidate.canal === null || (typeof candidate.canal === 'string' && isRecordatorioCanal(candidate.canal))
        ? candidate.canal
        : DEFAULT_RECORDATORIO_CANAL;

    sanitized.push({
      ...candidate,
      id: candidate.id,
      recordatorio_id:
        candidate.recordatorio_id === null || typeof candidate.recordatorio_id === 'string'
          ? candidate.recordatorio_id
          : null,
      consulta_id:
        candidate.consulta_id === null || typeof candidate.consulta_id === 'string'
          ? candidate.consulta_id
          : null,
      tipo,
      programado_para: candidate.programado_para,
      enviado_en:
        candidate.enviado_en === null || typeof candidate.enviado_en === 'string'
          ? candidate.enviado_en
          : null,
      estado,
      canal,
      mensaje_enviado:
        candidate.mensaje_enviado === null || typeof candidate.mensaje_enviado === 'string'
          ? candidate.mensaje_enviado
          : null,
      plantilla_usada:
        candidate.plantilla_usada === null || typeof candidate.plantilla_usada === 'string'
          ? candidate.plantilla_usada
          : null,
      intentos:
        candidate.intentos === null || typeof candidate.intentos === 'number'
          ? candidate.intentos ?? null
          : null,
      error_mensaje:
        candidate.error_mensaje === null || typeof candidate.error_mensaje === 'string'
          ? candidate.error_mensaje
          : null,
      created_at:
        candidate.created_at === null || typeof candidate.created_at === 'string'
          ? candidate.created_at
          : null,
      updated_at:
        candidate.updated_at === null || typeof candidate.updated_at === 'string'
          ? candidate.updated_at
          : null,
      consulta: sanitizeConsulta(candidate.consulta ?? null),
    } as RecordatorioRow);
  }

  return sanitized;
}
