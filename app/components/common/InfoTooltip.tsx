/**
 * ============================================================
 * INFO TOOLTIP - Wrapper optimizado del tooltip de shadcn
 * ============================================================
 * Componente optimizado para mostrar información contextual
 * Usa Radix UI Tooltip a través de shadcn
 * ============================================================
 */

'use client';

import { memo } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface InfoTooltipProps {
  /** Contenido del tooltip */
  content: string | React.ReactNode;
  /** Elemento que dispara el tooltip */
  children?: React.ReactNode;
  /** Posición del tooltip */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Ancho máximo del tooltip */
  maxWidth?: string;
  /** Delay antes de mostrar (ms) */
  delayDuration?: number;
}

/**
 * Tooltip optimizado con memoización para evitar re-renders innecesarios
 */
export const InfoTooltip = memo(function InfoTooltip({
  content,
  children,
  side = 'top',
  maxWidth = 'max-w-xs',
  delayDuration = 200,
}: InfoTooltipProps) {
  return (
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild>
        {children || (
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold cursor-help hover:bg-blue-500/30 transition-colors">
            ?
          </span>
        )}
      </TooltipTrigger>
      <TooltipContent 
        side={side}
        className={`${maxWidth} bg-slate-800 border border-white/10 text-white leading-relaxed z-50`}
        sideOffset={8}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
});

/**
 * Icono de ayuda con tooltip - versión simple
 * Para usar en headers y labels
 */
export const HelpIcon = memo(function HelpIcon({ 
  content, 
  side = 'top' 
}: { 
  content: string | React.ReactNode; 
  side?: 'top' | 'bottom' | 'left' | 'right';
}) {
  return (
    <InfoTooltip content={content} side={side} delayDuration={150}>
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold cursor-help hover:bg-blue-500/30 transition-colors select-none">
        ?
      </span>
    </InfoTooltip>
  );
});

/**
 * Tooltip envolvente - para badges, botones, etc.
 * Uso: <WrapTooltip content="..."><Badge>...</Badge></WrapTooltip>
 */
export const WrapTooltip = memo(function WrapTooltip({
  content,
  children,
  side = 'top',
}: {
  content: string | React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}) {
  return (
    <InfoTooltip content={content} side={side} delayDuration={300}>
      {children}
    </InfoTooltip>
  );
});
