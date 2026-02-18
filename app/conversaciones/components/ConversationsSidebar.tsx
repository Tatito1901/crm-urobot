'use client'

import { type ReactNode } from 'react'
import { MessageCircle, Search, RefreshCw, MessageSquare, Users, UserCheck } from 'lucide-react'
import { ConversationItem } from './ConversationItem'

const FILTER_ICON_MAP = { MessageSquare, RefreshCw, Users, UserCheck } as const
const FILTER_OPTIONS = [
  { id: 'todos', label: 'Todos', icon: 'MessageSquare' as const },
  { id: 'recientes', label: '24h', icon: 'RefreshCw' as const },
  { id: 'leads', label: 'Leads', icon: 'Users' as const },
  { id: 'pacientes', label: 'Pacientes', icon: 'UserCheck' as const },
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
      w-full sm:w-[280px] md:w-[320px] lg:w-[380px] border-r border-slate-200/80 dark:border-white/[0.10] flex flex-col 
      bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl shrink-0 z-10
      absolute sm:relative inset-0 h-full
      transition-transform duration-300 ease-in-out will-change-transform
      ${isMobileViewingChat ? '-translate-x-full sm:translate-x-0' : 'translate-x-0'}
    `}>
      {/* Header Desktop del Sidebar */}
      <div className="hidden sm:flex items-center justify-between px-4 py-3 border-b border-slate-200/50 dark:border-white/[0.10]">
        <div>
          <h2 className="font-semibold text-foreground text-lg font-jakarta">Mensajes</h2>
          <p className="text-xs text-muted-foreground">{mounted ? conteosPorTipo.todos : 0} conversaciones</p>
        </div>
        <button 
          onClick={onRefetch} 
          title="Actualizar" 
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 text-slate-400 ${mounted && isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Buscador y Filtros */}
      <div className="px-3 py-2 space-y-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar contacto..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 dark:bg-slate-800/60 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-teal-500/20
                     placeholder:text-slate-400 transition-all"
          />
        </div>
        
        {/* Filtros rápidos */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {FILTER_OPTIONS.map(({ id, label, icon }) => {
            const Icon = FILTER_ICON_MAP[icon]
            return (
              <button
                key={id}
                onClick={() => onFiltroChange(id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all
                  ${filtroActivo === id 
                    ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/20' 
                    : 'bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/[0.12]'}`}
              >
                <Icon className="w-3 h-3" />
                <span>{label}</span>
                {conteosPorTipo[id] > 0 && (
                  <span className={`ml-0.5 text-[10px] ${filtroActivo === id ? 'text-white/80' : 'text-slate-400'}`}>
                    {conteosPorTipo[id]}
                  </span>
                )}
              </button>
            )
          })}
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
              onClick={onRefetch}
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
                 <button onClick={() => onFiltroChange('todos')} className="text-blue-500 hover:underline">
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
                onSelect={onSelectConversation}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
