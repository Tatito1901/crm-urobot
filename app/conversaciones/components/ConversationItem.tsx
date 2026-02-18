import React, { memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { UserCheck, Calendar, Bot, Clock, Zap } from 'lucide-react';

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

  // Verificar si es reciente (últimas 2 horas)
  const esReciente = () => {
    const fecha = typeof ultimaFecha === 'string' ? new Date(ultimaFecha) : ultimaFecha;
    const hace2h = Date.now() - 2 * 60 * 60 * 1000;
    return fecha.getTime() > hace2h;
  };
  
  // Verificar si necesita atención (lead nuevo o interesado sin cita)
  const necesitaAtencion = tipoContacto === 'lead' && 
    (estadoLead === 'nuevo' || estadoLead === 'interesado') && 
    citasValidas === 0;

  // Limpiar preview del mensaje (quitar formato markdown)
  const cleanPreview = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/\n/g, ' ')
      .trim();
  };

  return (
    <button
      onClick={() => onSelect(telefono)}
      className={`
        group w-full px-3 py-3.5 sm:py-3 flex items-center gap-3 text-left transition-all duration-200
        active:bg-slate-100 dark:active:bg-slate-800
        ${isActive 
          ? 'bg-blue-50 dark:bg-blue-950/40 border-l-2 border-blue-500' 
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border-l-2 border-transparent'}
      `}
    >
      {/* Avatar minimalista */}
      <div className="relative shrink-0">
        <div className={`
          w-12 h-12 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-medium text-sm
          ${isActive 
            ? 'bg-blue-500 text-white' 
            : `bg-gradient-to-br ${avatarGradient} text-white`}
          transition-all duration-200 shadow-sm
        `}>
          {getInitials(nombreContacto, telefono)}
        </div>
        
        {/* Indicador de tipo - más sutil */}
        {tipoContacto === 'paciente' && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm">
            <UserCheck className="w-2.5 h-2.5 text-white" />
          </div>
        )}
        {citasValidas > 0 && tipoContacto !== 'paciente' && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm">
            <Calendar className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>
      
      {/* Info - diseño más limpio */}
      <div className="flex-1 min-w-0">
        {/* Row 1: Nombre + Tiempo + Indicadores */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`font-medium text-sm truncate transition-colors ${
              isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-100'
            }`}>
              {nombreContacto || telefono}
            </span>
            {/* Indicador de reciente */}
            {esReciente() && !isActive && (
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
            {/* Indicador de atención */}
            {necesitaAtencion && !isActive && (
              <span className="shrink-0" title="Requiere seguimiento">
                <Zap className="w-3 h-3 text-amber-500" />
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 tabular-nums font-medium" suppressHydrationWarning>
            {formatTimeCompact(ultimaFecha)}
          </span>
        </div>
        
        {/* Row 2: Preview del mensaje - más elegante */}
        <div className="flex items-center gap-1.5 mt-1">
          <Bot className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
          <p className="text-[13px] sm:text-[13px] truncate text-slate-500 dark:text-slate-400 leading-snug">
            {cleanPreview(ultimoMensaje)}
          </p>
        </div>
        
        {/* Row 3: Tags - más minimalistas */}
        {(estadoLead || citasValidas > 0 || tipoContacto === 'paciente') && (
          <div className="flex items-center gap-1.5 mt-2">
            {/* Mostrar badge de Paciente cuando es paciente */}
            {tipoContacto === 'paciente' && (
              <span className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                Paciente
              </span>
            )}
            
            {/* Mostrar estado del lead cuando NO es paciente */}
            {estadoLead && tipoContacto !== 'paciente' && (
              <span className={`text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                estadoLead === 'convertido' 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                  : estadoLead === 'interesado' 
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    : estadoLead === 'contactado'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
                {estadoLead}
              </span>
            )}
            
            {citasValidas > 0 && (
              <span className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {citasValidas} cita{citasValidas !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
});
