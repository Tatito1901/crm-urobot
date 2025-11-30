'use client'

import { memo, useState, type RefObject } from 'react'
import type { Mensaje } from '@/types/mensajes'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Send, Bot, User, Mic, Image, Loader2 } from 'lucide-react'

interface ChatPanelProps {
  mensajes: Mensaje[]
  isLoading: boolean
  onSendMessage: (contenido: string) => Promise<void>
  chatEndRef: RefObject<HTMLDivElement | null>
}

function ChatPanelComponent({
  mensajes,
  isLoading,
  onSendMessage,
  chatEndRef,
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return
    
    setIsSending(true)
    try {
      await onSendMessage(inputValue.trim())
      setInputValue('')
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Agrupar mensajes por fecha
  const groupedMessages = mensajes.reduce((groups, msg) => {
    const dateKey = format(msg.createdAt, 'yyyy-MM-dd')
    if (!groups[dateKey]) groups[dateKey] = []
    groups[dateKey].push(msg)
    return groups
  }, {} as Record<string, Mensaje[]>)

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      {/* Área de mensajes con fondo estilo WhatsApp */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {mensajes.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div className="text-muted-foreground">
              <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No hay mensajes</p>
              <p className="text-sm mt-1">El historial de esta conversación aparecerá aquí</p>
            </div>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([dateKey, msgs]) => (
            <div key={dateKey}>
              {/* Separador de fecha */}
              <div className="flex justify-center my-4">
                <span className="px-3 py-1 bg-slate-800/50 text-slate-300 text-xs rounded-lg">
                  {format(new Date(dateKey), "d 'de' MMMM, yyyy", { locale: es })}
                </span>
              </div>

              {/* Mensajes del día */}
              {msgs.map((msg) => (
                <MessageBubble key={msg.id} mensaje={msg} />
              ))}
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input de mensaje */}
      <div className="p-3 border-t border-border bg-muted/30">
        <div className="flex items-end gap-2">
          {/* Botón de adjuntar (decorativo por ahora) */}
          <button 
            className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            title="Adjuntar archivo"
          >
            <Image className="w-5 h-5" />
          </button>

          {/* Input */}
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              rows={1}
              className="w-full px-4 py-2.5 pr-12 bg-background border border-border rounded-2xl
                       resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500
                       placeholder:text-muted-foreground text-sm max-h-32"
              style={{ minHeight: '44px' }}
            />
          </div>

          {/* Botón de enviar o audio */}
          {inputValue.trim() ? (
            <button
              onClick={handleSend}
              disabled={isSending}
              className="p-2.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          ) : (
            <button 
              className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
              title="Mensaje de voz"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </>
  )
}

// Componente de burbuja de mensaje
const MessageBubble = memo(function MessageBubble({ mensaje }: { mensaje: Mensaje }) {
  const isOutgoing = mensaje.direccion === 'saliente'
  const isBot = mensaje.respondidoPor === 'urobot'

  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} mb-1`}>
      <div
        className={`
          relative max-w-[75%] px-3 py-2 rounded-lg
          ${isOutgoing 
            ? 'bg-emerald-600 text-white rounded-br-none' 
            : 'bg-slate-700 text-white rounded-bl-none'}
        `}
      >
        {/* Indicador de bot/humano para mensajes salientes */}
        {isOutgoing && (
          <div className="flex items-center gap-1 mb-1 opacity-70">
            {isBot ? (
              <>
                <Bot className="w-3 h-3" />
                <span className="text-[10px]">Urobot</span>
              </>
            ) : (
              <>
                <User className="w-3 h-3" />
                <span className="text-[10px]">Doctor</span>
              </>
            )}
          </div>
        )}

        {/* Contenido del mensaje */}
        <p className="text-sm whitespace-pre-wrap break-words">
          {mensaje.contenido}
        </p>

        {/* Hora */}
        <div className={`flex items-center justify-end gap-1 mt-1 ${isOutgoing ? 'text-white/60' : 'text-slate-400'}`}>
          <span className="text-[10px]">
            {format(mensaje.createdAt, 'HH:mm')}
          </span>
        </div>

        {/* Pico de la burbuja */}
        <div 
          className={`
            absolute bottom-0 w-3 h-3
            ${isOutgoing 
              ? '-right-1.5 bg-emerald-600' 
              : '-left-1.5 bg-slate-700'}
          `}
          style={{
            clipPath: isOutgoing 
              ? 'polygon(0 0, 0 100%, 100% 100%)' 
              : 'polygon(100% 0, 0 100%, 100% 100%)'
          }}
        />
      </div>
    </div>
  )
})

export const ChatPanel = memo(ChatPanelComponent)
