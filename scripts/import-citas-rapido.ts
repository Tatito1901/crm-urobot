/**
 * Script rápido para importar solo citas de Doctoralia
 * Los pacientes ya están importados
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Cargar .env.local
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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CSV_PATH = path.join(process.cwd(), 'patients_appointments.csv');

function convertUTF16toUTF8(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
    return buffer.slice(2).toString('utf16le');
  }
  return buffer.toString('utf-8');
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  
  // Detectar separador (puede ser ; o \t)
  const sep = lines[0].includes(';') ? ';' : '\t';
  const headers = lines[0].split(sep).map(h => h.trim().replace(/^"|"$/g, ''));
  
  return lines.slice(1).map(line => {
    const values = line.split(sep).map(v => v.trim().replace(/^"|"$/g, ''));
    const record: Record<string, string> = {};
    headers.forEach((h, i) => { record[h] = values[i] || ''; });
    return record;
  });
}

function mapearEstado(status: string): string {
  const mapeo: Record<string, string> = {
    'Confirmed': 'Confirmada',
    'Pending': 'Pendiente',
    'CanceledByUser': 'Cancelada',
    'CanceledByDoctor': 'Cancelada',
    'Completed': 'Completada',
    'NoShow': 'No asistió',
  };
  return mapeo[status] || 'Completada';
}

function mapearSede(agenda: string): string | null {
  const lower = agenda.toLowerCase();
  if (lower.includes('trinidad')) return 'POLANCO';
  if (lower.includes('santa monica') || lower.includes('satelite')) return 'SATELITE';
  if (lower.includes('línea') || lower.includes('online')) return null;
  return null;
}

function mapearTipoCita(service: string): string {
  const lower = service.toLowerCase();
  if (lower.includes('primera') || lower.includes('first')) return 'Primera Vez';
  if (lower.includes('sucesiva') || lower.includes('seguimiento')) return 'Seguimiento';
  return 'Seguimiento';
}

async function main() {
  console.log('🚀 Importando citas de Doctoralia...\n');
  
  // Obtener mapa de pacientes (doctoralia_id -> uuid) - paginar para obtener todos
  console.log('📋 Cargando mapa de pacientes...');
  const mapaPacientes = new Map<string, string>();
  let offset = 0;
  const PAGE_SIZE = 1000;
  
  while (true) {
    const { data: pacientes } = await supabase
      .from('pacientes')
      .select('id, doctoralia_id')
      .not('doctoralia_id', 'is', null)
      .range(offset, offset + PAGE_SIZE - 1);
    
    if (!pacientes || pacientes.length === 0) break;
    
    pacientes.forEach(p => {
      if (p.doctoralia_id) mapaPacientes.set(p.doctoralia_id, p.id);
    });
    
    offset += PAGE_SIZE;
    if (pacientes.length < PAGE_SIZE) break;
  }
  
  console.log(`   ✓ ${mapaPacientes.size} pacientes mapeados\n`);
  
  // Leer citas
  console.log('📅 Leyendo CSV de citas...');
  const content = convertUTF16toUTF8(CSV_PATH);
  const records = parseCSV(content);
  console.log(`   ✓ ${records.length} citas encontradas\n`);
  
  // Preparar batch de citas válidas
  console.log('🔄 Procesando citas...');
  const citasParaInsertar: any[] = [];
  let omitidas = 0;
  let sinPaciente = 0;
  let sinSede = 0;
  
  for (const record of records) {
    // Usar nombres correctos del CSV: patientId, eventId, start time, etc.
    const doctoraliaPatientId = record.patientId || record.patient_id;
    const pacienteId = mapaPacientes.get(doctoraliaPatientId);
    
    if (!pacienteId) {
      sinPaciente++;
      continue;
    }
    
    const sede = mapearSede(record.agenda || '');
    if (!sede) {
      sinSede++;
      continue;
    }
    
    const eventId = record.eventId || record.event_id || record.id;
    if (!eventId) {
      omitidas++;
      continue;
    }
    
    // Parsear fechas (formato: 2022-08-03 19:30)
    const startTime = record['start time'] || record.start_at;
    const endTime = record['end time'] || record.end_at;
    
    citasParaInsertar.push({
      paciente_id: pacienteId,
      fecha_hora_inicio: startTime ? new Date(startTime).toISOString() : null,
      fecha_hora_fin: endTime ? new Date(endTime).toISOString() : null,
      sede: sede,
      estado_cita: mapearEstado(record['appointment status'] || record.status || ''),
      tipo_cita: mapearTipoCita(record.service || ''),
      motivo_consulta: record.service || 'Consulta Urológica',
      origen: 'Doctoralia',
      doctoralia_event_id: eventId,
      recordatorio_24h_enviado: true,
      recordatorio_48h_enviado: true,
    });
  }
  
  console.log(`   ✓ ${citasParaInsertar.length} citas válidas`);
  console.log(`   ⏭️  ${sinPaciente} sin paciente vinculado`);
  console.log(`   ⏭️  ${sinSede} sin sede (online)`);
  console.log(`   ⏭️  ${omitidas} omitidas\n`);
  
  // Insertar en batches de 100
  console.log('💾 Insertando en base de datos...');
  const BATCH_SIZE = 100;
  let insertados = 0;
  let errores = 0;
  
  for (let i = 0; i < citasParaInsertar.length; i += BATCH_SIZE) {
    const batch = citasParaInsertar.slice(i, i + BATCH_SIZE);
    
    const { error } = await supabase
      .from('consultas')
      .upsert(batch, { onConflict: 'doctoralia_event_id', ignoreDuplicates: true });
    
    if (error) {
      console.error(`   ❌ Error en batch ${i}-${i + batch.length}: ${error.message}`);
      errores += batch.length;
    } else {
      insertados += batch.length;
      process.stdout.write(`\r   Progreso: ${insertados}/${citasParaInsertar.length}`);
    }
  }
  
  console.log(`\n\n✅ Importación completada!`);
  console.log(`   📊 Insertadas: ${insertados}`);
  console.log(`   ❌ Errores: ${errores}`);
  
  // Verificar total
  const { count } = await supabase
    .from('consultas')
    .select('*', { count: 'exact', head: true })
    .eq('origen', 'Doctoralia');
  
  console.log(`\n📈 Total citas Doctoralia en BD: ${count}`);
}

main().catch(console.error);
