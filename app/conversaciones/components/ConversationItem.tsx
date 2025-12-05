import React, { memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { UserCheck, Calendar, Check, CheckCheck } from 'lucide-react';

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

// Función para obtener iniciales del nombre
const getInitials = (nombre: string | null, telefono: string) => {
  if (nombre) {
    const parts = nombre.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nombre.slice(0, 2).toUpperCase();
  }
  return telefono.slice(-2);
};

// Función para formatear tiempo compacto
const formatTimeCompact = (fecha: Date | string) => {
  const dateObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  if (isNaN(dateObj.getTime())) return '';

  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (mins < 1) return 'ahora';
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return formatDistanceToNow(dateObj, { addSuffix: false, locale: es });
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
  onSelect
}: ConversationItemProps) {
  
  // Colores del avatar basados en el teléfono (consistente)
  const avatarColors = [
    'from-blue-500 to-blue-600',
    'from-emerald-500 to-emerald-600', 
    'from-purple-500 to-purple-600',
    'from-amber-500 to-orange-500',
    'from-pink-500 to-rose-500',
    'from-cyan-500 to-teal-500',
    'from-indigo-500 to-violet-500',
  ];
  
  const colorIndex = telefono.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % avatarColors.length;
  const avatarGradient = avatarColors[colorIndex];

  return (
    <button
      onClick={() => onSelect(telefono)}
      className={`
        w-full px-3 py-2.5 flex items-center gap-3 text-left transition-all duration-150 rounded-xl
        ${isActive 
          ? 'bg-blue-500/10 dark:bg-blue-500/20' 
          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 active:bg-slate-200 dark:active:bg-slate-700/60'}
      `}
    >
      {/* Avatar con indicador de tipo */}
      <div className="relative shrink-0">
        <div className={`
          w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm
          bg-gradient-to-br ${avatarGradient}
        `}>
          {getInitials(nombreContacto, telefono)}
        </div>
        
        {/* Indicador de tipo (esquina inferior derecha) */}
        {tipoContacto === 'paciente' && (
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
            <UserCheck className="w-3 h-3 text-white" />
          </div>
        )}
        {citasValidas > 0 && tipoContacto !== 'paciente' && (
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
            <Calendar className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0 overflow-hidden">
        {/* Row 1: Nombre + Tiempo */}
        <div className="flex items-center justify-between gap-2">
          <span className={`font-semibold text-[15px] truncate ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-slate-100'}`}>
            {nombreContacto || telefono}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0 tabular-nums" suppressHydrationWarning>
            {formatTimeCompact(ultimaFecha)}
          </span>
        </div>
        
        {/* Row 2: Preview del mensaje con estado */}
        <div className="flex items-center gap-1.5 mt-0.5">
          {/* Icono de leído (simulado - siempre doble check) */}
          <CheckCheck className="w-4 h-4 text-blue-500 shrink-0" />
          <p className="text-[13px] truncate text-slate-500 dark:text-slate-400">
            {ultimoMensaje}
          </p>
        </div>
        
        {/* Row 3: Tags compactos */}
        <div className="flex items-center gap-1.5 mt-1.5">
          {/* Badge del estado lead */}
          {estadoLead && tipoContacto !== 'paciente' && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              estadoLead === 'Convertido' 
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                : estadoLead === 'Interesado' 
                  ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                  : estadoLead === 'Contactado'
                    ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
            }`}>
              {estadoLead}
            </span>
          )}
          
          {/* Citas badge */}
          {citasValidas > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              {citasValidas} cita{citasValidas !== 1 ? 's' : ''}
            </span>
          )}
          
          {/* Contador mensajes (sutil) */}
          <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-auto">
            {totalMensajes} msgs
          </span>
        </div>
      </div>
    </button>
  );
});
