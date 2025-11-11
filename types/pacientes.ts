export const PACIENTE_ESTADOS = ['Activo', 'Inactivo'] as const;

export type PacienteEstado = (typeof PACIENTE_ESTADOS)[number];

export interface Paciente {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  totalConsultas: number;
  ultimaConsulta: string | null;
  estado: PacienteEstado;
}

export const DEFAULT_PACIENTE_ESTADO: PacienteEstado = 'Activo';

export function isPacienteEstado(value: unknown): value is PacienteEstado {
  return typeof value === 'string' && (PACIENTE_ESTADOS as readonly string[]).includes(value);
}
