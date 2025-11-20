#!/bin/bash

# Script de migración de estructura del proyecto CRM-UROBOT
# Uso: bash scripts/migrate-structure.sh

set -e  # Salir si hay errores

echo "🚀 Iniciando migración de estructura del proyecto..."
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para crear directorios
create_dirs() {
    echo -e "${YELLOW}📁 Creando estructura de directorios...${NC}"
    
    mkdir -p src/lib/{supabase,utils,constants,design-system}
    mkdir -p src/hooks/{shared,domain/{leads,pacientes,consultas,recordatorios,dashboard,agenda}}
    mkdir -p src/components/{ui,providers,layout,domain/{leads,pacientes,consultas,analytics,metrics,agenda/{calendar,modals,shared}},shared}
    mkdir -p src/features/agenda/{services,utils}
    mkdir -p src/types
    mkdir -p src/app
    mkdir -p docs/agenda
    
    echo -e "${GREEN}✅ Estructura de directorios creada${NC}"
}

# Función para hacer backup
create_backup() {
    echo -e "${YELLOW}💾 Creando backup...${NC}"
    timestamp=$(date +%Y%m%d_%H%M%S)
    backup_dir="../crm-urobot-backup-${timestamp}"
    cp -r . "$backup_dir"
    echo -e "${GREEN}✅ Backup creado en: ${backup_dir}${NC}"
}

# Función para mover archivos con git mv
git_move() {
    local src=$1
    local dest=$2
    
    if [ -e "$src" ]; then
        # Crear directorio destino si no existe
        mkdir -p "$(dirname "$dest")"
        
        if git ls-files --error-unmatch "$src" > /dev/null 2>&1; then
            # Archivo está en git, usar git mv
            git mv "$src" "$dest"
            echo -e "${GREEN}  ✓${NC} $src → $dest"
        else
            # Archivo no está en git, usar mv normal
            mv "$src" "$dest"
            echo -e "${GREEN}  ✓${NC} $src → $dest (no tracked)"
        fi
    else
        echo -e "${RED}  ✗${NC} No existe: $src"
    fi
}

# Función para mover directorios
git_move_dir() {
    local src=$1
    local dest=$2
    
    if [ -d "$src" ]; then
        mkdir -p "$dest"
        # Mover contenido del directorio
        for item in "$src"/*; do
            if [ -e "$item" ]; then
                git_move "$item" "$dest/$(basename "$item")"
            fi
        done
    else
        echo -e "${RED}  ✗${NC} No existe directorio: $src"
    fi
}

# Confirmar con usuario
echo -e "${YELLOW}⚠️  ADVERTENCIA: Esta operación modificará la estructura del proyecto${NC}"
echo ""
read -p "¿Deseas crear un backup primero? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    create_backup
fi

echo ""
read -p "¿Continuar con la migración? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Migración cancelada"
    exit 0
fi

# Crear estructura
create_dirs

# FASE 1: Migrar lib/
echo ""
echo -e "${YELLOW}📦 Migrando lib/...${NC}"
git_move_dir "lib/supabase" "src/lib/supabase"
git_move_dir "lib/utils" "src/lib/utils"
git_move "lib/date-utils.ts" "src/lib/utils/dates.ts"
git_move "lib/mappers.ts" "src/lib/utils/mappers.ts"
git_move "lib/temporal-loader.ts" "src/lib/utils/temporal-loader.ts"
git_move "lib/utils.ts" "src/lib/utils/common.ts"
git_move_dir "lib/validators" "src/lib/utils/validators"

# Migrar app/lib/
git_move "app/lib/design-system.ts" "src/lib/design-system/index.ts"
git_move "app/lib/glosario-medico.ts" "src/lib/constants/medical.ts"
git_move "app/lib/utils.ts" "src/lib/utils/app-utils.ts"

# FASE 2: Migrar hooks/
echo ""
echo -e "${YELLOW}🪝 Migrando hooks/...${NC}"

# Hooks shared
git_move "hooks/useMediaQuery.ts" "src/hooks/shared/useMediaQuery.ts"
git_move "hooks/useDebouncedCallback.ts" "src/hooks/shared/useDebouncedCallback.ts"
git_move "hooks/useSwipeGesture.ts" "src/hooks/shared/useSwipeGesture.ts"
git_move "hooks/usePrefetchRoutes.ts" "src/hooks/shared/usePrefetchRoutes.ts"

# Hooks por dominio
git_move "hooks/useLeads.ts" "src/hooks/domain/leads/useLeads.ts"
git_move "hooks/usePacientes.ts" "src/hooks/domain/pacientes/usePacientes.ts"
git_move "hooks/usePacienteDetallado.ts" "src/hooks/domain/pacientes/usePacienteDetallado.ts"
git_move "hooks/useConsultas.ts" "src/hooks/domain/consultas/useConsultas.ts"
git_move "hooks/useRecordatorios.ts" "src/hooks/domain/recordatorios/useRecordatorios.ts"
git_move "hooks/useDashboardMetrics.ts" "src/hooks/domain/dashboard/useDashboardMetrics.ts"

# Hooks de agenda
git_move_dir "app/agenda/hooks" "src/hooks/domain/agenda"

# FASE 3: Migrar components/
echo ""
echo -e "${YELLOW}🧩 Migrando components/...${NC}"

# UI y providers (sin cambio de ubicación, solo mover a src)
git_move_dir "components/ui" "src/components/ui"
git_move_dir "components/providers" "src/components/providers"

# Components del dominio
git_move_dir "app/components/common" "src/components/layout"
git_move_dir "app/components/analytics" "src/components/domain/analytics"
git_move_dir "app/components/metrics" "src/components/domain/metrics"
git_move_dir "app/components/leads" "src/components/domain/leads"
git_move_dir "app/components/crm" "src/components/domain/crm"

# Components de agenda
git_move_dir "app/agenda/components" "src/components/domain/agenda"

# FASE 4: Migrar features/
echo ""
echo -e "${YELLOW}⚡ Migrando features/...${NC}"
git_move_dir "app/agenda/services" "src/features/agenda/services"
git_move_dir "app/agenda/lib" "src/features/agenda/utils"

# FASE 5: Migrar types/
echo ""
echo -e "${YELLOW}📝 Migrando types/...${NC}"
git_move "types/agenda.ts" "src/features/agenda/types.ts"
git_move_dir "types" "src/types"

# FASE 6: Migrar app/
echo ""
echo -e "${YELLOW}📱 Migrando app/...${NC}"
# Mover todo el contenido de app/ a src/app/
for item in app/*; do
    if [ -e "$item" ] && [ "$(basename "$item")" != "lib" ] && [ "$(basename "$item")" != "components" ] && [ "$(basename "$item")" != "agenda" ]; then
        git_move "$item" "src/$(basename "$item")"
    fi
done

# Mover rutas de agenda (solo las páginas)
mkdir -p "src/app/agenda"
git_move "app/agenda/page.tsx" "src/app/agenda/page.tsx" 2>/dev/null || true
git_move "app/agenda/loading.tsx" "src/app/agenda/loading.tsx" 2>/dev/null || true

# FASE 7: Migrar docs/
echo ""
echo -e "${YELLOW}📚 Migrando docs/...${NC}"
git_move_dir "app/agenda/docs" "docs/agenda"

# Eliminar carpetas vacías
echo ""
echo -e "${YELLOW}🧹 Limpiando carpetas vacías...${NC}"
find . -type d -empty -delete 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ Migración completada!${NC}"
echo ""
echo -e "${YELLOW}⚠️  PRÓXIMOS PASOS:${NC}"
echo "1. Actualizar tsconfig.json con los nuevos paths"
echo "2. Ejecutar: npm run build"
echo "3. Revisar y corregir imports rotos"
echo "4. Ejecutar tests"
echo "5. Commit cambios: git commit -m 'refactor: reorganize project structure'"
echo ""
echo -e "${YELLOW}📖 Ver REORGANIZACION_PROYECTO.md para más detalles${NC}"
