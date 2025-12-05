import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import csv from 'csv-parser';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CSV_PATH = path.join(__dirname, '../temp_csv_utf8/patients_appointments.csv');

async function run() {
  console.log('📂 Cargando pacientes existentes de la BD...');
  
  // 1. Cargar TODOS los pacientes con doctoralia_id en memoria
  const { data: pacientes } = await supabase
    .from('pacientes')
    .select('id, doctoralia_id')
    .not('doctoralia_id', 'is', null);
  
  const patientMap = new Map<string, string>();
  pacientes?.forEach(p => patientMap.set(p.doctoralia_id, p.id));
  console.log(`✅ ${patientMap.size} pacientes cargados en memoria`);

  // 2. Cargar citas existentes para evitar duplicados
  const { data: citasExistentes } = await supabase
    .from('consultas')
    .select('doctoralia_event_id')
    .not('doctoralia_event_id', 'is', null);
  
  const existingEvents = new Set(citasExistentes?.map(c => c.doctoralia_event_id));
  console.log(`✅ ${existingEvents.size} citas ya existentes`);

  // 3. Leer CSV
  const appointments: any[] = await new Promise((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(CSV_PATH)
      .pipe(csv({ separator: ';', mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, '') }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
  console.log(`📄 ${appointments.length} citas en CSV`);

  // 4. Filtrar solo las nuevas
  const nuevasCitas = appointments.filter(a => {
    const eventId = a['eventId'];
    const patientId = a['patientId'];
    return eventId && !existingEvents.has(eventId) && patientMap.has(patientId);
  });
  console.log(`🆕 ${nuevasCitas.length} citas nuevas a importar`);

  if (nuevasCitas.length === 0) {
    console.log('✨ No hay citas nuevas que importar');
    return;
  }

  // 5. Preparar datos
  const insertData = nuevasCitas.map(a => {
    const fechaInicio = a['start time'] ? new Date(a['start time'].replace(' ', 'T')).toISOString() : null;
    const fechaFin = a['end time'] ? new Date(a['end time'].replace(' ', 'T')).toISOString() : null;
    
    let sede = 'polanco';
    const agenda = (a['agenda'] || '').toLowerCase();
    if (agenda.includes('trinidad') || agenda.includes('satelite') || agenda.includes('satélite')) {
      sede = 'satelite';
    }

    let estado = 'Programada';
    const status = (a['appointment status'] || '').toLowerCase();
    if (status.includes('confirm')) estado = 'Confirmada';
    else if (status.includes('cancel')) estado = 'Cancelada';

    return {
      doctoralia_event_id: a['eventId'],
      paciente_id: patientMap.get(a['patientId']),
      sede,
      fecha_hora_inicio: fechaInicio,
      fecha_hora_fin: fechaFin,
      motivo_consulta: a['service'] || 'Consulta',
      estado_cita: estado,
      origen: 'Doctoralia'
    };
  }).filter(c => c.fecha_hora_inicio); // Solo las que tienen fecha válida

  // 6. Insertar en lotes de 500
  const batchSize = 500;
  let total = 0;
  for (let i = 0; i < insertData.length; i += batchSize) {
    const batch = insertData.slice(i, i + batchSize);
    const { error } = await supabase.from('consultas').insert(batch);
    if (error) {
      console.error(`❌ Error en lote ${i}:`, error.message);
    } else {
      total += batch.length;
      console.log(`📥 Insertadas ${total}/${insertData.length} citas...`);
    }
  }

  console.log(`\n🎉 Importación completada: ${total} citas nuevas`);
  
  // 7. Vincular notas automáticamente
  console.log('\n🔗 Vinculando notas con citas...');
  const { error: linkError } = await supabase.rpc('vincular_notas_consultas_por_fecha');
  if (linkError) console.error('⚠️', linkError.message);
  else console.log('✅ Notas vinculadas');
}

run().catch(console.error);
