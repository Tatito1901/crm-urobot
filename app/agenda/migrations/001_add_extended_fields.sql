-- ============================================================
-- MIGRACIÓN DB: Campos extendidos para Agenda Urológica
-- ============================================================
-- IMPORTANTE: Esta migración es OPCIONAL y para una fase posterior
-- La nueva UI funciona SIN estos campos usando valores por defecto
-- Ejecuta esto SOLO cuando estés listo para agregar las nuevas funcionalidades

-- ========== NUEVOS CAMPOS EN TABLA CONSULTAS ==========

-- Prioridad de la cita
ALTER TABLE consultas
ADD COLUMN IF NOT EXISTS prioridad VARCHAR(20) DEFAULT 'normal'
CHECK (prioridad IN ('normal', 'alta', 'urgente'));

-- Modalidad de la consulta
ALTER TABLE consultas
ADD COLUMN IF NOT EXISTS modalidad VARCHAR(20) DEFAULT 'presencial'
CHECK (modalidad IN ('presencial', 'teleconsulta', 'hibrida'));

-- Consultorio específico
ALTER TABLE consultas
ADD COLUMN IF NOT EXISTS consultorio VARCHAR(100);

-- Notas internas (solo para staff)
ALTER TABLE consultas
ADD COLUMN IF NOT EXISTS notas_internas TEXT;

-- Requisitos especiales (jsonb array)
ALTER TABLE consultas
ADD COLUMN IF NOT EXISTS requisitos_especiales JSONB DEFAULT '[]'::jsonb;

-- Timestamp de confirmación por paciente
ALTER TABLE consultas
ADD COLUMN IF NOT EXISTS confirmado_en TIMESTAMPTZ;

-- Timestamp de cancelación
ALTER TABLE consultas
ADD COLUMN IF NOT EXISTS cancelado_en TIMESTAMPTZ;

-- Usuario que creó la cita
ALTER TABLE consultas
ADD COLUMN IF NOT EXISTS creado_por UUID REFERENCES auth.users(id);

-- ========== ÍNDICES PARA MEJORAR RENDIMIENTO ==========

-- Índice para búsquedas por prioridad
CREATE INDEX IF NOT EXISTS idx_consultas_prioridad ON consultas(prioridad)
WHERE prioridad IN ('alta', 'urgente');

-- Índice para búsquedas por modalidad
CREATE INDEX IF NOT EXISTS idx_consultas_modalidad ON consultas(modalidad);

-- Índice compuesto para cálculo de disponibilidad
CREATE INDEX IF NOT EXISTS idx_consultas_fecha_sede ON consultas(fecha_consulta, sede, estado_cita);

-- ========== COMENTARIOS EN COLUMNAS ==========

COMMENT ON COLUMN consultas.prioridad IS 'Prioridad de la cita: normal, alta, urgente';
COMMENT ON COLUMN consultas.modalidad IS 'Modalidad: presencial, teleconsulta, hibrida';
COMMENT ON COLUMN consultas.consultorio IS 'Consultorio específico donde se atenderá';
COMMENT ON COLUMN consultas.notas_internas IS 'Notas privadas para el staff médico';
COMMENT ON COLUMN consultas.requisitos_especiales IS 'Array de requisitos: ["ayuno_12h", "traer_estudios", "acompañante"]';
COMMENT ON COLUMN consultas.confirmado_en IS 'Timestamp cuando el paciente confirmó la cita';
COMMENT ON COLUMN consultas.cancelado_en IS 'Timestamp cuando se canceló la cita';
COMMENT ON COLUMN consultas.creado_por IS 'Usuario que creó la cita';

-- ========== MIGRACIÓN DE DATOS EXISTENTES ==========

-- Inferir prioridad según tipo de cita
UPDATE consultas
SET prioridad = CASE
    WHEN tipo_cita LIKE '%urgencia%' THEN 'urgente'
    WHEN tipo_cita LIKE '%procedimiento%' THEN 'alta'
    ELSE 'normal'
END
WHERE prioridad IS NULL;

-- Establecer modalidad por defecto (presencial)
UPDATE consultas
SET modalidad = 'presencial'
WHERE modalidad IS NULL;

-- Establecer confirmado_en si ya está confirmado
UPDATE consultas
SET confirmado_en = updated_at
WHERE confirmado_paciente = true AND confirmado_en IS NULL;

-- Establecer cancelado_en si está cancelada
UPDATE consultas
SET cancelado_en = updated_at
WHERE estado_cita = 'Cancelada' AND cancelado_en IS NULL;

-- ========== TRIGGERS ==========

-- Trigger para actualizar confirmado_en automáticamente
CREATE OR REPLACE FUNCTION actualizar_confirmado_en()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.confirmado_paciente = true AND OLD.confirmado_paciente = false THEN
        NEW.confirmado_en = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_confirmado_en
    BEFORE UPDATE ON consultas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_confirmado_en();

-- Trigger para actualizar cancelado_en automáticamente
CREATE OR REPLACE FUNCTION actualizar_cancelado_en()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado_cita = 'Cancelada' AND OLD.estado_cita != 'Cancelada' THEN
        NEW.cancelado_en = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_cancelado_en
    BEFORE UPDATE ON consultas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_cancelado_en();

-- ========== VALIDACIONES ==========

-- Verificar que no haya valores nulos inesperados
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM consultas WHERE prioridad IS NULL) THEN
        RAISE EXCEPTION 'Hay consultas con prioridad NULL después de la migración';
    END IF;

    IF EXISTS (SELECT 1 FROM consultas WHERE modalidad IS NULL) THEN
        RAISE EXCEPTION 'Hay consultas con modalidad NULL después de la migración';
    END IF;
END$$;

-- ========== ROLLBACK (solo si es necesario) ==========

-- Para deshacer esta migración:
/*
ALTER TABLE consultas DROP COLUMN IF EXISTS prioridad;
ALTER TABLE consultas DROP COLUMN IF EXISTS modalidad;
ALTER TABLE consultas DROP COLUMN IF EXISTS consultorio;
ALTER TABLE consultas DROP COLUMN IF EXISTS notas_internas;
ALTER TABLE consultas DROP COLUMN IF EXISTS requisitos_especiales;
ALTER TABLE consultas DROP COLUMN IF EXISTS confirmado_en;
ALTER TABLE consultas DROP COLUMN IF EXISTS cancelado_en;
ALTER TABLE consultas DROP COLUMN IF EXISTS creado_por;

DROP INDEX IF EXISTS idx_consultas_prioridad;
DROP INDEX IF EXISTS idx_consultas_modalidad;
DROP INDEX IF EXISTS idx_consultas_fecha_sede;

DROP TRIGGER IF EXISTS trigger_actualizar_confirmado_en ON consultas;
DROP TRIGGER IF EXISTS trigger_actualizar_cancelado_en ON consultas;
DROP FUNCTION IF EXISTS actualizar_confirmado_en();
DROP FUNCTION IF EXISTS actualizar_cancelado_en();
*/
