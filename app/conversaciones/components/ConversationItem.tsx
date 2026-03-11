import React, { memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ShieldBan, CalendarCheck, Zap, UserX } from 'lucide-react';

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
  isBloqueado?: boolean;
  mensajesNoLeidos?: number;
}

const getInitials = (nombre: string | null, telefono: string) => {
  if (nombre) {
    const parts = nombre.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return nombre.slice(0, 2).toUpperCase();
  }
  return telefono.slice(-2);
};

const formatTimeCompact = (fecha: Date | string) => {
  const dateObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  if (isNaN(dateObj.getTime())) return '';
  const diff = Date.now() - dateObj.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return formatDistanceToNow(dateObj, { addSuffix: false, locale: es });
};

const cleanPreview = (text: string) =>
  text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/\n/g, ' ').trim();

const AVATAR_GRADIENTS = [
  'bg-gradient-to-br from-blue-500 to-blue-700',
  'bg-gradient-to-br from-emerald-500 to-emerald-700',
  'bg-gradient-to-br from-violet-500 to-violet-700',
  'bg-gradient-to-br from-amber-500 to-amber-700',
  'bg-gradient-to-br from-rose-500 to-rose-700',
  'bg-gradient-to-br from-cyan-500 to-cyan-700',
  'bg-gradient-to-br from-indigo-500 to-indigo-700',
];

const ESTADO_CONFIG: Record<string, { label: string; dot: string; icon?: React.ReactNode }> = {
  nuevo: { label: 'Nuevo', dot: 'bg-blue-400' },
  contactado: { label: 'Contactado', dot: 'bg-blue-400' },
  interactuando: { label: 'Activo', dot: 'bg-teal-400' },
  cita_propuesta: { label: 'Cita prop.', dot: 'bg-amber-400', icon: <CalendarCheck className="w-2.5 h-2.5" /> },
  cita_agendada: { label: 'Agendada', dot: 'bg-emerald-400', icon: <CalendarCheck className="w-2.5 h-2.5" /> },
  convertido: { label: 'Convertido', dot: 'bg-emerald-400', icon: <Zap className="w-2.5 h-2.5" /> },
  show: { label: 'Show', dot: 'bg-emerald-400' },
  no_show: { label: 'No show', dot: 'bg-rose-400' },
  no_interesado: { label: 'No interesa', dot: 'bg-slate-400', icon: <UserX className="w-2.5 h-2.5" /> },
  perdido: { label: 'Perdido', dot: 'bg-slate-500' },
};

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
  onSelect,
  isBloqueado = false,
  mensajesNoLeidos = 0,
}: ConversationItemProps) {
  const colorIndex = telefono.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_GRADIENTS.length;
  const hasUnread = mensajesNoLeidos > 0;

  // Tipo badge — color-coded by estado
  const estadoConfig = estadoLead ? ESTADO_CONFIG[estadoLead] : null;
  const tipoBadge = tipoContacto === 'paciente' 
    ? { label: 'Paciente', dot: 'bg-emerald-400' }
    : estadoConfig 
      ? { label: estadoConfig.label, dot: estadoConfig.dot }
      : null;

  return (
    <button
      onClick={() => onSelect(telefono)}
      className={`
        conv-active-indicator group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150
        ${isActive 
          ? 'is-active bg-primary/8 border border-primary/15' 
          : 'hover:bg-white/[0.04] active:bg-white/[0.06] border border-transparent'}
      `}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className={`
          w-11 h-11 rounded-full flex items-center justify-center text-white text-xs font-bold tracking-wide shadow-sm
          ${isBloqueado 
            ? 'bg-red-900/60 ring-2 ring-red-500/40' 
            : isActive 
              ? 'bg-gradient-to-br from-primary to-primary/80 ring-2 ring-primary/30' 
              : AVATAR_GRADIENTS[colorIndex]}
        `}>
          {isBloqueado ? <ShieldBan className="w-4 h-4 text-red-300" /> : getInitials(nombreContacto, telefono)}
        </div>
        {/* Unread dot */}
        {hasUnread && !isActive && (
          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center ring-2 ring-card">
            <span className="text-[8px] font-bold text-white">{mensajesNoLeidos > 9 ? '9+' : mensajesNoLeidos}</span>
          </div>
        )}
      </div>
      
      {/* Content — 2 rows */}
      <div className="flex-1 min-w-0">
        {/* Row 1: Name + time */}
        <div className="flex items-baseline justify-between gap-2">
          <span className={`text-[13px] truncate transition-colors ${
            isActive ? 'font-bold text-primary' 
              : hasUnread ? 'font-bold text-foreground' 
              : 'font-semibold text-foreground/90 group-hover:text-foreground'
          }`}>
            {nombreContacto || telefono}
          </span>
          <span className={`text-[10px] shrink-0 tabular-nums font-medium ${
            hasUnread && !isActive ? 'text-teal-400' : 'text-muted-foreground/60'
          }`} suppressHydrationWarning>
            {formatTimeCompact(ultimaFecha)}
          </span>
        </div>
        
        {/* Row 2: Preview + estado badge */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className={`text-xs truncate flex-1 leading-relaxed ${
            hasUnread && !isActive ? 'text-foreground/80' : 'text-muted-foreground/60'
          }`}>
            {cleanPreview(ultimoMensaje)}
          </p>
          {isBloqueado ? (
            <span className="text-[9px] font-bold shrink-0 px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400">Bloqueado</span>
          ) : tipoBadge ? (
            <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.06]">
              <span className={`w-1.5 h-1.5 rounded-full ${tipoBadge.dot}`} />
              <span className="text-[9px] font-medium text-muted-foreground/80">{tipoBadge.label}</span>
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
});
