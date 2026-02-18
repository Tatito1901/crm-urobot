'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useHasMounted } from '@/hooks/common/useHasMounted'
import { useConversaciones } from '@/hooks/conversaciones/useConversaciones'
import { RefreshCw } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { ConversationsSidebar, type FiltroTipo } from './components/ConversationsSidebar'
import { ChatArea } from './components/ChatArea'
import { ConversationActionsPanel } from './components/ConversationActionsPanel'

export default function ConversacionesPage() {
  const searchParams = useSearchParams()
  const telefonoParam = searchParams.get('telefono')
  const mounted = useHasMounted()

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

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isMobileViewingChat, setIsMobileViewingChat] = useState(false)
  const [showActionsPanel, setShowActionsPanel] = useState(false)
  const [filtroActivo, setFiltroActivo] = useState<FiltroTipo>('todos')
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-seleccionar teléfono si viene en URL
  useEffect(() => {
    if (telefonoParam && !telefonoActivo) {
      setTelefonoActivo(telefonoParam)
      setIsMobileViewingChat(true)
    }
  }, [telefonoParam, telefonoActivo, setTelefonoActivo])

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
    
    let leads = 0, pacientes = 0, recientes = 0
    const filtered: typeof conversaciones = []
    
    for (const c of conversaciones) {
      if (c.tipoContacto === 'lead') leads++
      if (c.tipoContacto === 'paciente') pacientes++
      const esReciente = new Date(c.ultimaFecha).getTime() > hace24h
      if (esReciente) recientes++
      
      if (filtroActivo === 'leads' && c.tipoContacto !== 'lead') continue
      if (filtroActivo === 'pacientes' && c.tipoContacto !== 'paciente') continue
      if (filtroActivo === 'recientes' && !esReciente) continue
      if (query && !c.telefono.includes(query) && !(c.nombreContacto?.toLowerCase().includes(query))) continue
      
      filtered.push(c)
    }
    
    return {
      filteredConversaciones: filtered,
      conteosPorTipo: { todos: conversaciones.length, leads, pacientes, recientes }
    }
  }, [conversaciones, debouncedSearch, filtroActivo])

  const handleSelectConversation = useCallback((telefono: string) => {
    setTelefonoActivo(telefono)
    setIsMobileViewingChat(true)
  }, [setTelefonoActivo])

  const contactoActivo = useMemo(() => 
    conversaciones.find(c => c.telefono === telefonoActivo),
    [conversaciones, telefonoActivo]
  )

  return (
    <div className="h-[calc(100dvh-4rem)] lg:h-screen flex flex-col bg-background overflow-hidden">
      {/* Header Mobile */}
      {!isMobileViewingChat && (
        <header className="sm:hidden shrink-0 px-4 py-3 border-b border-white/[0.06] bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl flex items-center justify-between safe-area-top">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-foreground">Mensajes</h1>
            <span className="text-xs text-muted-foreground bg-muted dark:bg-white/[0.06] px-2 py-0.5 rounded-full">
              {mounted ? conversaciones.length : 0}
            </span>
          </div>
          <button 
            onClick={() => refetch()} 
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${mounted && isLoading ? 'animate-spin' : ''}`} />
          </button>
        </header>
      )}

      {/* Contenedor principal */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        <ConversationsSidebar
          conversaciones={conversaciones}
          filteredConversaciones={filteredConversaciones}
          conteosPorTipo={conteosPorTipo}
          telefonoActivo={telefonoActivo}
          searchQuery={searchQuery}
          filtroActivo={filtroActivo}
          isLoading={isLoading}
          mounted={mounted}
          error={error}
          isMobileViewingChat={isMobileViewingChat}
          onSearchChange={setSearchQuery}
          onFiltroChange={setFiltroActivo}
          onSelectConversation={handleSelectConversation}
          onRefetch={refetch}
        />

        <ChatArea
          telefonoActivo={telefonoActivo}
          contactoActivo={contactoActivo}
          mensajesActivos={mensajesActivos}
          isLoadingMensajes={isLoadingMensajes}
          isMobileViewingChat={isMobileViewingChat}
          showActionsPanel={showActionsPanel}
          onBackToList={() => setIsMobileViewingChat(false)}
          onToggleActionsPanel={() => setShowActionsPanel(!showActionsPanel)}
        />

        {/* Panel de Acciones (Desktop) */}
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

      {/* Panel de Acciones (Mobile Bottom Sheet) */}
      {showActionsPanel && telefonoActivo && contactoActivo && (
        <>
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
            onClick={() => setShowActionsPanel(false)}
          />
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

