'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Controles de paginación optimizados para +3000 registros
 * Muestra: Primera | Prev | Páginas | Next | Última
 */
export function PaginationControls({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  isLoading = false,
  className,
}: PaginationControlsProps) {
  // Calcular rango de items mostrados
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);
  
  // Generar números de página visibles (máximo 5)
  const getVisiblePages = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    
    // Ajustar inicio si estamos cerca del final
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };
  
  const visiblePages = getVisiblePages();
  const hasMultiplePages = totalPages > 1;
  
  if (totalCount === 0) {
    return null;
  }
  
  return (
    <div className={cn(
      'flex flex-col sm:flex-row items-center justify-between gap-3 py-3 px-1',
      className
    )}>
      {/* Info de registros */}
      <div className="text-xs text-muted-foreground">
        Mostrando <span className="font-semibold text-foreground">{startItem.toLocaleString()}</span>
        {' - '}
        <span className="font-semibold text-foreground">{endItem.toLocaleString()}</span>
        {' de '}
        <span className="font-semibold text-foreground">{totalCount.toLocaleString()}</span>
        {' registros'}
      </div>
      
      {/* Controles */}
      {hasMultiplePages && (
        <div className="flex items-center gap-1">
          {/* Primera página */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1 || isLoading}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              'hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
            )}
            title="Primera página"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          
          {/* Anterior */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              'hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
            )}
            title="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {/* Números de página */}
          <div className="flex items-center gap-0.5 mx-1">
            {visiblePages[0] > 1 && (
              <>
                <button
                  onClick={() => onPageChange(1)}
                  disabled={isLoading}
                  className="px-2.5 py-1 text-xs rounded-md hover:bg-muted transition-colors"
                >
                  1
                </button>
                {visiblePages[0] > 2 && (
                  <span className="px-1 text-muted-foreground">...</span>
                )}
              </>
            )}
            
            {visiblePages.map(page => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                disabled={isLoading}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-md transition-colors min-w-[28px]',
                  page === currentPage
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'hover:bg-muted'
                )}
              >
                {page}
              </button>
            ))}
            
            {visiblePages[visiblePages.length - 1] < totalPages && (
              <>
                {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                  <span className="px-1 text-muted-foreground">...</span>
                )}
                <button
                  onClick={() => onPageChange(totalPages)}
                  disabled={isLoading}
                  className="px-2.5 py-1 text-xs rounded-md hover:bg-muted transition-colors"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
          
          {/* Siguiente */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              'hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
            )}
            title="Página siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          
          {/* Última página */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages || isLoading}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              'hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
            )}
            title="Última página"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Componente de búsqueda con debounce integrado
 */
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isSearching?: boolean;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
  isSearching = false,
  className,
}: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full px-3 py-2 text-sm rounded-lg border border-border',
          'bg-background placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
          'transition-colors'
        )}
      />
      {isSearching && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
