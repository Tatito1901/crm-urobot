'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useConversaciones } from '@/hooks/useConversaciones'
import { MessageCircle, Search, ArrowLeft, Phone, UserCheck, UserPlus, Calendar, RefreshCw, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useSearchParams } from 'next/navigation'
import { ConversationItem } from './components/ConversationItem'
import { MessageBubble } from './components/MessageBubble'

export default function ConversacionesPage() {
  const searchParams = useSearchParams()
  const telefonoParam = searchParams.get('telefono')

  const {
    conversaciones,
    mensajesActivos,
    telefonoActivo,
    setTelefonoActivo,
    isLoading,
    isLoadingMensajes,
    refetch,
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
  const getTipoBadge = (tipo: string) => {
    if (tipo === 'paciente') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <UserCheck className="w-3 h-3" />
          Paciente
        </span>
      )
    }
    if (tipo === 'lead') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <UserPlus className="w-3 h-3" />
          Lead
        </span>
      )
    }
    return null
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header Mobile (Solo visible si NO estamos viendo chat) */}
      {!isMobileViewingChat && (
        <header className="sm:hidden shrink-0 px-4 py-3 border-b border-border bg-background flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground tracking-tight">Mensajes</h1>
          <button onClick={() => refetch()} className="p-2">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </header>
      )}

      {/* Contenedor principal */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        
        {/* ========== SIDEBAR ========== */}
        <aside className={`
          w-full sm:w-[300px] lg:w-[350px] border-r border-border flex flex-col bg-background shrink-0 z-10
          absolute sm:relative inset-0 h-full
          transition-transform duration-300 ease-in-out
          ${isMobileViewingChat ? '-translate-x-full sm:translate-x-0' : 'translate-x-0'}
        `}>
          {/* Header Desktop del Sidebar */}
          <div className="hidden sm:flex items-center justify-between px-4 py-3 border-b border-border/50">
            <h2 className="font-semibold">Mensajes</h2>
            <button onClick={() => refetch()} title="Actualizar" className="text-muted-foreground hover:text-foreground">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Buscador */}
          <div className="p-3 border-b border-border/50 shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Buscar conversación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-muted/50 border border-transparent rounded-xl
                         focus:outline-none focus:bg-background focus:border-primary/20 focus:ring-2 focus:ring-primary/10
                         placeholder:text-muted-foreground transition-all"
              />
            </div>
          </div>

          {/* Lista Virtualizada (Simulada con map simple pero memoizada) */}
          <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-muted/50 hover:scrollbar-thumb-muted">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-muted rounded w-3/4" />
                      <div className="h-2 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversaciones.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                  <MessageCircle className="w-6 h-6 opacity-40" />
                </div>
                <p className="text-sm font-medium">Sin conversaciones</p>
                {searchQuery && <p className="text-xs mt-1 opacity-70">Intenta otra búsqueda</p>}
              </div>
            ) : (
              <div>
                {filteredConversaciones.map(conv => (
                  <ConversationItem
                    key={conv.telefono}
                    telefono={conv.telefono}
                    nombreContacto={conv.nombreContacto}
                    ultimoMensaje={conv.ultimoMensaje}
                    ultimaFecha={conv.ultimaFecha}
                    tipoContacto={conv.tipoContacto}
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
          flex-1 flex flex-col min-w-0 min-h-0 bg-muted/5 overflow-hidden
          absolute sm:relative inset-0 h-full
          transition-transform duration-300 ease-in-out bg-slate-50 dark:bg-slate-950/50
          ${isMobileViewingChat ? 'translate-x-0' : 'translate-x-full sm:translate-x-0'}
        `}>
          {telefonoActivo && contactoActivo ? (
            <>
              {/* Header del chat */}
              <header className="shrink-0 h-16 px-4 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur-md z-10 shadow-sm">
                <button
                  onClick={() => setIsMobileViewingChat(false)}
                  className="sm:hidden -ml-2 p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                {/* Avatar */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm shrink-0 shadow-sm
                  ${contactoActivo.tipoContacto === 'paciente' ? 'bg-blue-500' : 
                    contactoActivo.tipoContacto === 'lead' ? 'bg-amber-500' : 'bg-slate-500'}
                `}>
                  {(contactoActivo.nombreContacto?.[0] || contactoActivo.telefono.slice(-2)).toUpperCase()}
                </div>
                
                {/* Info contacto */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                      {contactoActivo.nombreContacto || contactoActivo.telefono}
                    </h3>
                    <div className="hidden sm:block">
                      {getTipoBadge(contactoActivo.tipoContacto)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>{contactoActivo.telefono}</span>
                    <span className="sm:hidden">• {getTipoBadge(contactoActivo.tipoContacto)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {/* Aquí podrían ir botones de acción como 'Llamar', 'Ver Perfil' */}
                </div>
              </header>

              {/* Lista de Mensajes */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth"
              >
                {isLoadingMensajes ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Cargando historial...</span>
                    </div>
                  </div>
                ) : mensajesAgrupados.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                    <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-sm">No hay mensajes en esta conversación</p>
                  </div>
                ) : (
                  <div className="space-y-6 pb-4">
                    {mensajesAgrupados.map((grupo) => (
                      <div key={grupo.fecha}>
                        {/* Separador de fecha */}
                        <div className="sticky top-0 flex items-center justify-center py-4 z-10 pointer-events-none">
                          <div className="px-3 py-1 bg-muted/90 backdrop-blur shadow-sm rounded-full flex items-center gap-1.5 border border-border/50">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                              {format(new Date(grupo.fecha), "d 'de' MMMM, yyyy", { locale: es })}
                            </span>
                          </div>
                        </div>
                        
                        {/* Mensajes del día */}
                        <div className="space-y-0.5">
                          {grupo.mensajes.map((msg, idx) => {
                            // Detectar si es mensaje consecutivo del mismo rol
                            const prevMsg = grupo.mensajes[idx - 1];
                            const isConsecutive = prevMsg && prevMsg.rol === msg.rol;
                            
                            return (
                              <MessageBubble
                                key={msg.id}
                                contenido={msg.contenido}
                                rol={msg.rol}
                                createdAt={msg.createdAt}
                                isConsecutive={!!isConsecutive}
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
              <footer className="shrink-0 p-3 bg-background border-t border-border">
                <div className="bg-muted/30 border border-border/50 rounded-lg p-3 flex items-center justify-center gap-2 text-xs text-muted-foreground select-none">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Modo lectura • El historial se sincroniza automáticamente</span>
                </div>
              </footer>
            </>
          ) : (
            /* Estado vacío (Desktop) */
            <div className="hidden sm:flex flex-1 flex-col items-center justify-center text-muted-foreground p-8 bg-slate-50/50 dark:bg-slate-900/20">
              <div className="w-32 h-32 rounded-full bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                <MessageCircle className="w-12 h-12 text-blue-200 dark:text-blue-800" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Conversaciones UroBot</h3>
              <p className="text-sm text-center max-w-xs leading-relaxed opacity-80">
                Selecciona un chat de la izquierda para ver el historial completo de interacciones.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

