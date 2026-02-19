'use client'

import { useRef, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, ArrowLeft, RefreshCw, ExternalLink, MessageSquare, Sparkles, Phone } from 'lucide-react'
import type { TipoMensaje } from '@/types/chat'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { MessageBubble } from './MessageBubble'

interface ContactoActivo {
  telefono: string
  nombreContacto: string | null
  tipoContacto: 'paciente' | 'lead' | 'desconocido'
  estadoLead: string | null
}

interface Mensaje {
  id: string
  contenido: string
  remitente: string
  createdAt: Date
  tipoMensaje: TipoMensaje
  mediaUrl?: string | null
  mediaMimeType?: string | null
  mediaFilename?: string | null
  mediaCaption?: string | null
  mediaDurationSeconds?: number | null
  faseConversacion?: string | null
  accionBot?: string | null
}

interface ChatAreaProps {
  telefonoActivo: string | null
  contactoActivo: ContactoActivo | null | undefined
  mensajesActivos: Mensaje[]
  isLoadingMensajes: boolean
  isMobileViewingChat: boolean
  showActionsPanel: boolean
  onBackToList: () => void
  onToggleActionsPanel: () => void
}

export function ChatArea({
  telefonoActivo,
  contactoActivo,
  mensajesActivos,
  isLoadingMensajes,
  isMobileViewingChat,
  showActionsPanel,
  onBackToList,
  onToggleActionsPanel,
}: ChatAreaProps) {
  const router = useRouter()
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll al final cuando cambian los mensajes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [mensajesActivos])

  // Agrupar mensajes por fecha
  const mensajesAgrupados = useMemo(() => {
    const grupos: { fecha: string; mensajes: Mensaje[] }[] = []
    let fechaActual = ''
    
    for (const msg of mensajesActivos) {
      const fecha = format(msg.createdAt, 'yyyy-MM-dd')
      if (fecha !== fechaActual) {
        fechaActual = fecha
        grupos.push({ fecha, mensajes: [] })
      }
      grupos[grupos.length - 1].mensajes.push(msg)
    }
    
    return grupos
  }, [mensajesActivos])

  const openWhatsApp = useCallback((telefono: string) => {
    window.open(`https://wa.me/52${telefono}`, '_blank')
  }, [])

  const viewProfile = useCallback((contacto: ContactoActivo | null | undefined) => {
    if (!contacto) return
    router.push(`/leads?search=${contacto.telefono}`)
  }, [router])

  return (
    <main className={`
      flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden
      absolute sm:relative inset-0 h-full
      transition-transform duration-300 ease-in-out will-change-transform
      bg-gradient-to-b from-slate-950 to-slate-900
      ${isMobileViewingChat ? 'translate-x-0' : 'translate-x-full sm:translate-x-0'}
    `}>
      {telefonoActivo && contactoActivo ? (
        <>
          {/* Header del chat */}
          <header className="shrink-0 min-h-[60px] sm:min-h-[64px] px-2 sm:px-4 flex items-center gap-2 sm:gap-3 border-b border-slate-800/60 bg-slate-900/80 backdrop-blur-xl z-10 safe-area-top">
            <button
              onClick={onBackToList}
              className="sm:hidden p-2 -ml-1 hover:bg-slate-800 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            
            {/* Avatar circular */}
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0
              bg-gradient-to-br ${contactoActivo.tipoContacto === 'paciente' 
                ? 'from-emerald-500 to-emerald-600' 
                : contactoActivo.tipoContacto === 'lead' 
                  ? 'from-amber-500 to-orange-500' 
                  : 'from-slate-400 to-slate-500'}
            `}>
              {(contactoActivo.nombreContacto?.[0] || contactoActivo.telefono.slice(-2)).toUpperCase()}
            </div>
            
            {/* Info contacto */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm sm:text-[15px] truncate leading-tight">
                {contactoActivo.nombreContacto || 'Sin nombre'}
              </h3>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[12px] text-slate-400">
                <span className="font-mono truncate">{contactoActivo.telefono}</span>
                <span className="hidden xs:inline">•</span>
                <span className="hidden xs:inline truncate">{contactoActivo.tipoContacto === 'paciente' ? '✓ Paciente' : contactoActivo.estadoLead || 'Contacto'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <button
                onClick={() => openWhatsApp(contactoActivo.telefono)}
                className="p-2 sm:p-2.5 hover:bg-slate-800 rounded-full transition-colors min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
                title="Abrir en WhatsApp"
              >
                <MessageCircle className="w-5 h-5 text-emerald-500" />
              </button>
              <button
                onClick={() => viewProfile(contactoActivo)}
                className="hidden sm:flex p-2.5 hover:bg-slate-800 rounded-full transition-colors min-w-[44px] min-h-[44px] items-center justify-center"
                title="Ver perfil"
              >
                <ExternalLink className="w-5 h-5 text-slate-500" />
              </button>
              <button
                onClick={onToggleActionsPanel}
                className={`p-2 sm:p-2.5 rounded-full transition-colors min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center
                  ${showActionsPanel 
                    ? 'bg-teal-500/20 text-teal-400' 
                    : 'hover:bg-slate-800 text-slate-500'}`}
                title={showActionsPanel ? 'Cerrar acciones' : 'Acciones de lead'}
              >
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Lista de Mensajes */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-2 sm:px-4 md:px-6 py-2.5 sm:py-4 scroll-smooth bg-slate-900 overscroll-contain"
          >
            {isLoadingMensajes ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-900/30 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-teal-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-400">Cargando mensajes...</span>
                </div>
              </div>
            ) : mensajesAgrupados.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-20 h-20 rounded-3xl bg-slate-800 flex items-center justify-center mb-4">
                  <MessageCircle className="w-10 h-10 text-slate-600" />
                </div>
                <p className="text-base font-semibold text-slate-400">Sin mensajes</p>
                <p className="text-sm text-slate-500 mt-1">Esta conversación está vacía</p>
              </div>
            ) : (
              <div className="space-y-6 pb-4 max-w-4xl mx-auto">
                {mensajesAgrupados.map((grupo) => (
                  <div key={grupo.fecha}>
                    {/* Separador de fecha */}
                    <div className="sticky top-0 flex items-center justify-center py-3 z-10 pointer-events-none">
                      <div className="px-3 py-1 bg-slate-900/80 backdrop-blur rounded-full text-[11px] font-medium text-slate-400 shadow-sm">
                        {format(new Date(grupo.fecha), "d MMM yyyy", { locale: es })}
                      </div>
                    </div>
                    
                    {/* Mensajes del día */}
                    <div className="space-y-0">
                      {grupo.mensajes.map((msg, idx) => {
                        const prevMsg = grupo.mensajes[idx - 1];
                        const isConsecutive = prevMsg && prevMsg.remitente === msg.remitente;
                        
                        return (
                          <MessageBubble
                            key={msg.id}
                            contenido={msg.contenido}
                            rol={msg.remitente as 'usuario' | 'bot' | 'asistente' | 'sistema'}
                            createdAt={msg.createdAt}
                            isConsecutive={!!isConsecutive}
                            tipoMensaje={msg.tipoMensaje}
                            mediaUrl={msg.mediaUrl}
                            mediaMimeType={msg.mediaMimeType}
                            mediaFilename={msg.mediaFilename}
                            mediaCaption={msg.mediaCaption}
                            mediaDurationSeconds={msg.mediaDurationSeconds}
                            faseConversacion={msg.faseConversacion}
                            accionBot={msg.accionBot}
                          />
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer con acciones rápidas */}
          <footer className="shrink-0 py-2 px-3 bg-slate-900/80 backdrop-blur border-t border-slate-800/50">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Solo lectura</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <a
                  href={`https://wa.me/52${contactoActivo?.telefono.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 
                           text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
                <button
                  onClick={() => onToggleActionsPanel()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 
                           text-white text-xs font-medium rounded-lg transition-colors shadow-sm shadow-teal-500/20 lg:hidden"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Acciones</span>
                </button>
              </div>
            </div>
          </footer>
        </>
      ) : (
        /* Estado vacío (Desktop) */
        <div className="hidden sm:flex flex-1 flex-col items-center justify-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-1">Selecciona una conversación</h3>
          <p className="text-sm text-slate-400">
            Elige un contacto para ver sus mensajes
          </p>
        </div>
      )}
    </main>
  )
}
