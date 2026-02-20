import React, { memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ShieldBan } from 'lucide-react';

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

const AVATAR_COLORS = [
  'bg-blue-600', 'bg-emerald-600', 'bg-violet-600', 'bg-amber-600',
  'bg-rose-600', 'bg-cyan-600', 'bg-indigo-600',
];

const ESTADO_LABEL: Record<string, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  interactuando: 'Interactuando',
  cita_propuesta: 'Cita propuesta',
  cita_agendada: 'Cita agendada',
  convertido: 'Convertido',
  show: 'Show',
  no_show: 'No show',
  no_interesado: 'No interesado',
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
  isBloqueado = false
}: ConversationItemProps) {
  const colorIndex = telefono.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length;

  // Tipo badge — single subtle indicator
  const tipoBadge = tipoContacto === 'paciente' 
    ? { label: 'Paciente', cls: 'text-emerald-400' }
    : estadoLead 
      ? { label: ESTADO_LABEL[estadoLead] || estadoLead, cls: 'text-muted-foreground' }
      : null;

  return (
    <button
      onClick={() => onSelect(telefono)}
      className={`
        conv-active-indicator group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200
        ${isActive 
          ? 'is-active bg-primary/10 text-foreground shadow-sm' 
          : 'hover:bg-muted/60 text-foreground'}
      `}
    >
      {/* Avatar — compact circle */}
      <div className="relative shrink-0">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold
          ${isBloqueado ? 'bg-red-900/60 ring-2 ring-red-500/40' : isActive ? 'bg-primary' : AVATAR_COLORS[colorIndex]}
        `}>
          {isBloqueado ? <ShieldBan className="w-4 h-4 text-red-300" /> : getInitials(nombreContacto, telefono)}
        </div>
      </div>
      
      {/* Content — 2 rows only */}
      <div className="flex-1 min-w-0">
        {/* Row 1: Name + time */}
        <div className="flex items-baseline justify-between gap-2">
          <span className={`text-sm font-medium truncate transition-colors ${isActive ? 'text-primary' : 'group-hover:text-foreground'}`}>
            {nombreContacto || telefono}
          </span>
          <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums" suppressHydrationWarning>
            {formatTimeCompact(ultimaFecha)}
          </span>
        </div>
        
        {/* Row 2: Preview + optional tipo */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className="text-xs text-muted-foreground truncate flex-1 leading-relaxed">
            {cleanPreview(ultimoMensaje)}
          </p>
          {isBloqueado ? (
            <span className="text-[10px] font-medium shrink-0 text-red-400">Bloqueado</span>
          ) : tipoBadge ? (
            <span className={`text-[10px] font-medium shrink-0 ${tipoBadge.cls}`}>
              {tipoBadge.label}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
});
