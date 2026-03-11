'use client'

import { useRef, useEffect, useMemo, useCallback, useState, memo } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, ArrowLeft, Loader2, ExternalLink, MessageSquare, PanelRight, Phone, ShieldBan, ChevronDown, Flame, Thermometer } from 'lucide-react'
import type { TipoMensaje } from '@/types/chat'
import { toDayKeyMX, formatDateSeparatorMX } from '@/lib/date-utils'
import { MessageBubble } from './MessageBubble'

interface ContactoActivo {
  telefono: string
  nombreContacto: string | null
  tipoContacto: 'paciente' | 'lead' | 'desconocido'
  estadoLead: string | null
  totalMensajes?: number
  temperatura?: string | null
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
  estaBloqueado?: boolean
  onBackToList: () => void
  onToggleActionsPanel: () => void
  onRefreshBloqueados?: () => void
}

export const ChatArea = memo(function ChatArea({
  telefonoActivo,
  contactoActivo,
  mensajesActivos,
  isLoadingMensajes,
  isMobileViewingChat,
  showActionsPanel,
  estaBloqueado = false,
  onBackToList,
  onToggleActionsPanel,
  onRefreshBloqueados,
}: ChatAreaProps) {
  const router = useRouter()
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [showBloqueoConfirm, setShowBloqueoConfirm] = useState(false)
  const [bloqueoMotivo, setBloqueoMotivo] = useState('')
  const [showScrollDown, setShowScrollDown] = useState(false)

  // Auto-scroll al final cuando cambian los mensajes
  useEffect(() => {
    if (chatContainerRef.current) {
      requestAnimationFrame(() => {
        chatContainerRef.current?.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: mensajesActivos.length <= 20 ? 'smooth' : 'instant'
        })
      })
    }
  }, [mensajesActivos])

  // Show/hide scroll-to-bottom FAB
  useEffect(() => {
    const el = chatContainerRef.current
    if (!el) return
    const handleScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      setShowScrollDown(distanceFromBottom > 200)
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [telefonoActivo])

  const scrollToBottom = useCallback(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth'
    })
  }, [])

  // Agrupar mensajes por fecha
  const mensajesAgrupados = useMemo(() => {
    const grupos: { fecha: string; mensajes: Mensaje[] }[] = []
    let fechaActual = ''
    
    for (const msg of mensajesActivos) {
      const fecha = toDayKeyMX(msg.createdAt)
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
    : contactoActivo?.estadoLead?.replace(/_/g, ' ') || 'Contacto'

  // Temperatura config
  const TEMP_CONFIG: Record<string, { color: string; label: string }> = {
    frio: { color: 'text-blue-400 bg-blue-500/15', label: 'Frío' },
    tibio: { color: 'text-amber-400 bg-amber-500/15', label: 'Tibio' },
    caliente: { color: 'text-orange-400 bg-orange-500/15', label: 'Caliente' },
    muy_caliente: { color: 'text-red-400 bg-red-500/15', label: 'Muy caliente' },
    urgente: { color: 'text-red-400 bg-red-500/15', label: 'Urgente' },
  }
  const tempConfig = contactoActivo?.temperatura ? TEMP_CONFIG[contactoActivo.temperatura] : null

  return (
    <main className={`
      flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden
      absolute sm:relative inset-0 h-full
      transition-transform duration-300 ease-in-out will-change-transform
      bg-[#0b141a] touch-manipulation z-10
      ${isMobileViewingChat ? 'translate-x-0' : 'translate-x-full sm:translate-x-0'}
    `}>
      {telefonoActivo && contactoActivo ? (
        <>
          {/* Header — clean, single row */}
          <header className="shrink-0 h-14 sm:h-14 px-2 sm:px-4 flex items-center gap-2 sm:gap-3 border-b wa-header z-10">
            <button
              onClick={onBackToList}
              className="sm:hidden p-2.5 -ml-1 hover:bg-muted rounded-lg transition-colors touch-target"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            
            {/* Contact info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground text-sm truncate">
                  {contactoActivo.nombreContacto || contactoActivo.telefono}
                </h3>
                {tempConfig && (
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${tempConfig.color}`}>
                    <Flame className="w-2.5 h-2.5" />
                    {tempConfig.label}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {contactoActivo.telefono} · <span className="capitalize">{tipoLabel}</span>
                {mensajesActivos.length > 0 && (
                  <span className="text-muted-foreground/50"> · {mensajesActivos.length} msgs</span>
                )}
              </p>
            </div>

            {/* Actions — icon buttons only */}
            <div className="flex items-center gap-0.5">
              {estaBloqueado && (
                <span className="hidden sm:flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-md text-[10px] font-medium text-red-400 mr-1">
                  <ShieldBan className="w-3 h-3" />
                  Bloqueado
                </span>
              )}
              <button
                onClick={() => openWhatsApp(contactoActivo.telefono)}
                className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors touch-target"
                title="Abrir WhatsApp"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
              </button>
              <button
                onClick={() => viewProfile(contactoActivo)}
                className="hidden sm:flex p-2 hover:bg-white/[0.06] rounded-lg transition-colors touch-target"
                title="Ver perfil"
              >
                <ExternalLink className="w-4 h-4 text-muted-foreground/60" />
              </button>
              <button
                onClick={onToggleActionsPanel}
                className={`p-2 rounded-lg transition-colors touch-target
                  ${showActionsPanel 
                    ? 'bg-teal-500/10 text-teal-400' 
                    : 'hover:bg-white/[0.06] text-muted-foreground/60'}`}
                title={showActionsPanel ? 'Cerrar panel' : 'Panel de acciones'}
              >
                <PanelRight className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Blocked banner */}
          {estaBloqueado && (
            <div className="shrink-0 px-4 py-2 bg-red-500/10 border-b border-red-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-red-400">
                <ShieldBan className="w-4 h-4 shrink-0" />
                <span className="font-medium hidden sm:inline">Número bloqueado — el bot no responderá a este contacto</span>
                <span className="font-medium sm:hidden">Bloqueado — bot desactivado</span>
              </div>
            </div>
          )}

          {/* Messages area */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 overscroll-contain momentum-scroll chat-pattern relative"
          >
            {isLoadingMensajes ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Cargando mensajes...</span>
                </div>
              </div>
            ) : mensajesAgrupados.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full animate-float-in">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted to-muted/50 border border-border flex items-center justify-center mb-4 shadow-sm">
                  <MessageCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">Sin mensajes</p>
                <p className="text-xs text-muted-foreground mt-1.5">Esta conversación está vacía</p>
              </div>
            ) : (
              <div className="pb-4 max-w-3xl mx-auto">
                {mensajesAgrupados.map((grupo) => (
                  <div key={grupo.fecha} className="wa-date-group">
                    {/* Date separator */}
                    <div className="sticky top-0 flex items-center justify-center py-3 z-10 pointer-events-none">
                      <div className="px-4 py-1.5 wa-date-pill rounded-lg text-[11px] font-semibold tracking-wide">
                        {formatDateSeparatorMX(grupo.fecha)}
                      </div>
                    </div>
                    
                    {/* Day messages */}
                    <div>
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

          {/* Scroll to bottom FAB */}
          {showScrollDown && (
            <div className="absolute bottom-20 right-4 sm:right-6 z-20 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <button
                onClick={scrollToBottom}
                className="w-10 h-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Ir al final"
              >
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          )}

          {/* Footer — read-only indicator + actions */}
          <div className="shrink-0 py-2 px-3 sm:px-4 border-t wa-footer flex items-center justify-between pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] lg:pb-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className={`w-1.5 h-1.5 rounded-full ${estaBloqueado ? 'bg-red-500' : 'bg-emerald-500'} ${!estaBloqueado ? 'animate-pulse' : ''}`} />
                <span>{estaBloqueado ? 'Bloqueado' : 'Solo lectura'}</span>
              </div>
            </div>
            <button
              onClick={() => onToggleActionsPanel()}
              className="flex items-center gap-1.5 px-3 py-2.5 min-h-[44px] text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.06] active:bg-white/[0.09] rounded-lg transition-colors lg:hidden"
            >
              <PanelRight className="w-3.5 h-3.5" />
              <span>Acciones</span>
            </button>
          </div>
        </>
      ) : (
        /* Empty state (Desktop) */
        <div className="hidden sm:flex flex-1 flex-col items-center justify-center p-8 animate-float-in">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/15 flex items-center justify-center mb-5 shadow-lg shadow-primary/5">
            <MessageSquare className="w-9 h-9 text-primary/60" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1.5 font-jakarta">Selecciona una conversación</h3>
          <p className="text-sm text-muted-foreground max-w-xs text-center">
            Elige un contacto del panel izquierdo para ver sus mensajes
          </p>
        </div>
      )}
    </main>
  )
});
