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

const ESTADO_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  nuevo: { label: 'Nuevo', badgeClass: 'estado-badge-nuevo' },
  contactado: { label: 'Contactado', badgeClass: 'estado-badge-nuevo' },
  interactuando: { label: 'Activo', badgeClass: 'estado-badge-interactuando' },
  cita_propuesta: { label: 'Cita propuesta', badgeClass: 'estado-badge-cita_propuesta' },
  cita_agendada: { label: 'Cita agendada', badgeClass: 'estado-badge-cita_agendada' },
  convertido: { label: 'Convertido', badgeClass: 'estado-badge-convertido' },
  show: { label: 'Show', badgeClass: 'estado-badge-convertido' },
  no_show: { label: 'No show', badgeClass: 'estado-badge-no_show' },
  no_interesado: { label: 'No interesado', badgeClass: 'estado-badge-no_interesado' },
  perdido: { label: 'Perdido', badgeClass: 'estado-badge-perdido' },
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

  // Tipo badge — color-coded by estado
  const estadoConfig = estadoLead ? ESTADO_CONFIG[estadoLead] : null;
  const tipoBadge = tipoContacto === 'paciente' 
    ? { label: 'Paciente', cls: 'estado-badge-convertido' }
    : estadoConfig 
      ? { label: estadoConfig.label, cls: estadoConfig.badgeClass }
      : null;

  return (
    <button
      onClick={() => onSelect(telefono)}
      className={`
        conv-active-indicator group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150
        ${isActive 
          ? 'is-active bg-primary/10 text-foreground' 
          : 'hover:bg-white/[0.04] active:bg-white/[0.06] text-foreground'}
      `}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className={`
          w-11 h-11 rounded-full flex items-center justify-center text-white text-xs font-bold tracking-wide
          ${isBloqueado ? 'bg-red-900/60 ring-2 ring-red-500/40' : isActive ? 'bg-primary' : AVATAR_COLORS[colorIndex]}
        `}>
          {isBloqueado ? <ShieldBan className="w-4 h-4 text-red-300" /> : getInitials(nombreContacto, telefono)}
        </div>
      </div>
      
      {/* Content — 2 rows */}
      <div className="flex-1 min-w-0">
        {/* Row 1: Name + time */}
        <div className="flex items-baseline justify-between gap-2">
          <span className={`text-[13px] font-semibold truncate transition-colors ${
            isActive ? 'text-primary' : 'text-foreground/90 group-hover:text-foreground'
          }`}>
            {nombreContacto || telefono}
          </span>
          <span className="text-[10px] text-muted-foreground/70 shrink-0 tabular-nums font-medium" suppressHydrationWarning>
            {formatTimeCompact(ultimaFecha)}
          </span>
        </div>
        
        {/* Row 2: Preview + estado badge */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className="text-xs text-muted-foreground/70 truncate flex-1 leading-relaxed">
            {cleanPreview(ultimoMensaje)}
          </p>
          {isBloqueado ? (
            <span className="text-[9px] font-bold shrink-0 px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400">Bloqueado</span>
          ) : tipoBadge ? (
            <span className={`text-[9px] font-bold shrink-0 px-1.5 py-0.5 rounded-full ${tipoBadge.cls}`}>
              {tipoBadge.label}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
});
