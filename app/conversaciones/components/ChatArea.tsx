'use client'

import { useRef, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, ArrowLeft, Loader2, ExternalLink, MessageSquare, PanelRight, Phone } from 'lucide-react'
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
    const clean = telefono.replace(/\D/g, '')
    const full = clean.length === 10 ? `52${clean}` : clean
    window.open(`https://wa.me/${full}`, '_blank')
  }, [])

  const viewProfile = useCallback((contacto: ContactoActivo | null | undefined) => {
    if (!contacto) return
    router.push(`/leads?search=${contacto.telefono}`)
  }, [router])

  // Tipo label
  const tipoLabel = contactoActivo?.tipoContacto === 'paciente' 
    ? 'Paciente' 
    : contactoActivo?.estadoLead || 'Contacto'

  return (
    <main className={`
      flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden
      absolute sm:relative inset-0 h-full
      transition-transform duration-300 ease-in-out will-change-transform
      bg-background
      ${isMobileViewingChat ? 'translate-x-0' : 'translate-x-full sm:translate-x-0'}
    `}>
      {telefonoActivo && contactoActivo ? (
        <>
          {/* Header — clean, single row */}
          <header className="shrink-0 h-14 sm:h-14 px-2 sm:px-4 flex items-center gap-2 sm:gap-3 border-b border-border bg-card z-10">
            <button
              onClick={onBackToList}
              className="sm:hidden p-2.5 -ml-1 hover:bg-muted rounded-lg transition-colors touch-target"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            
            {/* Contact info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm truncate">
                {contactoActivo.nombreContacto || contactoActivo.telefono}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {contactoActivo.telefono} · {tipoLabel}
              </p>
            </div>

            {/* Actions — icon buttons only */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => openWhatsApp(contactoActivo.telefono)}
                className="p-2.5 hover:bg-muted rounded-lg transition-colors touch-target"
                title="Abrir WhatsApp"
              >
                <Phone className="w-4 h-4 text-emerald-500" />
              </button>
              <button
                onClick={() => viewProfile(contactoActivo)}
                className="hidden sm:flex p-2.5 hover:bg-muted rounded-lg transition-colors touch-target"
                title="Ver perfil"
              >
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                onClick={onToggleActionsPanel}
                className={`p-2.5 rounded-lg transition-colors touch-target
                  ${showActionsPanel 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted text-muted-foreground'}`}
                title={showActionsPanel ? 'Cerrar panel' : 'Panel de acciones'}
              >
                <PanelRight className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Messages area */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 scroll-smooth overscroll-contain momentum-scroll"
          >
            {isLoadingMensajes ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Cargando mensajes...</span>
                </div>
              </div>
            ) : mensajesAgrupados.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                  <MessageCircle className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Sin mensajes</p>
                <p className="text-xs text-muted-foreground mt-1">Esta conversación está vacía</p>
              </div>
            ) : (
              <div className="space-y-4 pb-4 max-w-3xl mx-auto">
                {mensajesAgrupados.map((grupo) => (
                  <div key={grupo.fecha}>
                    {/* Date separator */}
                    <div className="sticky top-0 flex items-center justify-center py-2 z-10 pointer-events-none">
                      <div className="px-3 py-1 bg-card/90 backdrop-blur-sm border border-border rounded-full text-[11px] font-medium text-muted-foreground">
                        {format(new Date(grupo.fecha), "d MMM yyyy", { locale: es })}
                      </div>
                    </div>
                    
                    {/* Day messages */}
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

          {/* Minimal footer — read-only indicator */}
          <div className="shrink-0 py-2 px-3 sm:px-4 border-t border-border flex items-center justify-between safe-area-bottom">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Solo lectura</span>
            </div>
            <button
              onClick={() => onToggleActionsPanel()}
              className="flex items-center gap-1.5 px-3 py-2 min-h-[36px] text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted/70 rounded-lg transition-colors lg:hidden"
            >
              <PanelRight className="w-3.5 h-3.5" />
              <span>Acciones</span>
            </button>
          </div>
        </>
      ) : (
        /* Empty state (Desktop) */
        <div className="hidden sm:flex flex-1 flex-col items-center justify-center p-8">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <MessageSquare className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">Selecciona una conversación</h3>
          <p className="text-sm text-muted-foreground">
            Elige un contacto para ver sus mensajes
          </p>
        </div>
      )}
    </main>
  )
}
