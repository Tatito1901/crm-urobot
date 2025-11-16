export const PACIENTE_ESTADOS = ['Activo', 'Inactivo'] as const;

export type PacienteEstado = (typeof PACIENTE_ESTADOS)[number];

export interface Paciente {
  id: string;
  pacienteId: string; // ID legible (ej: "PAC-123")
  nombre: string;
  telefono: string;
  email: string | null;
  
  // Métricas de consultas
  totalConsultas: number;
  ultimaConsulta: string | null;
  diasDesdeUltimaConsulta: number | null;
  
  // Estado y metadata
  estado: PacienteEstado;
  fechaRegistro: string | null;
  fuenteOriginal: string | null;
  notas: string | null;
  
  // Indicadores visuales
  esReciente: boolean; // Registrado hace menos de 30 días
  requiereAtencion: boolean; // Sin consulta en 90+ días y activo
}

// Información médica extendida del paciente
export interface InformacionMedica {
  alergias?: string[];
  medicacionActual?: string[];
  antecedentes?: string[];
  grupoSanguineo?: string;
  observaciones?: string;
}

// Perfil completo del paciente con información médica
export interface PacienteDetallado extends Paciente {
  pacienteId: string; // ID legible (ej: "PAC-123")
  telefonoMx10: string | null;
  fechaRegistro: string;
  fuenteOriginal: string;
  notas: string | null;
  informacionMedica?: InformacionMedica;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_PACIENTE_ESTADO: PacienteEstado = 'Activo';

export function isPacienteEstado(value: unknown): value is PacienteEstado {
  return typeof value === 'string' && (PACIENTE_ESTADOS as readonly string[]).includes(value);
}
