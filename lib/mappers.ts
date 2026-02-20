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
export { mapPacienteFromDB } from '@/types/pacientes';
