/**
 * ============================================================
 * CONVERSACIONES PANEL - Chat history estilo WhatsApp
 * ============================================================
 * Muestra el historial de conversaciones del paciente con UroBot
 * en formato de chat con burbujas de mensaje.
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { MessageCircle, Bot, User, Calendar, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { useConversacionesPaciente } from '@/hooks/useConversacionesPaciente';

interface ConversacionesPanelProps {
  telefono: string | null | undefined;
  nombrePaciente?: string;
}

export const ConversacionesPanel: React.FC<ConversacionesPanelProps> = ({
  telefono,
  nombrePaciente,
}) => {
  const { mensajes, contexto, isLoading, error, refetch, totalMensajes } = useConversacionesPaciente(telefono);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final cuando llegan nuevos mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajes]);

  // Formatear fecha de mensaje
  const formatMensajeFecha = (fecha: Date) => {
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    if (fecha.toDateString() === hoy.toDateString()) {
      return `Hoy ${fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (fecha.toDateString() === ayer.toDateString()) {
      return `Ayer ${fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return fecha.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Sin teléfono
  if (!telefono) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
        <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-sm text-center">No hay teléfono registrado para este paciente.</p>
      </div>
    );
  }

  // Loading
  if (isLoading && mensajes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p className="text-sm">Cargando conversaciones...</p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
        <AlertCircle className="h-12 w-12 mb-4 text-red-500" />
        <p className="text-sm text-center mb-4">Error al cargar las conversaciones</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Conversaciones con UroBot</h3>
            <p className="text-xs text-muted-foreground">
              {totalMensajes} mensaje{totalMensajes !== 1 ? 's' : ''} • {telefono}
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
          title="Actualizar"
        >
          <RefreshCw className={`h-4 w-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Info de cita pendiente (si existe) */}
      {contexto?.tieneCitaPendiente && contexto.infoCita && (
        <div className="mx-4 mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg">
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Cita Pendiente</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{contexto.infoCita}</p>
            </div>
          </div>
        </div>
      )}

      {/* Área de mensajes */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"
      >
        {mensajes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <MessageCircle className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-sm text-center">No hay conversaciones registradas</p>
            <p className="text-xs text-center mt-1 opacity-70">
              Los mensajes aparecerán aquí cuando {nombrePaciente || 'el paciente'} interactúe con UroBot
            </p>
          </div>
        ) : (
          mensajes.map((msg, index) => {
            const esUsuario = msg.rol === 'usuario';
            const mostrarFecha = index === 0 || 
              new Date(mensajes[index - 1].fecha).toDateString() !== new Date(msg.fecha).toDateString();

            return (
              <React.Fragment key={msg.id}>
                {/* Separador de fecha */}
                {mostrarFecha && (
                  <div className="flex items-center justify-center my-4">
                    <span className="px-3 py-1 bg-muted rounded-full text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      {new Date(msg.fecha).toLocaleDateString('es-MX', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </span>
                  </div>
                )}

                {/* Burbuja de mensaje */}
                <div className={`flex ${esUsuario ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-end gap-2 max-w-[85%] ${esUsuario ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                      esUsuario 
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    }`}>
                      {esUsuario ? (
                        <User className="h-3.5 w-3.5" />
                      ) : (
                        <Bot className="h-3.5 w-3.5" />
                      )}
                    </div>

                    {/* Contenido */}
                    <div className={`flex flex-col ${esUsuario ? 'items-end' : 'items-start'}`}>
                      <div className={`px-3 py-2 rounded-2xl ${
                        esUsuario
                          ? 'bg-emerald-600 text-white rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                          {msg.mensaje}
                        </p>
                      </div>
                      <span className={`text-[10px] mt-1 text-muted-foreground ${esUsuario ? 'text-right' : 'text-left'}`}>
                        {formatMensajeFecha(msg.fecha)}
                      </span>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* Footer informativo */}
      <div className="px-4 py-2 border-t border-border bg-muted/20">
        <p className="text-[10px] text-muted-foreground text-center">
          Las conversaciones se actualizan automáticamente en tiempo real
        </p>
      </div>
    </div>
  );
};
