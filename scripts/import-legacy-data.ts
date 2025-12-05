import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import csv from 'csv-parser';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// --- CONFIGURACIÓN ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Usar Service Role para bypass RLS

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Rutas de archivos (YA CONVERTIDOS A UTF-8)
const CSV_DIR = path.join(__dirname, '../temp_csv_utf8');
const FILES = {
  patients: path.join(CSV_DIR, 'patients.csv'),
  appointments: path.join(CSV_DIR, 'patients_appointments.csv'),
  ehr: path.join(CSV_DIR, 'patients_ehr.csv'),
  attachments: path.join(CSV_DIR, 'patients_ehr_attachments.csv'),
};

// --- MAPPERS Y UTILIDADES ---

// Mapa en memoria para vincular IDs Legacy -> UUIDs
const patientIdMap = new Map<string, string>(); // doctoralia_id -> uuid
const appointmentIdMap = new Map<string, string>(); // doctoralia_event_id -> uuid (consulta_id)
const noteIdMap = new Map<string, string>(); // doctoralia_episode_id -> uuid (nota_id)

async function readCsv(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csv({ 
        separator: ';',
        mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, '') // Eliminar BOM y espacios
      }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

// --- PASO 1: PACIENTES ---
async function importPatients() {
  console.log('🚀 Iniciando importación de Pacientes...');
  const patients = await readCsv(FILES.patients);
  console.log(`📄 ${patients.length} pacientes encontrados en CSV.`);
  
  if (patients.length > 0) {
    // console.log('🔍 DEBUG - Primera fila (Keys):', Object.keys(patients[0]));
    // console.log('🔍 DEBUG - Primera fila (Values):', patients[0]);
  }

  let processed = 0;
  const batchSize = 100;
  
  // Procesar en lotes para no saturar
  for (let i = 0; i < patients.length; i += batchSize) {
    const batch = patients.slice(i, i + batchSize);
    const upsertData = [];

    for (const p of batch) {
      const legacyId = p['id'];
      if (!legacyId) continue;

      const fullName = `${p['first name'] || ''} ${p['last name'] || ''}`.trim();
      // Normalizar teléfono (muy básico, ideal usar lib/utils)
      let phoneRaw = p['phone'] || p['additional phone'] || '';
      // Limpiar todo lo que no sea número
      let phone = phoneRaw.replace(/\D/g, '');
      
      // Manejo básico de prefijo +52
      if (phone.startsWith('52') && phone.length > 10) {
        phone = phone.substring(2);
      }

      // Validación estricta de longitud (suponiendo validación MX 10 dígitos en BD)
      if (phone.length !== 10) {
         // Si no es válido, usar dummy único que parezca móvil (99 + 8 dígitos)
         // Asegurar que el legacyId no rompa la longitud
         const safeId = legacyId.replace(/\D/g, '').slice(-8).padStart(8, '0');
         phone = `99${safeId}`; 
      }

      // Guardar dirección en JSONB
      const addressData = {
        street: p['address street'],
        number: p['address number'],
        postal_code: p['address postal code'],
        neighborhood: p['address neighbordhood'],
        city: p['address city'],
        state: p['address state'],
        country: p['address country']
      };

      upsertData.push({
        doctoralia_id: legacyId,
        nombre_completo: fullName,
        telefono: phone,
        email: p['email'] || null,
        fecha_nacimiento: p['date of birth'] || null,
        origen_lead: 'Importación Doctoralia',
        notas: p['observations'] || null,
        antecedentes: p['precedents'] || null,
        medicamentos: p['medications'] || null,
        alergias: p['allergies'] || null,
        // Campos extra mapeados a JSONB o columnas nuevas si existen
        // direccion_data: addressData (Si creamos la columna, descomentar)
      });
    }

    // Upsert tolerante a fallos de unique constraint (telefono)
    // Primero intentamos el batch normal
    const { data, error } = await supabase
      .from('pacientes')
      .upsert(upsertData, { onConflict: 'doctoralia_id', ignoreDuplicates: false })
      .select('id, doctoralia_id');

    if (error) {
      // Si falla el batch por unique constraint, intentamos uno por uno
      if (error.code === '23505') { // Unique violation
        console.warn('⚠️ Conflicto de duplicados en lote, reintentando uno por uno...');
        for (const item of upsertData) {
            const { data: singleData, error: singleError } = await supabase
                .from('pacientes')
                .upsert(item, { onConflict: 'doctoralia_id' })
                .select('id, doctoralia_id');
            
            if (singleError) {
                // Si falla por teléfono duplicado, intentamos buscar por teléfono y actualizar doctoralia_id
                if (singleError.code === '23505' && singleError.message.includes('telefono')) {
                    const { data: existing } = await supabase.from('pacientes').select('id').eq('telefono', item.telefono).single();
                    if (existing) {
                        // Vincular el ID legacy al paciente existente
                        await supabase.from('pacientes').update({ doctoralia_id: item.doctoralia_id }).eq('id', existing.id);
                        patientIdMap.set(item.doctoralia_id, existing.id);
                        processed++;
                        continue;
                    }
                }
                // Si sigue fallando o es otro error, dummy phone
                item.telefono = `DUMMY-${uuidv4().slice(0,4)}-${item.telefono.slice(-4)}`; // Fallback feo pero funciona
                 // Reintentar inserción con teléfono dummy
                 const { data: retryData } = await supabase.from('pacientes').upsert(item, { onConflict: 'doctoralia_id' }).select('id, doctoralia_id');
                 if (retryData && retryData[0]) {
                    patientIdMap.set(retryData[0].doctoralia_id, retryData[0].id);
                    processed++;
                 }
            } else if (singleData && singleData[0]) {
                patientIdMap.set(singleData[0].doctoralia_id, singleData[0].id);
                processed++;
            }
        }
      } else {
        console.error('❌ Error insertando lote pacientes:', error);
      }
    } else {
      // Actualizar mapa de IDs
      data.forEach((row) => {
        if (row.doctoralia_id) patientIdMap.set(row.doctoralia_id, row.id);
      });
      processed += data.length;
    }
  }
  console.log(`✅ ${processed} Pacientes procesados.`);
}

// --- PASO 2: CITAS (Consultas) ---
async function importAppointments() {
  console.log('🚀 Iniciando importación de Citas...');
  const appointments = await readCsv(FILES.appointments);
  console.log(`📄 ${appointments.length} citas encontradas en CSV.`);

  let processed = 0;
  const batchSize = 100;

  for (let i = 0; i < appointments.length; i += batchSize) {
    const batch = appointments.slice(i, i + batchSize);
    const upsertData = [];

    for (const a of batch) {
      const patientLegacyId = a['patientId'];
      const eventId = a['eventId']; // ID único de la cita
      const patientUuid = patientIdMap.get(patientLegacyId);

      if (!patientUuid) {
        // console.warn(`⚠️ Paciente no encontrado para cita ${eventId} (LegacyID: ${patientLegacyId})`);
        continue; 
      }

      // Mapeo de Sede
      let sede = 'polanco'; // Default
      const agenda = a['agenda']?.toLowerCase() || '';
      if (agenda.includes('trinidad') || agenda.includes('satelite')) sede = 'satelite';
      
      // Fechas
      const fechaInicio = a['start time'] ? new Date(a['start time']).toISOString() : null;
      const fechaFin = a['end time'] ? new Date(a['end time']).toISOString() : null;

      if (!fechaInicio) continue;

      upsertData.push({
        doctoralia_event_id: eventId,
        paciente_id: patientUuid,
        sede: sede,
        fecha_hora_inicio: fechaInicio,
        fecha_hora_fin: fechaFin,
        motivo_consulta: a['service'] || 'Consulta General',
        estado_cita: mapStatus(a['appointment status']), // Función helper abajo
        origen: 'Doctoralia Import',
        motivo_consulta: a['comments'] ? `${a['service']} - ${a['comments']}` : a['service']
      });
    }

    const { data, error } = await supabase
      .from('consultas')
      .upsert(upsertData, { onConflict: 'doctoralia_event_id' })
      .select('id, doctoralia_event_id');

    if (error) {
      console.error('❌ Error insertando lote citas:', error);
    } else {
      data.forEach(row => {
        if (row.doctoralia_event_id) appointmentIdMap.set(row.doctoralia_event_id, row.id);
      });
      processed += data.length;
    }
  }
  console.log(`✅ ${processed} Citas procesadas.`);
}

function mapStatus(status: string): string {
  // Mapeo simple, ajustar según valores reales del CSV
  if (!status) return 'Programada';
  const s = status.toLowerCase();
  if (s.includes('confirm')) return 'Confirmada';
  if (s.includes('cancel')) return 'Cancelada';
  if (s.includes('wait')) return 'Pendiente';
  return 'Programada';
}

// --- PASO 3: NOTAS (EHR) ---
async function importEHR() {
  console.log('🚀 Iniciando importación de Historial Clínico (EHR)...');
  const notes = await readCsv(FILES.ehr);
  console.log(`📄 ${notes.length} notas encontradas en CSV.`);

  let processed = 0;
  const batchSize = 100;

  for (let i = 0; i < notes.length; i += batchSize) {
    const batch = notes.slice(i, i + batchSize);
    const upsertData = [];

    for (const n of batch) {
      const patientLegacyId = n['patientId'];
      const episodeId = n['episodeId'];
      const patientUuid = patientIdMap.get(patientLegacyId);

      if (!patientUuid) continue;

      // Intentar vincular con cita por fecha y paciente
      // Esto es aproximado porque el CSV de EHR solo tiene fecha 'YYYY-MM-DD'
      const noteDate = n['date']; // '2023-01-07'
      
      // Aquí en un script real haríamos una query a BD para buscar el ID de consulta
      // Como estamos en batch, podríamos pre-cargar citas en memoria si no son demasiadas
      // O simplemente insertar la nota con paciente_id y fecha, y luego correr un SQL de update para linkear.
      // Para este script, dejaremos consulta_id nulo inicialmente si no tenemos mapeo directo,
      // pero guardaremos paciente_id y fecha que es lo crítico.
      
      upsertData.push({
        doctoralia_episode_id: episodeId,
        paciente_id: patientUuid,
        fecha: noteDate,
        titulo: n['title'],
        nota: n['value'], // HTML content
        origen: 'Doctoralia Import'
      });
    }

    const { data, error } = await supabase
      .from('consultas_notas')
      .upsert(upsertData, { onConflict: 'doctoralia_episode_id' })
      .select('id, doctoralia_episode_id');

    if (error) {
      console.error('❌ Error insertando lote notas:', error);
    } else {
      data.forEach(row => {
        if (row.doctoralia_episode_id) noteIdMap.set(row.doctoralia_episode_id, row.id);
      });
      processed += data.length;
    }
  }
  console.log(`✅ ${processed} Notas procesadas.`);
  
  // POST-PROCESO: Vincular Notas con Consultas (SQL UPDATE)
  console.log('🔗 Vinculando Notas con Citas por fecha...');
  const { error: linkError } = await supabase.rpc('vincular_notas_consultas_por_fecha'); // Función RPC sugerida
  if (linkError) console.error('⚠️ Error vinculando notas (RPC no existe, ejecutar SQL manual):', linkError.message);
}

// --- EJECUCIÓN ---
async function run() {
  try {
    await importPatients();
    await importAppointments();
    await importEHR();
    console.log('🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE');
  } catch (e) {
    console.error('💥 Error fatal:', e);
  }
}

run();
