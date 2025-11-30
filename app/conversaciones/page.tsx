'use client'

import { useState, useRef, useEffect } from 'react'
import { useConversaciones } from '@/hooks/useConversaciones'
import { PageShell } from '@/app/components/crm/page-shell'
import { ConversationList } from './components/ConversationList'
import { ChatPanel } from './components/ChatPanel'
import { EmptyState } from './components/EmptyState'
import { MessageCircle, Search, ArrowLeft } from 'lucide-react'

export default function ConversacionesPage() {
  const {
    conversaciones,
    mensajesActivos,
    telefonoActivo,
    setTelefonoActivo,
    isLoading,
    isLoadingMensajes,
    marcarComoLeido,
    enviarMensaje,
    totalNoLeidos,
  } = useConversaciones()

  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileViewingChat, setIsMobileViewingChat] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Filtrar conversaciones por búsqueda
  const filteredConversaciones = conversaciones.filter(conv => {
    const query = searchQuery.toLowerCase()
    return (
      conv.telefono.includes(query) ||
      (conv.nombreContacto?.toLowerCase().includes(query) ?? false)
    )
  })

  // Seleccionar conversación
  const handleSelectConversation = async (telefono: string) => {
    setTelefonoActivo(telefono)
    setIsMobileViewingChat(true)
    await marcarComoLeido(telefono)
  }

  // Volver a lista en móvil
  const handleBackToList = () => {
    setIsMobileViewingChat(false)
  }

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [mensajesActivos])

  // Obtener info del contacto activo
  const contactoActivo = conversaciones.find(c => c.telefono === telefonoActivo)

  return (
    <PageShell 
      eyebrow="WhatsApp"
      title="Conversaciones" 
      description="Monitor de mensajes de WhatsApp con pacientes"
      fullWidth
    >
      <div className="flex h-[calc(100vh-120px)] bg-background rounded-lg border border-border overflow-hidden">
        {/* Lista de Conversaciones - Sidebar izquierdo */}
        <div 
          className={`
            w-full md:w-[380px] lg:w-[420px] border-r border-border flex flex-col
            ${isMobileViewingChat ? 'hidden md:flex' : 'flex'}
          `}
        >
          {/* Header de búsqueda */}
          <div className="p-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Urobot Chat</h2>
                <p className="text-xs text-muted-foreground">
                  {totalNoLeidos > 0 ? `${totalNoLeidos} sin leer` : 'Todas leídas'}
                </p>
              </div>
            </div>
            
            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar conversación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500
                         placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Lista de conversaciones */}
          <ConversationList
            conversaciones={filteredConversaciones}
            telefonoActivo={telefonoActivo}
            onSelect={handleSelectConversation}
            isLoading={isLoading}
          />
        </div>

        {/* Panel de Chat - Área principal */}
        <div 
          className={`
            flex-1 flex flex-col bg-[#0b141a] dark:bg-[#0b141a]
            ${!isMobileViewingChat ? 'hidden md:flex' : 'flex'}
          `}
        >
          {telefonoActivo && contactoActivo ? (
            <>
              {/* Header del chat */}
              <div className="h-16 px-4 flex items-center gap-3 border-b border-border bg-muted/30">
                {/* Botón volver en móvil */}
                <button
                  onClick={handleBackToList}
                  className="md:hidden p-2 -ml-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                {/* Avatar */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-white font-medium
                  ${contactoActivo.tipoContacto === 'paciente' ? 'bg-blue-500' : 
                    contactoActivo.tipoContacto === 'lead' ? 'bg-amber-500' : 'bg-slate-500'}
                `}>
                  {(contactoActivo.nombreContacto?.[0] || contactoActivo.telefono[0]).toUpperCase()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">
                    {contactoActivo.nombreContacto || contactoActivo.telefono}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {contactoActivo.telefono}
                    {contactoActivo.tipoContacto !== 'desconocido' && (
                      <span className="ml-2 capitalize">• {contactoActivo.tipoContacto}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Área de mensajes */}
              <ChatPanel
                mensajes={mensajesActivos}
                isLoading={isLoadingMensajes}
                onSendMessage={(msg: string) => enviarMensaje(telefonoActivo, msg)}
                chatEndRef={chatEndRef}
              />
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </PageShell>
  )
}
