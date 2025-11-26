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

// ============================================================
// DESTINO DEL PACIENTE - Seguimiento de altas, presupuestos y cirugías
// ============================================================

export const TIPOS_DESTINO = [
  'alta_definitiva',
  'presupuesto_enviado',
  'cirugia_realizada',
  'seguimiento',
  'pendiente',
] as const;

export type TipoDestino = (typeof TIPOS_DESTINO)[number];

export const TIPOS_CIRUGIA = [
  'Prostatectomía',
  'Cistectomía',
  'Nefrectomía',
  'Ureterolitotomía',
  'Resección transuretral',
  'Circuncisión',
  'Vasectomía',
  'Varicocelectomía',
  'Hidrocelelectomía',
  'Orquidopexia',
  'Biopsia prostática',
  'Litotricia',
  'Otra',
] as const;

export type TipoCirugia = (typeof TIPOS_CIRUGIA)[number];

// Información de presupuesto enviado
export interface PresupuestoCirugia {
  tipoCirugia: string;
  monto: number;
  moneda: 'MXN';
  fechaEnvio: string;
  notas?: string;
}

// Información de cirugía realizada
export interface CirugiaRealizada {
  tipoCirugia: string;
  costo: number;
  moneda: 'MXN';
  fechaCirugia: string;
  sedeOperacion?: string;
  notas?: string;
}

// Destino completo del paciente
export interface DestinoPaciente {
  tipo: TipoDestino;
  fechaRegistro: string;
  
  // Solo si es alta definitiva
  motivoAlta?: string;
  
  // Solo si se envió presupuesto
  presupuesto?: PresupuestoCirugia;
  
  // Solo si se realizó cirugía
  cirugia?: CirugiaRealizada;
  
  // Observaciones generales
  observaciones?: string;
}

export const DESTINO_LABELS: Record<TipoDestino, string> = {
  alta_definitiva: 'Alta Definitiva',
  presupuesto_enviado: 'Presupuesto Enviado',
  cirugia_realizada: 'Cirugía Realizada',
  seguimiento: 'En Seguimiento',
  pendiente: 'Pendiente',
};

export const DESTINO_COLORS: Record<TipoDestino, string> = {
  alta_definitiva: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  presupuesto_enviado: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  cirugia_realizada: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  seguimiento: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  pendiente: 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400',
};

// Perfil completo del paciente con información médica y destino
export interface PacienteDetallado extends Paciente {
  pacienteId: string; // ID legible (ej: "PAC-123")
  telefonoMx10: string | null;
  fechaRegistro: string;
  fuenteOriginal: string;
  notas: string | null;
  informacionMedica?: InformacionMedica;
  destino?: DestinoPaciente;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_PACIENTE_ESTADO: PacienteEstado = 'Activo';

export function isPacienteEstado(value: unknown): value is PacienteEstado {
  return typeof value === 'string' && (PACIENTE_ESTADOS as readonly string[]).includes(value);
}
