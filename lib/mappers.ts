/**
 * ============================================================
 * MAPPERS - Conversión entre Base de Datos y Frontend
 * ============================================================
 * 
 * Solución a inconsistencias de nomenclatura:
 * - Base de datos usa snake_case
 * - Frontend usa camelCase
 * 
 * Estos helpers garantizan mapeo consistente
 * ============================================================
 */

import type { Database } from '@/types/database';
import type { Consulta } from '@/types/consultas';
import type { Lead } from '@/types/leads';
import type { Paciente } from '@/types/pacientes';

// Types de BD
type ConsultaDB = Database['public']['Tables']['consultas']['Row'];
type LeadDB = Database['public']['Tables']['leads']['Row'];
type PacienteDB = Database['public']['Tables']['pacientes']['Row'];

// ========== CONSULTAS ==========

/**
 * Mapea consulta de BD (snake_case) a frontend (camelCase)
 */
export function mapConsultaFromDB(raw: ConsultaDB): Consulta {
  return {
    // IDs
    id: raw.consulta_id,
    uuid: raw.id,
    
    // Paciente
    paciente: '', // Se debe obtener por JOIN o query separada
    pacienteId: raw.paciente_id,
    
    // Ubicación
    sede: raw.sede as 'POLANCO' | 'SATELITE',
    
    // Tipo y detalles
    tipo: raw.tipo_cita,
    estado: raw.estado_cita as Consulta['estado'],
    
    // Sistema de confirmación
    estadoConfirmacion: raw.estado_confirmacion as Consulta['estadoConfirmacion'],
    confirmadoPaciente: raw.confirmado_paciente,
    fechaConfirmacion: raw.fecha_confirmacion,
    fechaLimiteConfirmacion: raw.fecha_limite_confirmacion,
    
    // Recordatorios enviados
    remConfirmacionInicialEnviado: raw.rem_confirmacion_inicial_enviado,
    rem48hEnviado: raw.rem_48h_enviado,
    rem24hEnviado: raw.rem_24h_enviado,
    rem3hEnviado: raw.rem_3h_enviado,
    
    // Fechas y horarios
    fecha: raw.fecha_hora_utc,
    fechaConsulta: raw.fecha_consulta,
    horaConsulta: raw.hora_consulta,
    timezone: raw.timezone,
    
    // Detalles
    motivoConsulta: raw.motivo_consulta,
    duracionMinutos: raw.duracion_minutos,
    
    // Google Calendar
    calendarEventId: raw.calendar_event_id,
    calendarLink: raw.calendar_link,
    
    // Cancelación
    canceladoPor: raw.cancelado_por,
    motivoCancelacion: raw.motivo_cancelacion,
    
    // Canal
    canalOrigen: raw.canal_origen,
    
    // Metadata
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    
    // Campos calculados (se calculan en el hook)
    horasHastaConsulta: null,
    diasHastaConsulta: null,
    requiereConfirmacion: false,
    confirmacionVencida: false,
  };
}

/**
 * Mapea consulta de frontend a formato para INSERT/UPDATE en BD
 */
export function mapConsultaToDB(consulta: Partial<Consulta>): Partial<ConsultaDB> {
  return {
    consulta_id: consulta.id,
    paciente_id: consulta.pacienteId || '',
    sede: consulta.sede,
    tipo_cita: consulta.tipo,
    estado_cita: consulta.estado,
    estado_confirmacion: consulta.estadoConfirmacion,
    confirmado_paciente: consulta.confirmadoPaciente,
    fecha_confirmacion: consulta.fechaConfirmacion,
    fecha_limite_confirmacion: consulta.fechaLimiteConfirmacion,
    rem_confirmacion_inicial_enviado: consulta.remConfirmacionInicialEnviado,
    rem_48h_enviado: consulta.rem48hEnviado,
    rem_24h_enviado: consulta.rem24hEnviado,
    rem_3h_enviado: consulta.rem3hEnviado,
    fecha_hora_utc: consulta.fecha,
    fecha_consulta: consulta.fechaConsulta,
    hora_consulta: consulta.horaConsulta,
    timezone: consulta.timezone,
    motivo_consulta: consulta.motivoConsulta,
    duracion_minutos: consulta.duracionMinutos,
    calendar_event_id: consulta.calendarEventId,
    calendar_link: consulta.calendarLink,
    cancelado_por: consulta.canceladoPor,
    motivo_cancelacion: consulta.motivoCancelacion,
    canal_origen: consulta.canalOrigen ?? undefined,
  };
}

// ========== LEADS ==========

/**
 * Mapea lead de BD a frontend
 */
export function mapLeadFromDB(raw: LeadDB): Partial<Lead> {
  return {
    id: raw.id,
    leadId: raw.lead_id,
    nombre: raw.nombre_completo,
    telefono: raw.telefono_whatsapp,
    estado: raw.estado as Lead['estado'],
    primerContacto: raw.fecha_primer_contacto,
    fuente: raw.fuente_lead,
    ultimaInteraccion: raw.ultima_interaccion || undefined,
    
    // Campos de BD (anteriormente faltantes)
    temperatura: raw.temperatura as Lead['temperatura'],
    puntuacionLead: raw.puntuacion_lead,
    canalMarketing: (raw.canal_marketing || undefined) as Lead['canalMarketing'],
    
    // Métricas de engagement
    totalInteracciones: raw.total_interacciones,
    totalMensajesEnviados: raw.total_mensajes_enviados,
    totalMensajesRecibidos: raw.total_mensajes_recibidos,
    
    // Datos de conversión
    esCliente: raw.estado === 'Convertido',
    fechaConversion: raw.fecha_conversion || undefined,
    
    // Session
    sessionId: raw.session_id || undefined,
    notas: raw.notas_iniciales || undefined,
    
    // Campos calculados (se calculan en enrichLead)
    diasDesdeContacto: 0,
    diasDesdeUltimaInteraccion: null,
    diasDesdeConversion: null,
    paciente: null,
    esCaliente: false,
    esInactivo: false,
  };
}

/**
 * Mapea lead de frontend a BD
 */
export function mapLeadToDB(lead: Partial<Lead>): Partial<LeadDB> {
  return {
    lead_id: lead.leadId || undefined,
    nombre_completo: lead.nombre,
    telefono_whatsapp: lead.telefono,
    estado: lead.estado,
    fecha_primer_contacto: lead.primerContacto,
    fuente_lead: lead.fuente,
    ultima_interaccion: lead.ultimaInteraccion || undefined,
    
    // Campos de BD
    temperatura: lead.temperatura,
    puntuacion_lead: lead.puntuacionLead,
    canal_marketing: lead.canalMarketing || undefined,
    
    // Métricas
    total_interacciones: lead.totalInteracciones,
    total_mensajes_enviados: lead.totalMensajesEnviados,
    total_mensajes_recibidos: lead.totalMensajesRecibidos,
    
    // Conversión
    fecha_conversion: lead.fechaConversion || undefined,
    
    // Session
    session_id: lead.sessionId || undefined,
    notas_iniciales: lead.notas || undefined,
  };
}

// ========== PACIENTES ==========

/**
 * Mapea paciente de BD a frontend
 */
export function mapPacienteFromDB(raw: PacienteDB): Partial<Paciente> {
  return {
    id: raw.id,
    pacienteId: raw.paciente_id,
    nombre: raw.nombre_completo,
    telefono: raw.telefono,
    email: raw.email || undefined,
    
    // Métricas
    totalConsultas: raw.total_consultas,
    ultimaConsulta: raw.ultima_consulta,
    
    // Estado
    estado: raw.estado as Paciente['estado'],
    fechaRegistro: raw.fecha_registro,
    fuenteOriginal: raw.fuente_original,
    notas: raw.notas,
    
    // Campos calculados (se calculan en el hook)
    diasDesdeUltimaConsulta: null,
    esReciente: false,
    requiereAtencion: false,
  };
}

/**
 * Mapea paciente de frontend a BD
 */
export function mapPacienteToDB(paciente: Partial<Paciente>): Partial<PacienteDB> {
  return {
    paciente_id: paciente.pacienteId || '',
    nombre_completo: paciente.nombre,
    telefono: paciente.telefono,
    email: paciente.email,
    total_consultas: paciente.totalConsultas,
    ultima_consulta: paciente.ultimaConsulta,
    estado: paciente.estado,
    fecha_registro: paciente.fechaRegistro || undefined,
    fuente_original: paciente.fuenteOriginal || undefined,
    notas: paciente.notas || undefined,
  };
}

// ========== HELPERS ==========

/**
 * Calcula campos derivados de una consulta
 */
export function enrichConsulta(consulta: Consulta): Consulta {
  const now = new Date();
  const fechaConsulta = new Date(consulta.fecha);
  
  const horasHasta = (fechaConsulta.getTime() - now.getTime()) / (1000 * 60 * 60);
  const diasHasta = Math.floor(horasHasta / 24);
  
  const requiereConfirmacion = !consulta.confirmadoPaciente && fechaConsulta > now;
  const confirmacionVencida = consulta.fechaLimiteConfirmacion 
    ? new Date(consulta.fechaLimiteConfirmacion) < now && !consulta.confirmadoPaciente
    : false;
  
  return {
    ...consulta,
    horasHastaConsulta: horasHasta > 0 ? Math.floor(horasHasta) : null,
    diasHastaConsulta: diasHasta > 0 ? diasHasta : null,
    requiereConfirmacion,
    confirmacionVencida,
  };
}

/**
 * Calcula campos derivados de un lead
 */
export function enrichLead(lead: Partial<Lead>): Lead {
  const now = new Date();
  const primerContacto = new Date(lead.primerContacto || now);
  const ultimaInteraccion = lead.ultimaInteraccion ? new Date(lead.ultimaInteraccion) : null;
  const fechaConversion = lead.fechaConversion ? new Date(lead.fechaConversion) : null;
  
  const diasDesdeContacto = Math.floor((now.getTime() - primerContacto.getTime()) / (1000 * 60 * 60 * 24));
  const diasDesdeUltimaInteraccion = ultimaInteraccion 
    ? Math.floor((now.getTime() - ultimaInteraccion.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const diasDesdeConversion = fechaConversion
    ? Math.floor((now.getTime() - fechaConversion.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  
  const esCaliente = (lead.totalInteracciones || 0) >= 5 && (diasDesdeUltimaInteraccion || 999) <= 2;
  const esInactivo = (diasDesdeUltimaInteraccion || 0) >= 7;
  
  return {
    ...lead,
    diasDesdeContacto,
    diasDesdeUltimaInteraccion,
    diasDesdeConversion,
    esCaliente,
    esInactivo,
  } as Lead;
}

/**
 * Calcula campos derivados de un paciente
 */
export function enrichPaciente(paciente: Partial<Paciente>): Paciente {
  const now = new Date();
  const ultimaConsulta = paciente.ultimaConsulta ? new Date(paciente.ultimaConsulta) : null;
  const fechaRegistro = paciente.fechaRegistro ? new Date(paciente.fechaRegistro) : null;
  
  const diasDesdeUltimaConsulta = ultimaConsulta
    ? Math.floor((now.getTime() - ultimaConsulta.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  
  const diasDesdeRegistro = fechaRegistro
    ? Math.floor((now.getTime() - fechaRegistro.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  
  const esReciente = (diasDesdeRegistro || 999) <= 30;
  const requiereAtencion = paciente.estado === 'Activo' && (diasDesdeUltimaConsulta || 0) >= 90;
  
  return {
    ...paciente,
    diasDesdeUltimaConsulta,
    esReciente,
    requiereAtencion,
  } as Paciente;
}

// ========== BATCH MAPPERS ==========

/**
 * Mapea array de consultas
 */
export function mapConsultasFromDB(consultas: ConsultaDB[]): Consulta[] {
  return consultas.map(c => enrichConsulta(mapConsultaFromDB(c)));
}

/**
 * Mapea array de leads
 */
export function mapLeadsFromDB(leads: LeadDB[]): Lead[] {
  return leads.map(l => enrichLead(mapLeadFromDB(l)));
}

/**
 * Mapea array de pacientes
 */
export function mapPacientesFromDB(pacientes: PacienteDB[]): Paciente[] {
  return pacientes.map(p => enrichPaciente(mapPacienteFromDB(p)));
}
