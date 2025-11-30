import React, { memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { UserCheck, UserPlus } from 'lucide-react';

interface ConversationItemProps {
  telefono: string;
  nombreContacto: string | null;
  ultimoMensaje: string;
  ultimaFecha: Date;
  tipoContacto: 'paciente' | 'lead' | 'desconocido';
  isActive: boolean;
  onSelect: (telefono: string) => void;
}

export const ConversationItem = memo(function ConversationItem({
  telefono,
  nombreContacto,
  ultimoMensaje,
  ultimaFecha,
  tipoContacto,
  isActive,
  onSelect
}: ConversationItemProps) {
  
  const getAvatarColor = (tipo: string) => {
    switch (tipo) {
      case 'paciente': return 'bg-blue-500 shadow-blue-500/20';
      case 'lead': return 'bg-amber-500 shadow-amber-500/20';
      default: return 'bg-slate-500 shadow-slate-500/20';
    }
  };

  const getTipoBadge = (tipo: string) => {
    if (tipo === 'paciente') {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
          <UserCheck className="w-2.5 h-2.5" />
          Paciente
        </span>
      );
    }
    if (tipo === 'lead') {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20">
          <UserPlus className="w-2.5 h-2.5" />
          Lead
        </span>
      );
    }
    return null;
  };

  return (
    <button
      onClick={() => onSelect(telefono)}
      className={`
        w-full p-3 flex items-center gap-3 text-left transition-all duration-200 border-b border-border/40 last:border-0
        ${isActive 
          ? 'bg-primary/5 border-l-4 border-l-primary' 
          : 'hover:bg-muted/40 border-l-4 border-l-transparent'}
      `}
    >
      {/* Avatar */}
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm shrink-0 shadow-sm transition-transform group-hover:scale-105
        ${getAvatarColor(tipoContacto)}
      `}>
        {(nombreContacto?.[0] || telefono.slice(-2)).toUpperCase()}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <span className={`font-semibold text-sm truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
            {nombreContacto || telefono}
          </span>
          <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
            {formatDistanceToNow(ultimaFecha, { addSuffix: false, locale: es })}
          </span>
        </div>
        
        <div className="flex items-center gap-2 mt-0.5">
          <p className={`text-xs truncate flex-1 ${isActive ? 'text-foreground/80' : 'text-muted-foreground'}`}>
            {ultimoMensaje}
          </p>
          {getTipoBadge(tipoContacto)}
        </div>
      </div>
    </button>
  );
});
