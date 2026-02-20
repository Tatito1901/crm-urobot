'use client'

import { MessageCircle, Search, RefreshCw, Users, UserCheck, Clock } from 'lucide-react'
import { ConversationItem } from './ConversationItem'

const FILTER_OPTIONS = [
  { id: 'todos', label: 'Todos' },
  { id: 'recientes', label: 'Recientes' },
  { id: 'leads', label: 'Leads' },
  { id: 'pacientes', label: 'Pacientes' },
] as const

export type FiltroTipo = 'todos' | 'leads' | 'pacientes' | 'recientes'

interface ConversationData {
  telefono: string
  nombreContacto: string | null
  ultimoMensaje: string
  ultimaFecha: Date
  tipoContacto: 'paciente' | 'lead' | 'desconocido'
  estadoLead: string | null
  citasValidas: number
  totalMensajes: number
}

interface ConversationsSidebarProps {
  conversaciones: ConversationData[]
  filteredConversaciones: ConversationData[]
  conteosPorTipo: Record<string, number>
  telefonoActivo: string | null
  searchQuery: string
  filtroActivo: FiltroTipo
  isLoading: boolean
  mounted: boolean
  error: Error | null
  isMobileViewingChat: boolean
  onSearchChange: (query: string) => void
  onFiltroChange: (filtro: FiltroTipo) => void
  onSelectConversation: (telefono: string) => void
  onRefetch: () => void
}

export function ConversationsSidebar({
  filteredConversaciones,
  conteosPorTipo,
  telefonoActivo,
  searchQuery,
  filtroActivo,
  isLoading,
  mounted,
  error,
  isMobileViewingChat,
  onSearchChange,
  onFiltroChange,
  onSelectConversation,
  onRefetch,
}: ConversationsSidebarProps) {
  return (
    <aside className={`
      w-full sm:w-[300px] md:w-[340px] lg:w-[380px] border-r border-border flex flex-col 
      bg-card shrink-0 z-10
      absolute sm:relative inset-0 h-full
      transition-transform duration-300 ease-in-out will-change-transform
      ${isMobileViewingChat ? '-translate-x-full sm:translate-x-0' : 'translate-x-0'}
    `}>
      {/* Header */}
      <div className="hidden sm:flex flex-col border-b border-border">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h2 className="font-semibold text-foreground text-base font-jakarta">Conversaciones</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{mounted ? conteosPorTipo.todos : '—'} contactos</p>
          </div>
          <button 
            onClick={onRefetch} 
            title="Actualizar" 
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${mounted && isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="section-divider" />
      </div>

      {/* Search + Filters */}
      <div className="px-4 pt-3 pb-2 space-y-3 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-muted/40 border border-border rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40
                     placeholder:text-muted-foreground/50 transition-all hover:bg-muted/60"
          />
        </div>
        
        {/* Filter tabs — minimal pill style with touch-friendly targets */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {FILTER_OPTIONS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onFiltroChange(id)}
              className={`px-3 py-2 min-h-[36px] rounded-full text-xs font-medium whitespace-nowrap transition-all no-select
                ${filtroActivo === id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted/70'}`}
            >
              {label}
              {mounted && conteosPorTipo[id] > 0 && (
                <span className={`ml-1.5 ${filtroActivo === id ? 'text-primary-foreground/70' : 'text-muted-foreground/60'}`}>
                  {conteosPorTipo[id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {error ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-destructive" />
            </div>
            <p className="text-sm font-medium text-destructive">Error al cargar</p>
            <p className="text-xs mt-1 text-muted-foreground">{error.message}</p>
            <button 
              onClick={onRefetch}
              className="mt-4 px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg text-xs font-medium transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : !mounted || isLoading ? (
          <div className="px-4 py-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversaciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 px-8 animate-float-in">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-muted to-muted/50 border border-border flex items-center justify-center mb-4 shadow-sm">
              {filtroActivo === 'leads' ? <Users className="w-6 h-6 text-muted-foreground" /> :
               filtroActivo === 'pacientes' ? <UserCheck className="w-6 h-6 text-muted-foreground" /> :
               filtroActivo === 'recientes' ? <Clock className="w-6 h-6 text-muted-foreground" /> :
               <MessageCircle className="w-6 h-6 text-muted-foreground" />}
            </div>
            <p className="text-sm font-semibold text-foreground">
              {searchQuery ? 'Sin resultados' : 
               filtroActivo === 'leads' ? 'Sin leads' :
               filtroActivo === 'pacientes' ? 'Sin pacientes' :
               filtroActivo === 'recientes' ? 'Sin actividad reciente' :
               'Sin conversaciones'}
            </p>
            <p className="text-xs mt-1.5 text-center text-muted-foreground">
              {searchQuery ? `No se encontró "${searchQuery}"` :
               filtroActivo === 'recientes' ? 'No hay mensajes en las últimas 24h' :
               filtroActivo !== 'todos' ? (
                 <button onClick={() => onFiltroChange('todos')} className="text-primary hover:underline">
                   Ver todas
                 </button>
               ) : 'Las conversaciones aparecerán aquí'}
            </p>
          </div>
        ) : (
          <div className="px-2 py-1">
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
                onSelect={onSelectConversation}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
