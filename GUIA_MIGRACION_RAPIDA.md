# 🚀 Guía Rápida de Migración

## ⚡ Comando Único (Recomendado)

```bash
# 1. Crear backup y rama nueva
git checkout -b refactor/reorganize-structure
git add -A && git commit -m "checkpoint: before restructure"

# 2. Hacer ejecutable el script
chmod +x scripts/migrate-structure.sh

# 3. Ejecutar migración automática
bash scripts/migrate-structure.sh

# 4. Actualizar tsconfig.json
mv tsconfig.json tsconfig.OLD.json
mv tsconfig.NEW.json tsconfig.json

# 5. Corregir imports automáticamente
node scripts/fix-imports.mjs

# 6. Verificar compilación
npm run build

# 7. Si todo funciona, commit
git add -A
git commit -m "refactor: reorganize project structure to src/ with domain separation"
```

---

## 📝 Checklist de Verificación

### Antes de Empezar
- [ ] Commit de todos los cambios actuales
- [ ] Crear rama `refactor/reorganize-structure`
- [ ] Tener backup del proyecto

### Durante la Migración
- [ ] Ejecutar `migrate-structure.sh`
- [ ] Verificar que no haya errores
- [ ] Actualizar `tsconfig.json`
- [ ] Ejecutar `fix-imports.mjs`

### Después de la Migración
- [ ] `npm run build` sin errores
- [ ] `npm run lint` sin errores
- [ ] Probar en desarrollo `npm run dev`
- [ ] Verificar rutas principales:
  - [ ] Dashboard funciona
  - [ ] Leads funciona
  - [ ] Pacientes funciona
  - [ ] Consultas funciona
  - [ ] Agenda funciona
  - [ ] Estadísticas funciona

### Limpieza Final
- [ ] Eliminar `tsconfig.OLD.json`
- [ ] Eliminar carpetas antiguas vacías
- [ ] Actualizar README.md
- [ ] Commit y merge a main

---

## 🔍 Verificación Manual de Imports

Si el script automático no corrige todo, busca y reemplaza manualmente:

### 1. Buscar imports de lib
```bash
# Buscar todos los imports de lib
grep -r "from '@/lib" src/
grep -r "from '../lib" src/
grep -r "from './lib" src/
```

### 2. Buscar imports de hooks
```bash
# Buscar todos los imports de hooks
grep -r "from '@/hooks" src/
grep -r "from '../hooks" src/
```

### 3. Buscar imports de components
```bash
# Buscar todos los imports de components
grep -r "from '@/components" src/
grep -r "from '@/app/components" src/
```

---

## 🛠️ Solución de Problemas Comunes

### Error: Module not found '@/lib/...'
**Solución**: Verificar que `tsconfig.json` tenga los paths correctos y reiniciar el servidor dev.

```bash
# Limpiar caché y reiniciar
rm -rf .next
npm run dev
```

### Error: Cannot find module '../lib/...'
**Solución**: Ese archivo aún tiene imports relativos. Cambiar a absolutos:

```typescript
// ❌ Antes
import { utils } from '../lib/utils'

// ✅ Después
import { utils } from '@/lib/utils/common'
```

### Error: Circular dependency detected
**Solución**: Revisar los barrel exports (`index.ts`) y asegurarse de no importar dentro del mismo módulo.

---

## 📊 Comandos de Validación

```bash
# Verificar compilación TypeScript
npx tsc --noEmit

# Ver archivos modificados
git status

# Ver diferencias
git diff

# Verificar imports rotos (buscar líneas con error)
npm run build 2>&1 | grep "Module not found"

# Buscar archivos huérfanos (no importados en ningún lado)
npx depcheck
```

---

## 🎯 Estructura Final Esperada

```
crm-urobot/
├── src/
│   ├── lib/              ✅ Consolidado
│   ├── hooks/            ✅ Organizado por dominio
│   ├── components/       ✅ Organizado por dominio
│   ├── features/         ✅ Lógica compleja aislada
│   ├── types/            ✅ Types globales
│   └── app/              ✅ Solo rutas Next.js
├── docs/                 ✅ Documentación centralizada
├── scripts/              ✅ Scripts de utilidad
├── public/               ✅ Assets estáticos
└── FLUJOS N8N/           ✅ Workflows n8n
```

---

## 💡 Tips

1. **No hacer todo de una vez**: Si prefieres migrar por fases, hazlo en este orden:
   - Fase 1: Solo `lib/`
   - Fase 2: Solo `hooks/`
   - Fase 3: Solo `components/`
   - Fase 4: `features/` y `types/`

2. **Usar VS Code Search & Replace**:
   - `Cmd+Shift+F` para buscar en todo el proyecto
   - Usar regex para reemplazar múltiples imports a la vez

3. **Git es tu amigo**:
   ```bash
   # Ver cambios antes de commit
   git diff src/
   
   # Revertir si algo sale mal
   git checkout -- src/
   
   # Ver historial de un archivo movido
   git log --follow src/lib/utils/dates.ts
   ```

4. **Verificación incremental**:
   ```bash
   # Después de cada fase, verificar
   npm run build && npm run lint
   ```

---

## 📞 ¿Necesitas Ayuda?

Si encuentras problemas durante la migración:

1. **Revierte los cambios**: `git checkout -- .`
2. **Verifica el backup**: Asegúrate de tener backup
3. **Migra manualmente**: Sigue `REORGANIZACION_PROYECTO.md` paso a paso
4. **Documenta el problema**: Anota qué salió mal para mejorarlo

---

## 🎉 Después de la Migración

Una vez completada la migración exitosamente:

1. **Actualizar documentación**:
   - [ ] README.md con nueva estructura
   - [ ] Agregar esta guía a docs/
   - [ ] Actualizar CONTRIBUTING.md si existe

2. **Comunicar al equipo**:
   - Compartir cambios de estructura
   - Explicar nuevos patrones de imports
   - Mostrar beneficios de la reorganización

3. **Establecer reglas**:
   - ESLint rules para imports
   - Documentar convenciones
   - Code review checklist

---

**¡Buena suerte con la migración! 🚀**
