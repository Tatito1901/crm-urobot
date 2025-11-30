'use client'

import { memo } from 'react'
import type { Conversacion } from '@/types/mensajes'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { User, Users, HelpCircle } from 'lucide-react'

interface ConversationListProps {
  conversaciones: Conversacion[]
  telefonoActivo: string | null
  onSelect: (telefono: string) => void
  isLoading: boolean
}

function ConversationListComponent({
  conversaciones,
  telefonoActivo,
  onSelect,
  isLoading,
}: ConversationListProps) {
  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (conversaciones.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No hay conversaciones</p>
          <p className="text-sm mt-1">Los mensajes de WhatsApp aparecerán aquí</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversaciones.map((conv) => {
        const isActive = conv.telefono === telefonoActivo
        const tiempoRelativo = formatDistanceToNow(conv.ultimaFecha, {
          addSuffix: true,
          locale: es,
        })

        return (
          <button
            key={conv.telefono}
            onClick={() => onSelect(conv.telefono)}
            className={`
              w-full flex items-center gap-3 p-3 text-left transition-colors
              hover:bg-muted/50
              ${isActive ? 'bg-muted' : ''}
            `}
          >
            {/* Avatar */}
            <div className={`
              relative w-12 h-12 rounded-full flex items-center justify-center text-white font-medium shrink-0
              ${conv.tipoContacto === 'paciente' ? 'bg-blue-500' : 
                conv.tipoContacto === 'lead' ? 'bg-amber-500' : 'bg-slate-500'}
            `}>
              {conv.nombreContacto ? (
                conv.nombreContacto[0].toUpperCase()
              ) : conv.tipoContacto === 'paciente' ? (
                <User className="w-5 h-5" />
              ) : conv.tipoContacto === 'lead' ? (
                <Users className="w-5 h-5" />
              ) : (
                <HelpCircle className="w-5 h-5" />
              )}
              
              {/* Badge de no leídos */}
              {conv.mensajesNoLeidos > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 
                               bg-emerald-500 text-white text-xs font-bold 
                               rounded-full flex items-center justify-center">
                  {conv.mensajesNoLeidos > 99 ? '99+' : conv.mensajesNoLeidos}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={`font-medium truncate ${conv.mensajesNoLeidos > 0 ? 'text-foreground' : 'text-foreground/80'}`}>
                  {conv.nombreContacto || conv.telefono}
                </span>
                <span className={`text-xs shrink-0 ${conv.mensajesNoLeidos > 0 ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                  {tiempoRelativo}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mt-0.5">
                <p className={`text-sm truncate ${conv.mensajesNoLeidos > 0 ? 'text-foreground/90 font-medium' : 'text-muted-foreground'}`}>
                  {conv.ultimoMensaje}
                </p>
              </div>
              
              {/* Tipo de contacto */}
              {conv.tipoContacto !== 'desconocido' && (
                <span className={`
                  inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded capitalize
                  ${conv.tipoContacto === 'paciente' 
                    ? 'bg-blue-500/10 text-blue-500' 
                    : 'bg-amber-500/10 text-amber-500'}
                `}>
                  {conv.tipoContacto}
                </span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

export const ConversationList = memo(ConversationListComponent)
