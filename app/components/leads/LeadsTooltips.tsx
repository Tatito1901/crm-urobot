/**
 * ============================================================
 * LEADS TOOLTIPS - Tooltips organizados para la página de leads
 * ============================================================
 * Centraliza todos los tooltips para mejor organización y rendimiento
 * ============================================================
 */

import { memo } from 'react';
import { HelpIcon } from '@/app/components/common/InfoTooltip';
import { GLOSARIO } from '@/app/lib/glosario-medico';

/**
 * Tooltips de headers de tabla
 */
export const TableHeaders = {
  Persona: memo(function PersonaHeader() {
    return (
      <div className="flex items-center gap-1.5">
        <span>Persona</span>
        <HelpIcon 
          content="Nombre y datos de contacto de la persona interesada" 
          side="bottom" 
        />
      </div>
    );
  }),

  Origen: memo(function OrigenHeader() {
    return (
      <div className="flex items-center gap-1.5">
        <span>Origen</span>
        <HelpIcon 
          content={GLOSARIO.origen.descripcion} 
          side="bottom" 
        />
      </div>
    );
  }),

  UltimoMensaje: memo(function UltimoMensajeHeader() {
    return (
      <div className="flex items-center gap-1.5">
        <span>Último mensaje</span>
        <HelpIcon 
          content={
            <div className="space-y-1">
              <p>{GLOSARIO.ultimoMensaje.descripcion}</p>
              <p className="text-muted-foreground text-[10px]">{GLOSARIO.ultimoMensaje.importante}</p>
            </div>
          } 
          side="bottom" 
        />
      </div>
    );
  }),

  Etapa: memo(function EtapaHeader() {
    return (
      <div className="flex items-center gap-1.5">
        <span>Etapa</span>
        <HelpIcon 
          content={GLOSARIO.estados.descripcion} 
          side="bottom" 
        />
      </div>
    );
  }),

  Paciente: memo(function PacienteHeader() {
    return (
      <div className="flex items-center gap-1.5">
        <span>Paciente</span>
        <HelpIcon 
          content={GLOSARIO.conversion.descripcion} 
          side="bottom" 
        />
      </div>
    );
  }),
};

/**
 * Tooltip para título principal
 */
export const MainTitle = memo(function MainTitle() {
  return (
    <div className="flex items-center gap-3">
      <span>Pacientes potenciales</span>
      <HelpIcon 
        content={
          <div className="space-y-2">
            <p className="font-semibold">{GLOSARIO.leads.descripcion}</p>
            <p className="text-muted-foreground">{GLOSARIO.leads.ejemplos}</p>
          </div>
        }
      />
    </div>
  );
});

/**
 * Tooltip para guía rápida
 */
export const QuickGuide = memo(function QuickGuide() {
  return (
    <HelpIcon 
      content={
        <div className="space-y-2 max-w-sm">
          <p className="font-semibold text-emerald-600 dark:text-emerald-400">💡 Guía rápida</p>
          <ul className="space-y-1 text-[11px]">
            <li>• Pasa el cursor sobre cualquier elemento con ? para ver más información</li>
            <li>• Los badges de colores indican el origen del contacto</li>
            <li>• 🔥 = Persona muy activa, requiere atención prioritaria</li>
            <li>• &ldquo;Inactivo&rdquo; = Sin respuesta en 7+ días</li>
          </ul>
        </div>
      }
    />
  );
});

/**
 * Tooltips para estadísticas
 */
export const StatsTooltips = {
  total: GLOSARIO.estadisticas.total,
  convertidos: GLOSARIO.estadisticas.convertidos,
  enProceso: GLOSARIO.estadisticas.enProceso,
  conConsultas: GLOSARIO.estadisticas.conConsultas,
  altaPrioridad: (
    <div className="space-y-1">
      <p className="font-semibold">{GLOSARIO.caliente.descripcion}</p>
      <p className="text-muted-foreground">{GLOSARIO.caliente.accion}</p>
    </div>
  ),
};

/**
 * Tooltips para filtros
 */
export const FilterTooltips = {
  'all': GLOSARIO.filtros.ejemplos['Todos'],
  'nuevo': GLOSARIO.filtros.ejemplos['Nuevos'],
  'contactado': GLOSARIO.filtros.ejemplos['Seguimiento'],
  'convertido': GLOSARIO.filtros.ejemplos['Convertidos'],
  'descartado': GLOSARIO.filtros.ejemplos['Descartados'],
};
