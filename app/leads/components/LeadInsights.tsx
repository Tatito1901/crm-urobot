'use client';

import React from 'react';
import { useLeadContext } from '@/hooks/useLeadContext';
import { 
  Lightbulb, 
  Brain, 
  MessageCircle, 
  Calendar, 
  AlertTriangle,
  Smile,
  Frown,
  Zap,
  HelpCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';

interface LeadInsightsProps {
  telefono: string;
  className?: string;
}

export const LeadInsights = React.memo(function LeadInsights({ telefono, className }: LeadInsightsProps) {
  const { context, isLoading, hasData } = useLeadContext(telefono);

  if (isLoading) {
    return (
      <div className={`p-4 rounded-lg bg-muted/50 animate-pulse space-y-2 ${className}`}>
        <div className="h-4 w-2/3 bg-muted rounded" />
        <div className="h-3 w-full bg-muted rounded" />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className={`p-4 rounded-lg bg-muted/30 border border-border text-center ${className}`}>
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Brain className="w-3 h-3" />
          Sin análisis previo de UroBot
        </p>
      </div>
    );
  }

  // Icono de sentiment
  const SentimentIcon = {
    positivo: Smile,
    negativo: Frown,
    urgente: Zap,
    neutral: MessageCircle,
    desconocido: HelpCircle
  }[context.ultimoSentiment] || MessageCircle;

  // Color de sentiment
  const sentimentColor = {
    positivo: 'text-emerald-500',
    negativo: 'text-red-500',
    urgente: 'text-amber-500',
    neutral: 'text-blue-400',
    desconocido: 'text-slate-400'
  }[context.ultimoSentiment] || 'text-slate-400';

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header Insights */}
      <div className="flex items-center gap-2 pb-2 border-b border-border/50">
        <Brain className="w-4 h-4 text-purple-500" />
        <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
          UroBot Insights
        </span>
      </div>

      {/* Tarjeta Principal */}
      <div className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-lg border border-purple-200/20 p-3 space-y-3">
        
        {/* Intención + Sentiment */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium truncate">
              Última Intención
            </p>
            <p className="text-sm font-medium capitalize text-foreground truncate">
              {context.ultimaIntencion}
            </p>
          </div>
          <div className="flex flex-col items-end flex-shrink-0">
            <SentimentIcon className={`w-5 h-5 ${sentimentColor}`} />
            <span className={`text-[10px] capitalize ${sentimentColor}`}>
              {context.ultimoSentiment}
            </span>
          </div>
        </div>

        {/* Último Mensaje */}
        <div className="bg-background/50 rounded p-2 text-xs relative">
          <span className="absolute -top-1.5 -left-1 text-[10px] bg-background border px-1 rounded-full text-muted-foreground shadow-sm">
            Usuario
          </span>
          <p className="text-muted-foreground italic mt-2 line-clamp-2 break-words">
            "{context.ultimoMensajeUsuario}"
          </p>
        </div>

        {/* Sugerencia de Acción */}
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2 rounded border border-emerald-500/20">
          <Lightbulb className="w-4 h-4 flex-shrink-0" />
          <p className="text-xs font-medium">
            {context.sugerenciaAccion}
          </p>
        </div>

        {/* Cita Pendiente Flag */}
        {context.tieneCitaPendiente && (
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-1.5 rounded">
            <Calendar className="w-3 h-3" />
            <span>Posible cita pendiente de confirmar</span>
          </div>
        )}
      </div>
    </div>
  );
});
