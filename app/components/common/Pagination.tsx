/**
 * ============================================================
 * PAGINATION - Componente de paginación reutilizable
 * ============================================================
 * Controles de paginación optimizados para tablas grandes
 */


import React from 'react';

interface PaginationProps {
  currentPage: number;
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
  
  // No mostrar paginación si solo hay una página
  if (totalPages <= 1) return null;

  const startItem = currentPage * itemsPerPage + 1;
  const endItem = Math.min((currentPage + 1) * itemsPerPage, totalItems);

  // Calcular rango de páginas a mostrar
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Mostrar todas las páginas si son pocas
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar páginas con ellipsis
      if (currentPage <= 2) {
        // Inicio
        pages.push(0, 1, 2, '...', totalPages - 1);
      } else if (currentPage >= totalPages - 3) {
        // Final
        pages.push(0, '...', totalPages - 3, totalPages - 2, totalPages - 1);
      } else {
        // Medio
        pages.push(0, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages - 1);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Info de items */}
      <div className="text-sm text-slate-400">
        Mostrando <span className="font-medium text-white">{startItem}</span> a{' '}
        <span className="font-medium text-white">{endItem}</span> de{' '}
        <span className="font-medium text-white">{totalItems}</span> resultados
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center gap-2">
        {/* Botón anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/5 min-h-[44px] sm:min-h-0"
          aria-label="Página anterior"
        >
          <span>←</span>
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Números de página */}
        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers.map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 text-slate-500">
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`
                  min-w-[40px] rounded-lg px-3 py-2 text-sm font-medium transition-colors
                  ${
                    isActive
                      ? 'bg-blue-600 text-white border border-blue-500'
                      : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                  }
                `}
                aria-label={`Página ${pageNum + 1}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNum + 1}
              </button>
            );
          })}
        </div>

        {/* Indicador móvil */}
        <div className="sm:hidden px-3 py-2 text-sm text-slate-400">
          {currentPage + 1} / {totalPages}
        </div>

        {/* Botón siguiente */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/5 min-h-[44px] sm:min-h-0"
          aria-label="Página siguiente"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
