'use client';

import React from 'react';
import { CheckCircle2, Eye, AlertTriangle } from 'lucide-react';
import type { Alerta } from '@/hooks/useUrobotStats';

interface AlertasPanelProps {
  alertas: Alerta[];
  onRevisar: (id: string) => void;
}

const SEVERIDAD_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  critica: {
    border: 'border-red-500/50',
    bg: 'bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
  },
  alta: {
    border: 'border-orange-500/50',
    bg: 'bg-orange-500/10',
    text: 'text-orange-600 dark:text-orange-400',
  },
  media: {
    border: 'border-yellow-500/50',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-600 dark:text-yellow-400',
  },
  baja: {
    border: 'border-slate-500/50',
    bg: 'bg-slate-500/10',
    text: 'text-slate-600 dark:text-slate-400',
  },
};

function AlertaCard({ alerta, onRevisar }: { alerta: Alerta; onRevisar: (id: string) => void }) {
  const colors = SEVERIDAD_COLORS[alerta.severidad] || SEVERIDAD_COLORS.media;

  return (
    <div 
      className={`p-3 rounded-lg border flex items-start justify-between gap-3 transition-colors hover:opacity-90 ${colors.border} ${colors.bg}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap min-w-0">
          <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${colors.text}`} />
          <span className={`text-[10px] sm:text-xs font-semibold uppercase shrink-0 ${colors.text}`}>
            {alerta.severidad}
          </span>
          <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">
            {new Date(alerta.created_at).toLocaleString('es-MX', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <p className="text-sm text-foreground font-medium truncate">{alerta.tipo_alerta}</p>
        {alerta.mensaje && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 break-words">{alerta.mensaje}</p>
        )}
        {alerta.telefono && (
          <p className="text-xs text-muted-foreground font-mono mt-1 truncate">{alerta.telefono}</p>
        )}
      </div>
      <button
        onClick={() => onRevisar(alerta.id)}
        className="p-1.5 rounded hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors shrink-0"
        title="Marcar como revisada"
      >
        <Eye className="w-4 h-4" />
      </button>
    </div>
  );
}

export const AlertasPanel = React.memo(function AlertasPanel({ alertas, onRevisar }: AlertasPanelProps) {
  if (alertas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <CheckCircle2 className="w-10 h-10 mb-2 text-emerald-500" />
        <p className="text-sm">Sin alertas pendientes</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto">
      {alertas.slice(0, 5).map((alerta) => (
        <AlertaCard key={alerta.id} alerta={alerta} onRevisar={onRevisar} />
      ))}
      {alertas.length > 5 && (
        <p className="text-xs text-muted-foreground text-center pt-2">
          +{alertas.length - 5} alertas más
        </p>
      )}
    </div>
  );
});

AlertasPanel.displayName = 'AlertasPanel';
