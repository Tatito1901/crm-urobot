'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { Loader2, MessageCircle, Bot, CheckCheck, Phone, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useLeadConversation } from '@/hooks/leads/useLeadConversation';
import { FASE_DISPLAY } from '@/types/chat';
import type { Mensaje } from '@/types/chat';

interface SidebarChatViewerProps {
  telefono: string;
  nombreDisplay: string;
}

const FASE_BADGE_COLORS: Record<string, string> = {
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  teal: 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400',
  red: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
  gray: 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-300',
};

export function SidebarChatViewer({ telefono, nombreDisplay }: SidebarChatViewerProps) {
  const { mensajes, isLoading, totalMensajes } = useLeadConversation(telefono);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on load
  useEffect(() => {
    if (chatEndRef.current && mensajes.length > 0) {
      chatEndRef.current.scrollIntoView({ behavior: 'instant' });
    }
  }, [mensajes]);

  // Group messages by date
  const mensajesAgrupados = useMemo(() => {
    const grupos: { fecha: string; mensajes: Mensaje[] }[] = [];
    let fechaActual = '';

    for (const msg of mensajes) {
      const fecha = format(msg.createdAt, 'yyyy-MM-dd');
      if (fecha !== fechaActual) {
        fechaActual = fecha;
        grupos.push({ fecha, mensajes: [] });
      }
      grupos[grupos.length - 1].mensajes.push(msg);
    }

    return grupos;
  }, [mensajes]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
        <span className="text-xs text-muted-foreground">Cargando conversación…</span>
      </div>
    );
  }

  if (mensajes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-3">
          <MessageCircle className="w-6 h-6 text-muted-foreground/40" />
        </div>
        <p className="text-sm font-semibold text-foreground">Sin conversación</p>
        <p className="text-xs mt-1.5 text-muted-foreground max-w-[200px] leading-relaxed">
          No hay mensajes registrados para este lead
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Stats bar */}
      <div className="shrink-0 px-3 py-2 bg-secondary/30 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <MessageCircle className="w-3 h-3" />
          <span className="font-medium tabular-nums">{totalMensajes}</span>
          <span>mensajes</span>
        </div>
        <div className="flex items-center gap-1">
          <a
            href={`https://wa.me/52${telefono.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium rounded-md hover:bg-emerald-500/20 transition-colors"
          >
            <Phone className="w-3 h-3" />
            WhatsApp
          </a>
          <a
            href={`/conversaciones?search=${telefono}`}
            className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-[10px] font-medium rounded-md hover:bg-primary/20 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Abrir
          </a>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 scroll-smooth overscroll-contain bg-slate-50/50 dark:bg-slate-950/30">
        {mensajesAgrupados.map((grupo) => (
          <div key={grupo.fecha}>
            {/* Date separator */}
            <div className="flex items-center justify-center py-1.5 pointer-events-none">
              <div className="px-2.5 py-0.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-full text-[10px] font-medium text-muted-foreground shadow-sm">
                {format(new Date(grupo.fecha), "d MMM yyyy", { locale: es })}
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-0">
              {grupo.mensajes.map((msg, idx) => {
                const prevMsg = grupo.mensajes[idx - 1];
                const isConsecutive = prevMsg && prevMsg.remitente === msg.remitente;

                return (
                  <CompactBubble
                    key={msg.id}
                    msg={msg}
                    isConsecutive={!!isConsecutive}
                  />
                );
              })}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}

// ── Compact bubble for sidebar (smaller than full ChatArea) ──

const CompactBubble = React.memo(function CompactBubble({
  msg,
  isConsecutive,
}: {
  msg: Mensaje;
  isConsecutive: boolean;
}) {
  const isBot = msg.remitente !== 'usuario';

  // Parse inline markdown (bold only)
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const botRadius = isConsecutive ? 'rounded-xl rounded-tl-sm' : 'rounded-xl rounded-tl-[3px]';
  const userRadius = isConsecutive ? 'rounded-xl rounded-tr-sm' : 'rounded-xl rounded-tr-[3px]';

  // Truncate very long messages in sidebar
  const contenido = msg.contenido;
  const isTruncated = contenido.length > 500;
  const displayText = isTruncated ? contenido.slice(0, 500) + '…' : contenido;

  return (
    <div className={`flex w-full ${isBot ? 'justify-start' : 'justify-end'} ${isConsecutive ? 'mt-0.5' : 'mt-2 first:mt-0'}`}>
      {/* Bot avatar */}
      {isBot && (
        <div className={`shrink-0 mr-1.5 self-end ${isConsecutive ? 'w-5' : ''}`}>
          {!isConsecutive && (
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <Bot className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>
      )}

      <div className={`flex flex-col max-w-[85%] ${isBot ? 'items-start' : 'items-end'}`}>
        <div className={`
          relative
          ${isBot
            ? `bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100
               ${botRadius} shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none
               border border-slate-200/80 dark:border-slate-700/60`
            : `bg-gradient-to-br from-teal-500 to-teal-600 text-white
               ${userRadius} shadow-sm shadow-teal-500/15`}
        `}>
          {/* Media indicator */}
          {msg.mediaUrl && msg.tipoMensaje !== 'text' && (
            <div className="px-2.5 pt-2 pb-0.5">
              <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                isBot ? 'bg-slate-100 dark:bg-slate-700 text-muted-foreground' : 'bg-white/20 text-white/80'
              }`}>
                📎 {msg.tipoMensaje === 'image' ? 'Imagen' : msg.tipoMensaje === 'audio' ? 'Audio' : msg.tipoMensaje === 'video' ? 'Video' : 'Documento'}
              </span>
            </div>
          )}

          {/* Content */}
          <div className="px-2.5 pt-1.5 pb-1">
            <p className="text-[12px] leading-relaxed whitespace-pre-wrap break-words">
              {renderText(displayText)}
            </p>
          </div>

          {/* Phase badge for bot */}
          {isBot && msg.faseConversacion && FASE_DISPLAY[msg.faseConversacion] && (
            <div className="px-2.5 pb-0.5">
              <span className={`inline-flex items-center text-[9px] font-medium px-1.5 py-0 rounded-full ${
                FASE_BADGE_COLORS[FASE_DISPLAY[msg.faseConversacion].color] || FASE_BADGE_COLORS.gray
              }`}>
                {FASE_DISPLAY[msg.faseConversacion].label}
              </span>
            </div>
          )}

          {/* Timestamp */}
          <div className={`flex items-center justify-end gap-1 px-2.5 pb-1.5 ${
            isBot ? 'text-slate-400 dark:text-slate-500' : 'text-white/50'
          }`}>
            <span className="text-[9px] tabular-nums">
              {format(msg.createdAt, 'HH:mm')}
            </span>
            {!isBot && <CheckCheck className="w-3 h-3 text-white/40" />}
          </div>
        </div>
      </div>
    </div>
  );
});
