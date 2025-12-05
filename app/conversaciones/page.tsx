'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useConversaciones } from '@/hooks/useConversaciones'
import { MessageCircle, Search, ArrowLeft, Phone, UserCheck, UserPlus, Calendar, RefreshCw, Eye, ExternalLink, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useSearchParams, useRouter } from 'next/navigation'
import { ConversationItem } from './components/ConversationItem'
import { MessageBubble } from './components/MessageBubble'

export default function ConversacionesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const telefonoParam = searchParams.get('telefono')
  
  // Estado para evitar hydration mismatch
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const {
    conversaciones,
    mensajesActivos,
    telefonoActivo,
    setTelefonoActivo,
    isLoading,
    isLoadingMensajes,
    refetch,
    error,
  } = useConversaciones()
  

  // Auto-seleccionar teléfono si viene en URL
  useEffect(() => {
    if (telefonoParam && !telefonoActivo) {
      setTelefonoActivo(telefonoParam)
      setIsMobileViewingChat(true)
    }
  }, [telefonoParam, telefonoActivo, setTelefonoActivo])

  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileViewingChat, setIsMobileViewingChat] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Filtrar conversaciones por búsqueda (Memoizado)
  const filteredConversaciones = useMemo(() => 
    conversaciones.filter(conv => {
      const query = searchQuery.toLowerCase()
      return (
        conv.telefono.includes(query) ||
        (conv.nombreContacto?.toLowerCase().includes(query) ?? false)
      )
    }), [conversaciones, searchQuery])

  // Seleccionar conversación
  const handleSelectConversation = (telefono: string) => {
    setTelefonoActivo(telefono)
    setIsMobileViewingChat(true)
  }

  // Auto-scroll al final cuando cambian los mensajes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [mensajesActivos])

  // Info del contacto activo
  const contactoActivo = useMemo(() => 
    conversaciones.find(c => c.telefono === telefonoActivo),
    [conversaciones, telefonoActivo]
  )

  // Agrupar mensajes por fecha (Memoizado)
  const mensajesAgrupados = useMemo(() => {
    const grupos: { fecha: string; mensajes: typeof mensajesActivos }[] = []
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

  // Badge del header (reutiliza lógica similar al item pero simplificada)
  const getTipoBadge = (tipo: string, estado?: string | null) => {
    if (tipo === 'paciente') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <UserCheck className="w-3 h-3" />
          Paciente
        </span>
      )
    }
    if (tipo === 'lead') {
      const label = estado === 'En seguimiento' ? 'Seguimiento' : 'Lead';
      const isHot = estado === 'En seguimiento';
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
          isHot 
            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
        }`}>
          <UserPlus className="w-3 h-3" />
          {label}
        </span>
      )
    }
    return null
  }

  // Abrir WhatsApp
  const openWhatsApp = useCallback((telefono: string) => {
    window.open(`https://wa.me/52${telefono}`, '_blank')
  }, [])

  // Ver perfil del contacto
  const viewProfile = useCallback((contacto: typeof contactoActivo) => {
    if (!contacto) return
    if (contacto.tipoContacto === 'paciente') {
      // Buscar paciente por teléfono - ir a leads por ahora
      router.push(`/leads?search=${contacto.telefono}`)
    } else {
      router.push(`/leads?search=${contacto.telefono}`)
    }
  }, [router])

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 overflow-hidden">
      {/* Header Mobile (Solo visible si NO estamos viendo chat) */}
      {!isMobileViewingChat && (
        <header className="sm:hidden shrink-0 px-4 py-3 border-b border-border/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Mensajes</h1>
          </div>
          <button 
            onClick={() => refetch()} 
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-slate-400 ${mounted && isLoading ? 'animate-spin' : ''}`} />
          </button>
        </header>
      )}

      {/* Contenedor principal */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        
        {/* ========== SIDEBAR ========== */}
        <aside className={`
          w-full sm:w-[320px] lg:w-[380px] border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col 
          bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shrink-0 z-10
          absolute sm:relative inset-0 h-full
          transition-transform duration-300 ease-in-out
          ${isMobileViewingChat ? '-translate-x-full sm:translate-x-0' : 'translate-x-0'}
        `}>
          {/* Header Desktop del Sidebar */}
          <div className="hidden sm:flex items-center justify-between px-5 py-4 border-b border-slate-200/50 dark:border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Conversaciones</h2>
                <p className="text-[11px] text-muted-foreground">{conversaciones.length} contactos</p>
              </div>
            </div>
            <button 
              onClick={() => refetch()} 
              title="Actualizar" 
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-slate-500 ${mounted && isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Buscador */}
          <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 shrink-0">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Buscar por nombre o teléfono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-100/80 dark:bg-slate-800/50 border border-transparent rounded-xl
                         focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10
                         placeholder:text-slate-400 transition-all duration-200"
              />
            </div>
          </div>

          {/* Lista de conversaciones */}
          <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-slate-600">
            {error ? (
              <div className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-7 h-7 text-red-500" />
                </div>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">Error al cargar</p>
                <p className="text-xs mt-1 text-red-500/70">{error.message}</p>
                <button 
                  onClick={() => refetch()}
                  className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-medium transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : !mounted || isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                    <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversaciones.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground px-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-foreground">Sin conversaciones</p>
                {searchQuery && <p className="text-xs mt-2 text-center">No hay resultados para &quot;{searchQuery}&quot;</p>}
              </div>
            ) : (
              <div className="p-2">
                {filteredConversaciones.map(conv => (
                  <ConversationItem
                    key={conv.telefono}
                    telefono={conv.telefono}
                    nombreContacto={conv.nombreContacto}
                    ultimoMensaje={conv.ultimoMensaje}
                    ultimaFecha={conv.ultimaFecha}
                    tipoContacto={conv.tipoContacto}
                    estadoLead={conv.estadoLead}
                    citasValidas={conv.citasValidas}
                    totalMensajes={conv.totalMensajes}
                    isActive={conv.telefono === telefonoActivo}
                    onSelect={handleSelectConversation}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* ========== CHAT AREA ========== */}
        <main className={`
          flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden
          absolute sm:relative inset-0 h-full
          transition-transform duration-300 ease-in-out
          bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900
          ${isMobileViewingChat ? 'translate-x-0' : 'translate-x-full sm:translate-x-0'}
        `}>
          {telefonoActivo && contactoActivo ? (
            <>
              {/* Header del chat */}
              <header className="shrink-0 h-[72px] px-4 flex items-center gap-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-10">
                <button
                  onClick={() => setIsMobileViewingChat(false)}
                  className="sm:hidden -ml-1 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                
                {/* Avatar */}
                <div className={`
                  w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg
                  ${contactoActivo.tipoContacto === 'paciente' 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/25' 
                    : contactoActivo.tipoContacto === 'lead' 
                      ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/25' 
                      : 'bg-gradient-to-br from-slate-500 to-slate-600 shadow-slate-500/25'}
                `}>
                  {(contactoActivo.nombreContacto?.[0] || contactoActivo.telefono.slice(-2)).toUpperCase()}
                </div>
                
                {/* Info contacto */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground text-base truncate">
                      {contactoActivo.nombreContacto || contactoActivo.telefono}
                    </h3>
                    <div className="hidden sm:block">
                      {getTipoBadge(contactoActivo.tipoContacto, contactoActivo.estadoLead)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Phone className="w-3 h-3" />
                    <span className="font-medium">{contactoActivo.telefono}</span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span>{contactoActivo.totalMensajes} mensajes</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openWhatsApp(contactoActivo.telefono)}
                    className="hidden sm:flex items-center gap-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => viewProfile(contactoActivo)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    title="Ver perfil"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </header>

              {/* Lista de Mensajes */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth"
              >
                {isLoadingMensajes ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                      </div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Cargando mensajes...</span>
                    </div>
                  </div>
                ) : mensajesAgrupados.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                      <MessageCircle className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-base font-semibold text-slate-600 dark:text-slate-400">Sin mensajes</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Esta conversación está vacía</p>
                  </div>
                ) : (
                  <div className="space-y-6 pb-4 max-w-4xl mx-auto">
                    {mensajesAgrupados.map((grupo) => (
                      <div key={grupo.fecha}>
                        {/* Separador de fecha */}
                        <div className="sticky top-0 flex items-center justify-center py-4 z-10 pointer-events-none">
                          <div className="px-4 py-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl shadow-sm rounded-full flex items-center gap-2 border border-slate-200/50 dark:border-slate-700/50">
                            <Calendar className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                              {format(new Date(grupo.fecha), "d 'de' MMMM, yyyy", { locale: es })}
                            </span>
                          </div>
                        </div>
                        
                        {/* Mensajes del día */}
                        <div className="space-y-1">
                          {grupo.mensajes.map((msg, idx) => {
                            const prevMsg = grupo.mensajes[idx - 1];
                            const isConsecutive = prevMsg && prevMsg.rol === msg.rol;
                            
                            return (
                              <MessageBubble
                                key={msg.id}
                                contenido={msg.contenido}
                                rol={msg.rol}
                                createdAt={msg.createdAt}
                                isConsecutive={!!isConsecutive}
                                tipoMensaje={msg.tipoMensaje}
                                mediaUrl={msg.mediaUrl}
                                mediaMimeType={msg.mediaMimeType}
                                mediaFilename={msg.mediaFilename}
                                mediaCaption={msg.mediaCaption}
                                mediaDurationSeconds={msg.mediaDurationSeconds}
                              />
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer de solo lectura */}
              <footer className="shrink-0 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80">
                <div className="max-w-4xl mx-auto bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-4 flex items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400 select-none">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="font-medium">Modo lectura • El historial se sincroniza automáticamente</span>
                </div>
              </footer>
            </>
          ) : (
            /* Estado vacío (Desktop) */
            <div className="hidden sm:flex flex-1 flex-col items-center justify-center p-8">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center mb-6 shadow-xl shadow-blue-500/10">
                <MessageSquare className="w-14 h-14 text-blue-400 dark:text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Conversaciones</h3>
              <p className="text-sm text-center max-w-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Selecciona una conversación de la lista para ver el historial completo de mensajes con el paciente.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

