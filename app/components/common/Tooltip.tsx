'use client';

import { useState } from 'react';

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: string;
}

/**
 * Componente Tooltip - Muestra información al pasar el mouse
 * Útil para explicar conceptos técnicos de forma simple
 */
export function Tooltip({ 
  content, 
  children, 
  position = 'top',
  maxWidth = 'max-w-xs'
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-popover',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-popover',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-popover',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-popover',
  };

  return (
    <div 
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div 
          className={`
            absolute z-50 ${positionClasses[position]} ${maxWidth}
            px-3 py-2 text-xs leading-relaxed
            bg-popover text-popover-foreground rounded-lg shadow-xl
            border border-border
            animate-in fade-in-0 zoom-in-95 duration-200
          `}
          role="tooltip"
        >
          {content}
          <div 
            className={`
              absolute w-0 h-0 
              border-4 ${arrowClasses[position]}
            `}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Icono de ayuda con tooltip
 * Uso: <HelpTooltip content="Explicación simple aquí" />
 * O: <HelpTooltip content="...">{children}</HelpTooltip>
 */
export function HelpTooltip({ 
  content, 
  position = 'top',
  children
}: { 
  content: string | React.ReactNode; 
  position?: 'top' | 'bottom' | 'left' | 'right';
  children?: React.ReactNode;
}) {
  if (children) {
    return (
      <Tooltip content={content} position={position}>
        {children}
      </Tooltip>
    );
  }
  
  return (
    <Tooltip content={content} position={position}>
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] font-bold cursor-help hover:bg-primary/30 transition-colors">
        ?
      </span>
    </Tooltip>
  );
}
