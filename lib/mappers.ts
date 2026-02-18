/**
 * ============================================================
 * MAPPERS - Conversión BD → Frontend
 * ============================================================
 * SINCRONIZADO CON BD REAL: 2025-12-01
 * 
 * Los mappers individuales están en cada archivo de tipos:
 * - types/consultas.ts → mapConsultaFromDB
 * - types/leads.ts → mapLeadFromDB
 * - types/pacientes.ts → mapPacienteFromDB
 * - types/destinos-pacientes.ts → mapDestinoPacienteFromDB
 * 
 * Este archivo re-exporta y proporciona helpers adicionales.
 * ============================================================
 */

// Re-exportar mappers desde tipos
export { mapConsultaFromDB, type Consulta, type ConsultaRow } from '@/types/consultas';
export { mapLeadFromDB, type Lead, type LeadRow } from '@/types/leads';
export { mapPacienteFromDB, type Paciente, type PacienteRow, type PacienteStatsRow } from '@/types/pacientes';
export { 
  mapDestinoPacienteFromDB, 
  type DestinoPaciente, 
  type DestinoPacienteRow,
  DESTINO_LABELS,
  DESTINO_COLORS,
  TIPOS_DESTINO,
  TIPOS_CIRUGIA,
} from '@/types/destinos-pacientes';

import type { Consulta, ConsultaRow } from '@/types/consultas';
import type { Lead } from '@/types/leads';
import { mapConsultaFromDB } from '@/types/consultas';

// ========== ENRICHERS (Campos calculados) ==========

/**
 * Calcula campos derivados de una consulta
 */
export function enrichConsulta(consulta: Consulta): Consulta {
  const now = new Date();
  const fechaInicio = new Date(consulta.fechaHoraInicio);
  
  const horasHasta = (fechaInicio.getTime() - now.getTime()) / (1000 * 60 * 60);
  const diasHasta = Math.floor(horasHasta / 24);
  
  return {
    ...consulta,
    horasHastaConsulta: horasHasta > 0 ? Math.floor(horasHasta) : null,
    diasHastaConsulta: diasHasta > 0 ? diasHasta : null,
  };
}

/**
 * Calcula campos derivados de un lead
 */
export function enrichLead(lead: Lead): Lead {
  const now = Date.now();
  const primerContacto = lead.createdAt ? new Date(lead.createdAt).getTime() : now;
  const ultimaInteraccion = lead.ultimaInteraccion ? new Date(lead.ultimaInteraccion).getTime() : null;
  
  const diasDesdeContacto = Math.floor((now - primerContacto) / (1000 * 60 * 60 * 24));
  const diasDesdeUltimaInteraccion = ultimaInteraccion 
    ? Math.floor((now - ultimaInteraccion) / (1000 * 60 * 60 * 24))
    : null;
  
  const esCaliente = (lead.totalMensajes || 0) >= 5 && (diasDesdeUltimaInteraccion || 999) <= 2;
  const esInactivo = (diasDesdeUltimaInteraccion || 0) >= 7;
  
  return {
    ...lead,
    diasDesdeContacto,
    diasDesdeUltimaInteraccion,
    esCaliente,
    esInactivo,
  };
}

// ========== BATCH MAPPERS ==========

/**
 * Mapea un array de filas de consultas a objetos Consulta
 */
export function mapConsultasFromDB(rows: ConsultaRow[], pacienteNombre?: string): Consulta[] {
  return rows.map(row => enrichConsulta(mapConsultaFromDB(row, pacienteNombre)));
}
