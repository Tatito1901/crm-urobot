#!/usr/bin/env node

/**
 * Script para actualizar imports después de la reorganización
 * Uso: node scripts/fix-imports.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Mapeo de rutas antiguas a nuevas
const importMappings = [
  // lib/
  { from: /@\/lib\/supabase/g, to: '@/lib/supabase' },
  { from: /@\/lib\/utils\.ts/g, to: '@/lib/utils/common' },
  { from: /@\/lib\/date-utils/g, to: '@/lib/utils/dates' },
  { from: /@\/lib\/mappers/g, to: '@/lib/utils/mappers' },
  { from: /@\/lib\/validators/g, to: '@/lib/utils/validators' },
  
  // app/lib/
  { from: /from ['"]\.\.\/lib\/design-system['"]/g, to: "from '@/lib/design-system'" },
  { from: /from ['"]\.\/lib\/design-system['"]/g, to: "from '@/lib/design-system'" },
  { from: /@\/app\/lib\/design-system/g, to: '@/lib/design-system' },
  { from: /@\/app\/lib\/glosario-medico/g, to: '@/lib/constants/medical' },
  { from: /@\/app\/lib\/utils/g, to: '@/lib/utils/app-utils' },
  
  // hooks/
  { from: /@\/hooks\/useMediaQuery/g, to: '@/hooks/shared/useMediaQuery' },
  { from: /@\/hooks\/useDebouncedCallback/g, to: '@/hooks/shared/useDebouncedCallback' },
  { from: /@\/hooks\/useSwipeGesture/g, to: '@/hooks/shared/useSwipeGesture' },
  { from: /@\/hooks\/usePrefetchRoutes/g, to: '@/hooks/shared/usePrefetchRoutes' },
  { from: /@\/hooks\/useLeads/g, to: '@/hooks/domain/leads/useLeads' },
  { from: /@\/hooks\/usePacientes/g, to: '@/hooks/domain/pacientes/usePacientes' },
  { from: /@\/hooks\/usePacienteDetallado/g, to: '@/hooks/domain/pacientes/usePacienteDetallado' },
  { from: /@\/hooks\/useConsultas/g, to: '@/hooks/domain/consultas/useConsultas' },
  { from: /@\/hooks\/useRecordatorios/g, to: '@/hooks/domain/recordatorios/useRecordatorios' },
  { from: /@\/hooks\/useDashboardMetrics/g, to: '@/hooks/domain/dashboard/useDashboardMetrics' },
  
  // agenda hooks
  { from: /from ['"]\.\.\/hooks\/useAgendaState['"]/g, to: "from '@/hooks/domain/agenda/useAgendaState'" },
  { from: /from ['"]\.\.\/hooks\/useAppointmentForm['"]/g, to: "from '@/hooks/domain/agenda/useAppointmentForm'" },
  { from: /from ['"]\.\.\/hooks\/useColorPreferences['"]/g, to: "from '@/hooks/domain/agenda/useColorPreferences'" },
  
  // components/
  { from: /@\/components\/ui\//g, to: '@/components/ui/' },
  { from: /@\/components\/providers/g, to: '@/components/providers' },
  { from: /@\/app\/components\/common/g, to: '@/components/layout' },
  { from: /@\/app\/components\/analytics/g, to: '@/components/domain/analytics' },
  { from: /@\/app\/components\/metrics/g, to: '@/components/domain/metrics' },
  { from: /@\/app\/components\/leads/g, to: '@/components/domain/leads' },
  { from: /@\/app\/components\/crm/g, to: '@/components/domain/crm' },
  
  // agenda components (imports relativos)
  { from: /from ['"]\.\.\/components\//g, to: "from '@/components/domain/agenda/" },
  { from: /from ['"]\.\/components\//g, to: "from '@/components/domain/agenda/" },
  
  // features/agenda
  { from: /from ['"]\.\.\/services\//g, to: "from '@/features/agenda/services/" },
  { from: /from ['"]\.\.\/lib\/agenda-utils['"]/g, to: "from '@/features/agenda/utils/agenda-utils'" },
  { from: /from ['"]\.\.\/lib\/constants['"]/g, to: "from '@/features/agenda/utils/constants'" },
  { from: /from ['"]\.\.\/lib\/validation-rules['"]/g, to: "from '@/features/agenda/utils/validation-rules'" },
  
  // types
  { from: /@\/types\/agenda/g, to: '@/features/agenda/types' },
  
  // app routes
  { from: /@\/app\//g, to: '@/app/' },
];

// Extensiones de archivo a procesar
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

// Función para procesar un archivo
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Aplicar todas las transformaciones
    for (const mapping of importMappings) {
      const newContent = content.replace(mapping.from, mapping.to);
      if (newContent !== content) {
        modified = true;
        content = newContent;
      }
    }
    
    // Guardar si hubo cambios
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error procesando ${filePath}:`, error.message);
    return false;
  }
}

// Función para recorrer directorios recursivamente
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Ignorar node_modules, .git, etc
      if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(file)) {
        walkDir(filePath, callback);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        callback(filePath);
      }
    }
  }
}

// Script principal
console.log('🔧 Iniciando corrección de imports...\n');

let filesProcessed = 0;
let filesModified = 0;

const srcDir = path.join(projectRoot, 'src');

if (!fs.existsSync(srcDir)) {
  console.error('❌ No existe la carpeta src/. Ejecuta primero el script de migración.');
  process.exit(1);
}

walkDir(srcDir, (filePath) => {
  filesProcessed++;
  const relativePath = path.relative(projectRoot, filePath);
  
  if (processFile(filePath)) {
    filesModified++;
    console.log(`✅ ${relativePath}`);
  }
});

console.log('\n📊 Resumen:');
console.log(`   Archivos procesados: ${filesProcessed}`);
console.log(`   Archivos modificados: ${filesModified}`);
console.log('\n✅ Corrección de imports completada!\n');

if (filesModified > 0) {
  console.log('⚠️  PRÓXIMOS PASOS:');
  console.log('1. Revisar cambios: git diff');
  console.log('2. Compilar: npm run build');
  console.log('3. Ejecutar tests: npm test');
  console.log('4. Commit: git commit -am "fix: update imports after restructure"');
}
