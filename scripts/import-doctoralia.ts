/**
 * Script para importar datos de Doctoralia a Supabase
 * 
 * Uso: npx tsx scripts/import-doctoralia.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Cargar .env.local manualmente
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

// Configuración
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Faltan variables de entorno:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Paths de los CSV
const CSV_DIR = path.join(process.cwd());
const FILES = {
  patients: path.join(CSV_DIR, 'patients.csv'),
  appointments: path.join(CSV_DIR, 'patients_appointments.csv'),
  ehr: path.join(CSV_DIR, 'patients_ehr.csv'),
};

// =============================================
// Utilidades
// =============================================

function convertUTF16toUTF8(filePath: string): string {
  // Usar iconv para convertir
  const output = execSync(`iconv -f UTF-16LE -t UTF-8 "${filePath}"`, { 
    encoding: 'utf-8',
    maxBuffer: 50 * 1024 * 1024 // 50MB buffer
  });
  return output;
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n');
  if (lines.length === 0) return [];
  
  // Primera línea es el header
  const headers = lines[0].split(';').map(h => h.trim().toLowerCase().replace(/ /g, '_'));
  
  const records: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(';');
    const record: Record<string, string> = {};
    
    headers.forEach((header, idx) => {
      record[header] = values[idx]?.trim() || '';
    });
    
    records.push(record);
  }
  
  return records;
}

function normalizarTelefono(telefono: string): string {
  // Quitar caracteres no numéricos
  let limpio = telefono.replace(/[^0-9]/g, '');
  
  // Quitar prefijo de país 52
  if (limpio.length === 12 && limpio.startsWith('52')) {
    limpio = limpio.substring(2);
  }
  
  // Quitar comilla inicial si existe
  if (limpio.startsWith("'")) {
    limpio = limpio.substring(1);
  }
  
  return limpio;
}

function limpiarHTML(html: string): string {
  // Remover tags HTML y decodificar entidades básicas
  return html
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function mapearEstadoCita(status: string): string {
  const mapeo: Record<string, string> = {
    'ConfirmedByPatient': 'Confirmada',
    'Scheduled': 'Programada',
    'WaitingForConfirmation': 'Pendiente',
    'CanceledByUser': 'Cancelada',
    'CanceledByDoctor': 'Cancelada',
    'Completed': 'Completada',
    'NoShow': 'No asistió',
  };
  return mapeo[status] || 'Completada'; // Históricas asumimos completadas
}

function mapearSede(agenda: string): string | null {
  const lower = agenda.toLowerCase();
  if (lower.includes('trinidad')) return 'POLANCO';
  if (lower.includes('santa monica') || lower.includes('satelite')) return 'SATELITE';
  if (lower.includes('línea') || lower.includes('online')) return null; // Consultas online
  return null;
}

function mapearTipoCita(service: string): string {
  const lower = service.toLowerCase();
  if (lower.includes('primera') || lower.includes('first')) return 'Primera Vez';
  if (lower.includes('sucesiva') || lower.includes('seguimiento')) return 'Seguimiento';
  return 'Seguimiento';
}

// =============================================
// Importadores
// =============================================

async function importarPacientes(): Promise<Map<string, string>> {
  console.log('\n📋 Importando pacientes...');
  
  const content = convertUTF16toUTF8(FILES.patients);
  const records = parseCSV(content);
  
  console.log(`   Encontrados: ${records.length} pacientes`);
  
  // Mapa de doctoralia_id -> paciente_id (UUID)
  const mapaIds = new Map<string, string>();
  
  let creados = 0;
  let actualizados = 0;
  let errores = 0;
  
  for (const record of records) {
    try {
      const doctoraliaId = record.id;
      const telefono = normalizarTelefono(record.phone || '');
      const nombre = `${record.first_name || ''} ${record.last_name || ''}`.trim();
      
      if (!doctoraliaId) continue;
      
      // Buscar paciente existente por doctoralia_id o teléfono
      let pacienteId: string | null = null;
      
      if (telefono.length >= 10) {
        const { data: existente } = await supabase
          .from('pacientes')
          .select('id')
          .or(`doctoralia_id.eq.${doctoraliaId},telefono.ilike.%${telefono.slice(-10)}`)
          .limit(1)
          .single();
        
        pacienteId = existente?.id || null;
      }
      
      const dataPaciente = {
        nombre_completo: nombre || null,
        telefono: telefono.length >= 10 ? telefono : `DOC-${doctoraliaId}`,
        email: record.email || null,
        fecha_nacimiento: record.date_of_birth || null,
        antecedentes: record.precedents || null,
        medicamentos: record.medications || null,
        alergias: record.allergies || null,
        notas: record.observations || null,
        doctoralia_id: doctoraliaId,
        origen_lead: 'Doctoralia',
      };
      
      if (pacienteId) {
        // Actualizar existente (sin sobreescribir teléfono si ya tiene uno válido)
        const { error } = await supabase
          .from('pacientes')
          .update({
            antecedentes: dataPaciente.antecedentes,
            medicamentos: dataPaciente.medicamentos,
            alergias: dataPaciente.alergias,
            doctoralia_id: doctoraliaId,
          })
          .eq('id', pacienteId);
        
        if (error) throw error;
        mapaIds.set(doctoraliaId, pacienteId);
        actualizados++;
      } else {
        // Crear nuevo
        const { data: nuevo, error } = await supabase
          .from('pacientes')
          .insert(dataPaciente)
          .select('id')
          .single();
        
        if (error) throw error;
        mapaIds.set(doctoraliaId, nuevo.id);
        creados++;
      }
    } catch (err) {
      errores++;
      // Continuar con el siguiente
    }
  }
  
  console.log(`   ✅ Creados: ${creados}`);
  console.log(`   🔄 Actualizados: ${actualizados}`);
  console.log(`   ❌ Errores: ${errores}`);
  
  return mapaIds;
}

async function importarCitas(mapaPacientes: Map<string, string>): Promise<void> {
  console.log('\n📅 Importando citas...');
  
  const content = convertUTF16toUTF8(FILES.appointments);
  const records = parseCSV(content);
  
  console.log(`   Encontradas: ${records.length} citas`);
  
  let importadas = 0;
  let omitidas = 0;
  let errores = 0;
  
  for (const record of records) {
    try {
      const doctoraliaPatientId = record.patientid;
      const pacienteId = mapaPacientes.get(doctoraliaPatientId);
      const sede = mapearSede(record.agenda);
      const eventId = record.eventid;
      
      // Omitir si no hay sede válida (consultas online, etc.)
      if (!sede) {
        omitidas++;
        continue;
      }
      
      // Verificar si ya existe
      const { data: existente } = await supabase
        .from('consultas')
        .select('id')
        .eq('doctoralia_event_id', eventId)
        .limit(1)
        .single();
      
      if (existente) {
        omitidas++;
        continue;
      }
      
      const fechaInicio = record.start_time ? new Date(record.start_time.replace(' ', 'T') + ':00-06:00') : null;
      const fechaFin = record.end_time ? new Date(record.end_time.replace(' ', 'T') + ':00-06:00') : null;
      
      if (!fechaInicio) {
        omitidas++;
        continue;
      }
      
      const dataCita = {
        paciente_id: pacienteId || null,
        sede: sede,
        fecha_hora_inicio: fechaInicio.toISOString(),
        fecha_hora_fin: fechaFin?.toISOString() || null,
        estado_cita: mapearEstadoCita(record.appointment_status),
        tipo_cita: mapearTipoCita(record.service),
        motivo_consulta: record.comments || null,
        origen: 'Doctoralia',
        doctoralia_event_id: eventId,
        // Citas históricas: marcar recordatorios como enviados
        recordatorio_24h_enviado: true,
        recordatorio_48h_enviado: true,
        recordatorio_2h_enviado: true,
        confirmado_paciente: record.appointment_status === 'ConfirmedByPatient',
        estado_confirmacion: record.appointment_status === 'ConfirmedByPatient' ? 'Confirmada' : 'Completada',
      };
      
      const { error } = await supabase
        .from('consultas')
        .insert(dataCita);
      
      if (error) throw error;
      importadas++;
    } catch (err) {
      errores++;
    }
  }
  
  console.log(`   ✅ Importadas: ${importadas}`);
  console.log(`   ⏭️  Omitidas: ${omitidas}`);
  console.log(`   ❌ Errores: ${errores}`);
}

async function importarEpisodios(mapaPacientes: Map<string, string>): Promise<void> {
  console.log('\n🏥 Importando episodios clínicos...');
  
  const content = convertUTF16toUTF8(FILES.ehr);
  const records = parseCSV(content);
  
  console.log(`   Encontrados: ${records.length} episodios`);
  
  let importados = 0;
  let omitidos = 0;
  let errores = 0;
  
  for (const record of records) {
    try {
      const doctoraliaPatientId = record.patientid;
      const pacienteId = mapaPacientes.get(doctoraliaPatientId);
      const episodeId = record.episodeid;
      
      if (!pacienteId) {
        omitidos++;
        continue;
      }
      
      // Verificar si ya existe
      const { data: existente } = await supabase
        .from('consultas_notas')
        .select('id')
        .eq('doctoralia_episode_id', episodeId)
        .limit(1)
        .single();
      
      if (existente) {
        omitidos++;
        continue;
      }
      
      const contenidoLimpio = limpiarHTML(record.value || '');
      
      if (!contenidoLimpio) {
        omitidos++;
        continue;
      }
      
      const dataEpisodio = {
        paciente_id: pacienteId,
        consulta_id: null, // No vinculamos a consulta específica
        fecha: record.date || null,
        titulo: record.title || 'Nota clínica',
        nota: contenidoLimpio,
        origen: 'Doctoralia',
        doctoralia_episode_id: episodeId,
      };
      
      const { error } = await supabase
        .from('consultas_notas')
        .insert(dataEpisodio);
      
      if (error) throw error;
      importados++;
    } catch (err) {
      errores++;
    }
  }
  
  console.log(`   ✅ Importados: ${importados}`);
  console.log(`   ⏭️  Omitidos: ${omitidos}`);
  console.log(`   ❌ Errores: ${errores}`);
}

// =============================================
// Main
// =============================================

async function main() {
  console.log('🚀 Iniciando importación de Doctoralia...\n');
  console.log('📂 Directorio:', CSV_DIR);
  
  // Verificar archivos
  for (const [name, filePath] of Object.entries(FILES)) {
    if (!fs.existsSync(filePath)) {
      console.error(`❌ No se encontró: ${filePath}`);
      process.exit(1);
    }
    console.log(`✓ ${name}: encontrado`);
  }
  
  // Importar en orden
  const mapaPacientes = await importarPacientes();
  await importarCitas(mapaPacientes);
  await importarEpisodios(mapaPacientes);
  
  console.log('\n✅ Importación completada!');
  console.log('\n📊 Resumen:');
  console.log(`   Pacientes mapeados: ${mapaPacientes.size}`);
  
  // Verificar resultado
  const { count: totalPacientes } = await supabase.from('pacientes').select('*', { count: 'exact', head: true });
  const { count: totalConsultas } = await supabase.from('consultas').select('*', { count: 'exact', head: true });
  const { count: totalNotas } = await supabase.from('consultas_notas').select('*', { count: 'exact', head: true });
  
  console.log(`\n📈 Totales en BD:`);
  console.log(`   Pacientes: ${totalPacientes}`);
  console.log(`   Consultas: ${totalConsultas}`);
  console.log(`   Notas/Episodios: ${totalNotas}`);
}

main().catch(console.error);
