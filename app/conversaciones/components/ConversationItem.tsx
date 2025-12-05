import React, { memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { UserPlus, HelpCircle, UserCheck, Calendar, MessageSquare } from 'lucide-react';

interface ConversationItemProps {
  telefono: string;
  nombreContacto: string | null;
  ultimoMensaje: string;
  ultimaFecha: Date;
  tipoContacto: 'paciente' | 'lead' | 'desconocido';
  estadoLead: string | null;
  citasValidas: number;
  totalMensajes: number;
  isActive: boolean;
  onSelect: (telefono: string) => void;
}

export const ConversationItem = memo(function ConversationItem({
  telefono,
  nombreContacto,
  ultimoMensaje,
  ultimaFecha,
  tipoContacto,
  estadoLead,
  citasValidas,
  totalMensajes,
  isActive,
  onSelect
}: ConversationItemProps) {
  
  const getAvatarStyles = (tipo: string) => {
    switch (tipo) {
      case 'paciente': 
        return {
          bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
          shadow: 'shadow-lg shadow-blue-500/20'
        };
      case 'lead': 
        return {
          bg: 'bg-gradient-to-br from-amber-500 to-orange-500',
          shadow: 'shadow-lg shadow-amber-500/20'
        };
      default: 
        return {
          bg: 'bg-gradient-to-br from-slate-400 to-slate-500',
          shadow: 'shadow-lg shadow-slate-500/10'
        };
    }
  };

  const avatarStyles = getAvatarStyles(tipoContacto);

  return (
    <button
      onClick={() => onSelect(telefono)}
      className={`
        w-full p-3 flex items-center gap-3 text-left transition-all duration-200 rounded-xl mb-1
        ${isActive 
          ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500/30' 
          : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/50'}
      `}
    >
      {/* Avatar */}
      <div className={`
        w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0
        ${avatarStyles.bg} ${avatarStyles.shadow}
      `}>
        {(nombreContacto?.[0] || telefono.slice(-2)).toUpperCase()}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0 overflow-hidden">
        {/* Row 1: Nombre + Tiempo */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`font-semibold text-sm truncate ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-slate-100'}`}>
              {nombreContacto || telefono}
            </span>
            {/* Badge de tipo */}
            {tipoContacto === 'paciente' && (
              <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <UserCheck className="w-2.5 h-2.5" />
              </span>
            )}
            {tipoContacto === 'lead' && estadoLead === 'Interesado' && (
              <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                <UserPlus className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 whitespace-nowrap font-medium" suppressHydrationWarning>
            {formatDistanceToNow(ultimaFecha, { addSuffix: false, locale: es })}
          </span>
        </div>
        
        {/* Row 2: Último mensaje */}
        <p className={`text-xs truncate mt-0.5 ${isActive ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
          {ultimoMensaje}
        </p>
        
        {/* Row 3: Metadata */}
        <div className="flex items-center gap-2 mt-1.5">
          {/* Contador de mensajes */}
          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
            <MessageSquare className="w-3 h-3" />
            {totalMensajes}
          </span>
          
          {/* Citas */}
          {citasValidas > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              <Calendar className="w-3 h-3" />
              {citasValidas} cita{citasValidas !== 1 ? 's' : ''}
            </span>
          )}
          
          {/* Estado del lead */}
          {estadoLead && estadoLead !== 'Nuevo' && tipoContacto !== 'paciente' && (
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
              estadoLead === 'Convertido' 
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                : estadoLead === 'Interesado' 
                  ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}>
              {estadoLead}
            </span>
          )}
        </div>
      </div>
    </button>
  );
});
