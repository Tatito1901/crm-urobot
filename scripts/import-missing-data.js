/**
 * Script para importar datos faltantes de Doctoralia
 * - Notas clínicas (patients_ehr.csv)
 * - Antecedentes/medicamentos/alergias (patients.csv)
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuración - Usar variables de entorno
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Faltan variables de entorno SUPABASE');
  console.log('Ejecuta: source .env.local && node scripts/import-missing-data.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Rutas a los CSVs
const CSV_DIR = path.join(__dirname, '..', 'temp_csv_utf8');
const PATIENTS_CSV = path.join(CSV_DIR, 'patients.csv');
const PATIENTS_EHR_CSV = path.join(CSV_DIR, 'patients_ehr.csv');

// Parser simple de CSV con punto y coma
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(';').map(h => h.trim().toLowerCase().replace(/ /g, '_'));
  
  return lines.slice(1).map(line => {
    const values = line.split(';');
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i]?.trim() || null;
    });
    return obj;
  });
}

// Limpiar HTML de las notas
function cleanHtml(html) {
  if (!html) return '';
  return html
    .replace(/<p>/g, '')
    .replace(/<\/p>/g, '\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Limpiar teléfono
function cleanPhone(phone) {
  if (!phone) return null;
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length >= 10) {
    return cleaned.slice(-10);
  }
  return null;
}

async function importMissingNotes() {
  console.log('\n📋 IMPORTANDO NOTAS CLÍNICAS FALTANTES...\n');
  
  // 1. Obtener TODOS los episodios ya importados (paginado)
  const existingEpisodes = new Set();
  let page = 0;
  const pageSize = 1000;
  
  while (true) {
    const { data: batch, error: fetchError } = await supabase
      .from('consultas_notas')
      .select('doctoralia_episode_id')
      .not('doctoralia_episode_id', 'is', null)
      .range(page * pageSize, (page + 1) * pageSize - 1);
    
    if (fetchError) {
      console.error('❌ Error obteniendo notas existentes:', fetchError);
      return;
    }
    
    if (!batch || batch.length === 0) break;
    
    batch.forEach(n => existingEpisodes.add(n.doctoralia_episode_id));
    page++;
    
    if (batch.length < pageSize) break;
  }
  
  console.log(`📊 Notas existentes en BD: ${existingEpisodes.size}`);
  
  // 2. Obtener mapeo doctoralia_id -> paciente_id (paginado)
  const patientMap = new Map();
  let patientPage = 0;
  
  while (true) {
    const { data: patients, error: patientsError } = await supabase
      .from('pacientes')
      .select('id, doctoralia_id')
      .not('doctoralia_id', 'is', null)
      .range(patientPage * pageSize, (patientPage + 1) * pageSize - 1);
    
    if (patientsError) {
      console.error('❌ Error obteniendo pacientes:', patientsError);
      return;
    }
    
    if (!patients || patients.length === 0) break;
    
    patients.forEach(p => patientMap.set(p.doctoralia_id, p.id));
    patientPage++;
    
    if (patients.length < pageSize) break;
  }
  
  console.log(`📊 Pacientes con doctoralia_id: ${patientMap.size}`);
  
  // 3. Leer CSV de notas
  const ehrData = parseCSV(PATIENTS_EHR_CSV);
  console.log(`📊 Líneas en CSV: ${ehrData.length}`);
  
  // 3.1 Deduplicar por episodeId (quedarse con la última versión/sequence más alto)
  const episodeMap = new Map();
  ehrData.forEach(note => {
    const episodeId = note.episodeid;
    const sequence = parseInt(note.sequence) || 0;
    
    if (!episodeMap.has(episodeId) || episodeMap.get(episodeId).seq < sequence) {
      episodeMap.set(episodeId, { note, seq: sequence });
    }
  });
  
  const uniqueNotes = Array.from(episodeMap.values()).map(e => e.note);
  console.log(`📊 Episodios únicos en CSV: ${uniqueNotes.length}`);
  
  // 4. Filtrar notas faltantes
  const missingNotes = uniqueNotes.filter(note => {
    const episodeId = note.episodeid;
    const patientDocId = note.patientid;
    
    // Solo importar si:
    // - El episodio no existe en BD
    // - Tenemos el paciente en BD
    return episodeId && 
           !existingEpisodes.has(episodeId) && 
           patientMap.has(patientDocId);
  });
  
  console.log(`📊 Notas faltantes a importar: ${missingNotes.length}`);
  
  if (missingNotes.length === 0) {
    console.log('✅ No hay notas faltantes para importar');
    return;
  }
  
  // 5. Preparar datos para inserción
  const notesToInsert = missingNotes.map(note => ({
    paciente_id: patientMap.get(note.patientid),
    titulo: note.title || 'Nota clínica',
    nota: cleanHtml(note.value),
    fecha: note.date || null,
    origen: 'Doctoralia',
    doctoralia_episode_id: note.episodeid
  }));
  
  // 6. Insertar uno por uno para manejar duplicados
  let inserted = 0;
  let skipped = 0;
  let errors = 0;
  
  for (let i = 0; i < notesToInsert.length; i++) {
    const note = notesToInsert[i];
    
    const { error: insertError } = await supabase
      .from('consultas_notas')
      .upsert(note, { 
        onConflict: 'doctoralia_episode_id',
        ignoreDuplicates: true 
      });
    
    if (insertError) {
      if (insertError.message.includes('duplicate')) {
        skipped++;
      } else {
        errors++;
      }
    } else {
      inserted++;
    }
    
    if ((i + 1) % 50 === 0 || i === notesToInsert.length - 1) {
      process.stdout.write(`\r✅ Insertadas: ${inserted} | ⏭️ Omitidas: ${skipped} | ❌ Errores: ${errors} | Procesadas: ${i + 1}/${notesToInsert.length}`);
    }
  }
  
  console.log(`\n\n📊 Resultado notas:`);
  console.log(`   ✅ Insertadas: ${inserted}`);
  console.log(`   ⏭️ Ya existían: ${skipped}`);
  console.log(`   ❌ Errores: ${errors}`);
}

async function updatePatientClinicalData() {
  console.log('\n💊 ACTUALIZANDO ANTECEDENTES/MEDICAMENTOS/ALERGIAS...\n');
  
  // 1. Leer CSV de pacientes
  const patientsData = parseCSV(PATIENTS_CSV);
  console.log(`📊 Pacientes en CSV: ${patientsData.length}`);
  
  // 2. Filtrar pacientes con datos clínicos
  const patientsWithData = patientsData.filter(p => 
    p.precedents || p.medications || p.allergies || p.observations
  );
  console.log(`📊 Pacientes con datos clínicos: ${patientsWithData.length}`);
  
  // 3. Actualizar cada paciente
  let updated = 0;
  let notFound = 0;
  let errors = 0;
  
  for (const patient of patientsWithData) {
    const docId = patient.id;
    
    if (!docId) continue;
    
    const updateData = {};
    
    if (patient.precedents) {
      updateData.antecedentes = patient.precedents;
    }
    if (patient.medications) {
      updateData.medicamentos = patient.medications;
    }
    if (patient.allergies) {
      updateData.alergias = patient.allergies;
    }
    if (patient.observations) {
      updateData.notas = patient.observations;
    }
    
    if (Object.keys(updateData).length === 0) continue;
    
    // Solo actualizar si los campos están vacíos
    const { data, error } = await supabase
      .from('pacientes')
      .update(updateData)
      .eq('doctoralia_id', docId)
      .or('antecedentes.is.null,antecedentes.eq.')
      .select('id');
    
    if (error) {
      // Intentar sin la condición OR
      const { data: data2, error: error2 } = await supabase
        .from('pacientes')
        .update(updateData)
        .eq('doctoralia_id', docId)
        .is('antecedentes', null)
        .select('id');
      
      if (error2) {
        errors++;
      } else if (data2 && data2.length > 0) {
        updated++;
      }
    } else if (data && data.length > 0) {
      updated++;
    } else {
      notFound++;
    }
    
    process.stdout.write(`\r✅ Actualizados: ${updated} | ⏭️ Omitidos: ${notFound}`);
  }
  
  console.log(`\n\n📊 Resultado antecedentes:`);
  console.log(`   ✅ Actualizados: ${updated}`);
  console.log(`   ⏭️ Omitidos (ya tenían datos o no encontrados): ${notFound}`);
  console.log(`   ❌ Errores: ${errors}`);
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('   IMPORTADOR DE DATOS FALTANTES DE DOCTORALIA');
  console.log('═══════════════════════════════════════════════════');
  
  // Verificar que existen los CSVs
  if (!fs.existsSync(PATIENTS_EHR_CSV)) {
    console.error(`❌ No se encontró: ${PATIENTS_EHR_CSV}`);
    process.exit(1);
  }
  if (!fs.existsSync(PATIENTS_CSV)) {
    console.error(`❌ No se encontró: ${PATIENTS_CSV}`);
    process.exit(1);
  }
  
  // Ejecutar importaciones
  await importMissingNotes();
  await updatePatientClinicalData();
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('   ✅ IMPORTACIÓN COMPLETADA');
  console.log('═══════════════════════════════════════════════════\n');
}

main().catch(console.error);
