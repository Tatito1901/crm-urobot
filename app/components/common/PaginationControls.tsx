'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
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
 * Controles de paginación - Diseño moderno estilo Linear/Notion
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
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);
  
  // Generar páginas visibles con elipsis inteligente
  const getVisiblePages = (): (number | 'ellipsis-start' | 'ellipsis-end')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];
    
    // Siempre mostrar primera página
    pages.push(1);
    
    if (currentPage <= 3) {
      // Cerca del inicio
      pages.push(2, 3, 4, 'ellipsis-end', totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Cerca del final
      pages.push('ellipsis-start', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      // En medio
      pages.push('ellipsis-start', currentPage - 1, currentPage, currentPage + 1, 'ellipsis-end', totalPages);
    }
    
    return pages;
  };
  
  const visiblePages = getVisiblePages();
  const hasMultiplePages = totalPages > 1;
  
  if (totalCount === 0) return null;
  
  const NavButton = ({ 
    onClick, 
    disabled, 
    children, 
    label 
  }: { 
    onClick: () => void; 
    disabled: boolean; 
    children: React.ReactNode;
    label: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center',
        'h-8 w-8 rounded-lg text-sm font-medium',
        'border border-border/50 bg-background',
        'transition-all duration-150',
        'hover:bg-accent hover:border-border',
        'disabled:opacity-40 disabled:pointer-events-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'
      )}
    >
      {children}
    </button>
  );
  
  const PageButton = ({ 
    page, 
    isActive 
  }: { 
    page: number; 
    isActive: boolean;
  }) => (
    <button
      onClick={() => onPageChange(page)}
      disabled={isLoading}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'inline-flex items-center justify-center',
        'h-8 min-w-[32px] px-2.5 rounded-lg text-sm font-medium',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        isActive
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'border border-transparent hover:bg-accent hover:border-border/50 text-muted-foreground hover:text-foreground'
      )}
    >
      {page}
    </button>
  );
  
  const Ellipsis = () => (
    <span className="inline-flex items-center justify-center h-8 w-8 text-muted-foreground/60">
      <MoreHorizontal className="w-4 h-4" />
    </span>
  );
  
  return (
    <div className={cn(
      'flex flex-col sm:flex-row items-center justify-between gap-4',
      className
    )}>
      {/* Info de registros - Diseño pill */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{startItem.toLocaleString()}</span>
        <span>–</span>
        <span className="font-medium text-foreground">{endItem.toLocaleString()}</span>
        <span className="text-muted-foreground/60">de</span>
        <span className="font-medium text-foreground">{totalCount.toLocaleString()}</span>
      </div>
      
      {/* Controles de navegación */}
      {hasMultiplePages && (
        <nav className="flex items-center gap-1" aria-label="Paginación">
          {/* Anterior */}
          <NavButton
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            label="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </NavButton>
          
          {/* Números de página — hidden on small mobile */}
          <div className="hidden sm:flex items-center gap-0.5 mx-1">
            {visiblePages.map((page, idx) => {
              if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                return <Ellipsis key={`${page}-${idx}`} />;
              }
              return (
                <PageButton 
                  key={page} 
                  page={page} 
                  isActive={page === currentPage} 
                />
              );
            })}
          </div>
          {/* Compact page indicator for mobile */}
          <span className="sm:hidden text-xs text-muted-foreground tabular-nums mx-2">
            {currentPage}/{totalPages}
          </span>
          
          {/* Siguiente */}
          <NavButton
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            label="Página siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </NavButton>
        </nav>
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
