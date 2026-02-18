'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useConversaciones } from '@/hooks/useConversaciones'
import { MessageCircle, Search, ArrowLeft, RefreshCw, ExternalLink, MessageSquare, Sparkles, Phone, Filter, Users, UserCheck } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useSearchParams, useRouter } from 'next/navigation'
import { ConversationItem } from './components/ConversationItem'
import { MessageBubble } from './components/MessageBubble'
import { ConversationActionsPanel } from './components/ConversationActionsPanel'

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
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isMobileViewingChat, setIsMobileViewingChat] = useState(false)
  const [showActionsPanel, setShowActionsPanel] = useState(false)
  const [filtroActivo, setFiltroActivo] = useState<'todos' | 'leads' | 'pacientes' | 'recientes'>('todos')
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce search para no filtrar en cada keystroke
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 250)
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current) }
  }, [searchQuery])

  // ✅ OPTIMIZADO: Single-pass para conteos + filtro combinado
  const { filteredConversaciones, conteosPorTipo } = useMemo(() => {
    const hace24h = Date.now() - 24 * 60 * 60 * 1000
    const query = debouncedSearch.toLowerCase()
    
    // Single pass: contar tipos + filtrar al mismo tiempo
    let leads = 0, pacientes = 0, recientes = 0
    const filtered: typeof conversaciones = []
    
    for (const c of conversaciones) {
      // Conteos (siempre, para badges)
      if (c.tipoContacto === 'lead') leads++
      if (c.tipoContacto === 'paciente') pacientes++
      const esReciente = new Date(c.ultimaFecha).getTime() > hace24h
      if (esReciente) recientes++
      
      // Filtro por tipo
      if (filtroActivo === 'leads' && c.tipoContacto !== 'lead') continue
      if (filtroActivo === 'pacientes' && c.tipoContacto !== 'paciente') continue
      if (filtroActivo === 'recientes' && !esReciente) continue
      
      // Filtro por búsqueda
      if (query && !c.telefono.includes(query) && !(c.nombreContacto?.toLowerCase().includes(query))) continue
      
      filtered.push(c)
    }
    
    return {
      filteredConversaciones: filtered,
      conteosPorTipo: {
        todos: conversaciones.length,
        leads,
        pacientes,
        recientes,
      }
    }
  }, [conversaciones, debouncedSearch, filtroActivo])

  // Seleccionar conversación (memoizado)
  const handleSelectConversation = useCallback((telefono: string) => {
    setTelefonoActivo(telefono)
    setIsMobileViewingChat(true)
  }, [setTelefonoActivo])

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
    <div className="h-[calc(100dvh-4rem)] lg:h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 overflow-hidden">
      {/* Header Mobile (Solo visible si NO estamos viendo chat) */}
      {!isMobileViewingChat && (
        <header className="sm:hidden shrink-0 px-4 py-3 border-b border-border/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl flex items-center justify-between safe-area-top">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-foreground">Mensajes</h1>
            <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {mounted ? conversaciones.length : 0}
            </span>
          </div>
          <button 
            onClick={() => refetch()} 
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
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
          transition-transform duration-300 ease-in-out will-change-transform
          ${isMobileViewingChat ? '-translate-x-full sm:translate-x-0' : 'translate-x-0'}
        `}>
          {/* Header Desktop del Sidebar - Más minimalista */}
          <div className="hidden sm:flex items-center justify-between px-4 py-3 border-b border-slate-200/50 dark:border-slate-800/50">
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-lg">Mensajes</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{mounted ? conversaciones.length : 0} conversaciones</p>
            </div>
            <button 
              onClick={() => refetch()} 
              title="Actualizar" 
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-slate-400 ${mounted && isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Buscador y Filtros */}
          <div className="px-3 py-2 space-y-2 shrink-0">
            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar contacto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 dark:bg-slate-800/60 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500/20
                         placeholder:text-slate-400 transition-all"
              />
            </div>
            
            {/* Filtros rápidos - Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {([
                { id: 'todos', label: 'Todos', icon: <MessageSquare className="w-3 h-3" /> },
                { id: 'recientes', label: '24h', icon: <RefreshCw className="w-3 h-3" /> },
                { id: 'leads', label: 'Leads', icon: <Users className="w-3 h-3" /> },
                { id: 'pacientes', label: 'Pacientes', icon: <UserCheck className="w-3 h-3" /> },
              ] as const).map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setFiltroActivo(id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all
                    ${filtroActivo === id 
                      ? 'bg-blue-500 text-white shadow-sm' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                  {icon}
                  <span>{label}</span>
                  {conteosPorTipo[id] > 0 && (
                    <span className={`ml-0.5 text-[10px] ${filtroActivo === id ? 'text-white/80' : 'text-slate-400'}`}>
                      {conteosPorTipo[id]}
                    </span>
                  )}
                </button>
              ))}
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
                  {filtroActivo === 'leads' ? <Users className="w-8 h-8 text-slate-400" /> :
                   filtroActivo === 'pacientes' ? <UserCheck className="w-8 h-8 text-slate-400" /> :
                   <MessageCircle className="w-8 h-8 text-slate-400" />}
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {searchQuery ? 'Sin resultados' : 
                   filtroActivo === 'leads' ? 'Sin leads' :
                   filtroActivo === 'pacientes' ? 'Sin pacientes' :
                   filtroActivo === 'recientes' ? 'Sin actividad reciente' :
                   'Sin conversaciones'}
                </p>
                <p className="text-xs mt-2 text-center text-slate-400">
                  {searchQuery ? `No hay resultados para "${searchQuery}"` :
                   filtroActivo === 'recientes' ? 'No hay mensajes en las últimas 24h' :
                   filtroActivo !== 'todos' ? (
                     <button onClick={() => setFiltroActivo('todos')} className="text-blue-500 hover:underline">
                       Ver todas las conversaciones
                     </button>
                   ) : 'Las conversaciones aparecerán aquí'}
                </p>
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
          transition-transform duration-300 ease-in-out will-change-transform
          bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900
          ${isMobileViewingChat ? 'translate-x-0' : 'translate-x-full sm:translate-x-0'}
        `}>
          {telefonoActivo && contactoActivo ? (
            <>
              {/* Header del chat - Estilo WhatsApp */}
              <header className="shrink-0 min-h-[60px] sm:min-h-[64px] px-2 sm:px-4 flex items-center gap-2 sm:gap-3 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl z-10 safe-area-top">
                <button
                  onClick={() => setIsMobileViewingChat(false)}
                  className="sm:hidden p-2 -ml-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
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
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[12px] text-slate-500 dark:text-slate-400">
                    <span className="font-mono truncate">{contactoActivo.telefono}</span>
                    <span className="hidden xs:inline">•</span>
                    <span className="hidden xs:inline truncate">{contactoActivo.tipoContacto === 'paciente' ? '✓ Paciente' : contactoActivo.estadoLead || 'Contacto'}</span>
                  </div>
                </div>

                {/* Actions - Estilo iconos limpios */}
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <button
                    onClick={() => openWhatsApp(contactoActivo.telefono)}
                    className="p-2 sm:p-2.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
                    title="Abrir en WhatsApp"
                  >
                    <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                  </button>
                  <button
                    onClick={() => viewProfile(contactoActivo)}
                    className="hidden sm:flex p-2.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors min-w-[44px] min-h-[44px] items-center justify-center"
                    title="Ver perfil"
                  >
                    <ExternalLink className="w-5 h-5 text-slate-500" />
                  </button>
                  {/* Botón de acciones de lead */}
                  <button
                    onClick={() => setShowActionsPanel(!showActionsPanel)}
                    className={`p-2 sm:p-2.5 rounded-full transition-colors min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center
                      ${showActionsPanel 
                        ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' 
                        : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500'}`}
                    title={showActionsPanel ? 'Cerrar acciones' : 'Acciones de lead'}
                  >
                    <Sparkles className="w-5 h-5" />
                  </button>
                </div>
              </header>

              {/* Lista de Mensajes - Fondo limpio */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto px-2 sm:px-6 py-3 sm:py-4 scroll-smooth bg-slate-50/50 dark:bg-slate-950/50 overscroll-contain"
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
                        {/* Separador de fecha - Más minimalista */}
                        <div className="sticky top-0 flex items-center justify-center py-3 z-10 pointer-events-none">
                          <div className="px-3 py-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-full text-[11px] font-medium text-slate-500 dark:text-slate-400 shadow-sm">
                            {format(new Date(grupo.fecha), "d MMM yyyy", { locale: es })}
                          </div>
                        </div>
                        
                        {/* Mensajes del día */}
                        <div className="space-y-3">
                          {grupo.mensajes.map((msg, idx) => {
                            const prevMsg = grupo.mensajes[idx - 1];
                            const isConsecutive = prevMsg && prevMsg.remitente === msg.remitente;
                            
                            return (
                              <MessageBubble
                                key={msg.id}
                                contenido={msg.contenido}
                                rol={msg.remitente as 'usuario' | 'asistente'}
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

              {/* Footer con acciones rápidas */}
              <footer className="shrink-0 py-2 px-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-t border-slate-200/50 dark:border-slate-800/50">
                <div className="flex items-center justify-between gap-2">
                  {/* Info de solo lectura */}
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Solo lectura</span>
                  </div>
                  
                  {/* Botones de acción rápida */}
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
                      onClick={() => setShowActionsPanel(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 
                               text-white text-xs font-medium rounded-lg transition-colors shadow-sm lg:hidden"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Acciones</span>
                    </button>
                  </div>
                </div>
              </footer>
            </>
          ) : (
            /* Estado vacío (Desktop) - Más minimalista */
            <div className="hidden sm:flex flex-1 flex-col items-center justify-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">Selecciona una conversación</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Elige un contacto para ver sus mensajes
              </p>
            </div>
          )}
        </main>

        {/* ========== PANEL DE ACCIONES (Desktop) ========== */}
        {showActionsPanel && telefonoActivo && contactoActivo && (
          <aside className="hidden lg:flex w-[320px] shrink-0 animate-in slide-in-from-right duration-200">
            <ConversationActionsPanel
              telefono={contactoActivo.telefono}
              nombreContacto={contactoActivo.nombreContacto}
              onClose={() => setShowActionsPanel(false)}
            />
          </aside>
        )}
      </div>

      {/* ========== PANEL DE ACCIONES (Mobile Bottom Sheet) ========== */}
      {showActionsPanel && telefonoActivo && contactoActivo && (
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
            onClick={() => setShowActionsPanel(false)}
          />
          {/* Bottom Sheet */}
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300">
            <ConversationActionsPanel
              telefono={contactoActivo.telefono}
              nombreContacto={contactoActivo.nombreContacto}
              onClose={() => setShowActionsPanel(false)}
              isMobile={true}
            />
          </div>
        </>
      )}
    </div>
  )
}

