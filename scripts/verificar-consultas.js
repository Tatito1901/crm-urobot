#!/usr/bin/env node

/**
 * Script para verificar datos de consultas en Supabase
 */

const { createClient } = require('@supabase/supabase-js');

// Configurar cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  console.error('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarDatos() {
  console.log('🔍 Verificando datos de consultas...\n');

  try {
    // Obtener consultas
    const { data: consultas, error, count } = await supabase
      .from('consultas')
      .select('*, paciente:pacientes ( id, nombre_completo )', { count: 'exact' })
      .order('fecha_consulta', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Error al obtener consultas:', error);
      return;
    }

    console.log(`✅ Total de consultas en BD: ${count}\n`);

    if (!consultas || consultas.length === 0) {
      console.log('⚠️  No hay consultas en la base de datos');
      console.log('\n💡 Opciones:');
      console.log('   1. Verifica que la tabla "consultas" exista');
      console.log('   2. Inserta datos de prueba');
      console.log('   3. Revisa los permisos de la tabla');
      return;
    }

    console.log('📋 Últimas 5 consultas:\n');
    consultas.forEach((c, i) => {
      console.log(`${i + 1}. ${c.paciente?.nombre_completo || 'Sin nombre'}`);
      console.log(`   Fecha: ${c.fecha_consulta} ${c.hora_consulta}`);
      console.log(`   Sede: ${c.sede}`);
      console.log(`   Estado: ${c.estado_cita}`);
      console.log(`   ID: ${c.id}`);
      console.log('');
    });

    // Verificar estructura de datos
    console.log('\n🔬 Verificando estructura de la primera consulta:');
    const primera = consultas[0];
    const campos = [
      'id',
      'consulta_id',
      'paciente_id',
      'sede',
      'estado_cita',
      'fecha_consulta',
      'hora_consulta',
      'duracion_minutos',
      'tipo_cita',
      'motivo_consulta',
    ];

    campos.forEach(campo => {
      const valor = primera[campo];
      const tipo = typeof valor;
      const emoji = valor !== null && valor !== undefined ? '✓' : '✗';
      console.log(`   ${emoji} ${campo}: ${tipo} = ${JSON.stringify(valor)?.slice(0, 50)}`);
    });

  } catch (err) {
    console.error('❌ Error inesperado:', err);
  }
}

verificarDatos();
