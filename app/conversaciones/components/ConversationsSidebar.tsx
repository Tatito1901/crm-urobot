'use client'

import { memo } from 'react'
import { MessageCircle, RefreshCw, Users, UserCheck, Clock, MessagesSquare } from 'lucide-react'
import { ConversationItem } from './ConversationItem'
import { SearchInput } from '@/app/components/common/SearchInput'

const FILTER_OPTIONS = [
  { id: 'todos', label: 'Todos', icon: MessagesSquare },
  { id: 'recientes', label: 'Recientes', icon: Clock },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'pacientes', label: 'Pacientes', icon: UserCheck },
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
  mensajesNoLeidos?: number
  // Lead enrichment
  temperatura?: string | null
  citaOfrecidaAt?: Date | null
  citaAgendadaAt?: Date | null
  scoreTotal?: number | null
  fuente?: string | null
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
  estaBloqueado?: (telefono: string) => boolean
}

export const ConversationsSidebar = memo(function ConversationsSidebar({
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
  estaBloqueado,
}: ConversationsSidebarProps) {
  return (
    <aside className={`
      w-full sm:w-[300px] md:w-[340px] lg:w-[380px] border-r border-border flex flex-col 
      bg-card shrink-0 z-20
      absolute sm:relative inset-0 h-full
      transition-transform duration-300 ease-in-out will-change-transform
      ${isMobileViewingChat ? '-translate-x-full sm:translate-x-0' : 'translate-x-0'}
    `}>
      {/* Header */}
      <div className="hidden sm:flex flex-col border-b border-border">
        <div className="flex items-center justify-between px-5 py-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3.5 w-[2px] rounded-full bg-teal-400" aria-hidden />
              <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-muted-foreground/60">Mensajes</p>
            </div>
            <h2 className="font-bold text-foreground text-lg font-jakarta tracking-tight mt-0.5">Conversaciones</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] tabular-nums font-medium text-muted-foreground/60">{mounted ? conteosPorTipo.todos : '—'}</span>
            <button 
              onClick={onRefetch} 
              title="Actualizar" 
              className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground/60 ${mounted && isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="px-4 pt-3 pb-3 space-y-3 shrink-0">
        <SearchInput
          id="conversaciones-search"
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Buscar por nombre o teléfono..."
          compact
        />
        
        {/* Filter tabs — pill style with icons */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5 momentum-scroll">
          {FILTER_OPTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onFiltroChange(id)}
              className={`flex items-center gap-1.5 px-3 py-2 min-h-[40px] sm:min-h-[36px] rounded-full text-xs font-semibold whitespace-nowrap transition-all no-select
                ${filtroActivo === id 
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20' 
                  : 'text-muted-foreground hover:text-foreground bg-white/[0.04] hover:bg-white/[0.07] active:bg-white/[0.09] border border-border/40'}`}
            >
              <Icon className="w-3 h-3" />
              {label}
              {mounted && conteosPorTipo[id] > 0 && (
                <span className={`ml-0.5 tabular-nums ${filtroActivo === id ? 'text-primary-foreground/70' : 'text-muted-foreground/50'}`}>
                  {conteosPorTipo[id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto min-h-0 conv-list-scroll">
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
              <div key={i} className="flex items-center gap-3 px-3 py-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-muted/70 shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-3.5 bg-muted/70 rounded-md w-2/3" />
                  <div className="h-3 bg-muted/50 rounded-md w-4/5" />
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
                isBloqueado={estaBloqueado?.(conv.telefono) ?? false}
                mensajesNoLeidos={conv.mensajesNoLeidos}
                temperatura={conv.temperatura}
                citaOfrecidaAt={conv.citaOfrecidaAt}
                citaAgendadaAt={conv.citaAgendadaAt}
                scoreTotal={conv.scoreTotal}
                fuente={conv.fuente}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  )
});
