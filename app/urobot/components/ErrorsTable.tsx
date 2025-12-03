'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { ErrorLog } from '@/hooks/useUrobotStats';

interface ErrorsTableProps {
  errors: ErrorLog[];
}

const ERROR_COLORS: Record<string, string> = {
  'HALLUCINATION_DETECTED': 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
  'EMPTY_RESPONSE': 'bg-red-500/20 text-red-600 dark:text-red-400',
  'TOOL_FAILURE': 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
  'default': 'bg-slate-500/20 text-slate-600 dark:text-slate-400',
};

function ErrorBadge({ type }: { type: string | null }) {
  const colorClass = ERROR_COLORS[type || ''] || ERROR_COLORS.default;
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
      {type || 'Desconocido'}
    </span>
  );
}

// Mobile Card View
function ErrorCard({ error }: { error: ErrorLog }) {
  return (
    <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <ErrorBadge type={error.tipo_error} />
        <span className="text-xs text-muted-foreground">
          {new Date(error.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <p className="text-xs font-mono text-muted-foreground">{error.telefono}</p>
      {(error.detalle_error || error.razones_fallo) && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {error.detalle_error || error.razones_fallo?.join(', ')}
        </p>
      )}
    </div>
  );
}

export const ErrorsTable = React.memo(function ErrorsTable({ errors }: ErrorsTableProps) {
  if (errors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <CheckCircle2 className="w-10 h-10 mb-2 text-emerald-500" />
        <p className="text-sm">Sin errores recientes</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile View - Cards */}
      <div className="sm:hidden space-y-2 max-h-[300px] overflow-y-auto">
        {errors.slice(0, 10).map((err) => (
          <ErrorCard key={err.id} error={err} />
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Hora</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Teléfono</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Tipo</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {errors.slice(0, 10).map((err) => (
              <tr key={err.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-2 px-3 text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(err.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="py-2 px-3 font-mono text-xs">{err.telefono}</td>
                <td className="py-2 px-3">
                  <ErrorBadge type={err.tipo_error} />
                </td>
                <td className="py-2 px-3 text-xs text-muted-foreground max-w-[200px] truncate">
                  {err.detalle_error || err.razones_fallo?.join(', ') || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {errors.length > 10 && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          Mostrando 10 de {errors.length} errores
        </p>
      )}
    </>
  );
});

ErrorsTable.displayName = 'ErrorsTable';
