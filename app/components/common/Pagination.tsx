/**
 * ============================================================
 * PAGINATION - Componente de paginación unificado
 * ============================================================
 * Diseño consistente con PaginationControls
 * Nota: Este componente usa índice base 0
 */

import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number; // Base 0
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = '',
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalPages <= 1) return null;

  const startItem = currentPage * itemsPerPage + 1;
  const endItem = Math.min((currentPage + 1) * itemsPerPage, totalItems);

  // Generar páginas visibles (convertir a base 1 para display)
  const getVisiblePages = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    
    const pages: (number | 'ellipsis')[] = [];
    pages.push(0); // Primera página
    
    if (currentPage <= 2) {
      pages.push(1, 2, 3, 'ellipsis', totalPages - 1);
    } else if (currentPage >= totalPages - 3) {
      pages.push('ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1);
    } else {
      pages.push('ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages - 1);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  // Estilos unificados
  const navButtonClass = cn(
    'inline-flex items-center justify-center',
    'h-8 w-8 rounded-lg text-sm font-medium',
    'border border-border/50 bg-background',
    'transition-all duration-150',
    'hover:bg-accent hover:border-border',
    'disabled:opacity-40 disabled:pointer-events-none'
  );

  const pageButtonClass = (isActive: boolean) => cn(
    'inline-flex items-center justify-center',
    'h-8 min-w-[32px] px-2.5 rounded-lg text-sm font-medium',
    'transition-all duration-150',
    isActive
      ? 'bg-primary text-primary-foreground shadow-sm'
      : 'border border-transparent hover:bg-accent hover:border-border/50 text-muted-foreground hover:text-foreground'
  );

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4', className)}>
      {/* Info de registros */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{startItem.toLocaleString()}</span>
        <span>–</span>
        <span className="font-medium text-foreground">{endItem.toLocaleString()}</span>
        <span className="text-muted-foreground/60">de</span>
        <span className="font-medium text-foreground">{totalItems.toLocaleString()}</span>
      </div>

      {/* Controles de navegación */}
      <nav className="flex items-center gap-1" aria-label="Paginación">
        {/* Anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className={navButtonClass}
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Números de página */}
        <div className="flex items-center gap-0.5 mx-1">
          {visiblePages.map((page, idx) => {
            if (page === 'ellipsis') {
              return (
                <span key={`ellipsis-${idx}`} className="inline-flex items-center justify-center h-8 w-8 text-muted-foreground/60">
                  <MoreHorizontal className="w-4 h-4" />
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={pageButtonClass(isActive)}
                aria-label={`Página ${page + 1}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {page + 1}
              </button>
            );
          })}
        </div>

        {/* Siguiente */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className={navButtonClass}
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
};
