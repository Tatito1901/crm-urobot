import React, { memo } from 'react';
import { format } from 'date-fns';
import { Bot, User } from 'lucide-react';

interface MessageBubbleProps {
  contenido: string;
  rol: 'usuario' | 'asistente';
  createdAt: Date;
  isConsecutive?: boolean;
}

export const MessageBubble = memo(function MessageBubble({
  contenido,
  rol,
  createdAt,
  isConsecutive = false
}: MessageBubbleProps) {
  const isAsistente = rol === 'asistente';

  return (
    <div className={`flex w-full ${isAsistente ? 'justify-start' : 'justify-end'} ${isConsecutive ? 'mt-1' : 'mt-4'}`}>
      <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isAsistente ? 'items-start' : 'items-end'}`}>
        
        {/* Bubble */}
        <div className={`
          relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
          ${isAsistente 
            ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none' 
            : 'bg-blue-600 text-white rounded-tr-none border border-blue-600'}
        `}>
          {/* Icono flotante para el primer mensaje de la serie */}
          {!isConsecutive && (
            <div className={`
              absolute -top-2.5 w-5 h-5 rounded-full flex items-center justify-center border text-xs
              ${isAsistente 
                ? '-left-2 bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300' 
                : '-right-2 bg-blue-500 border-blue-400 text-white'}
            `}>
              {isAsistente ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
            </div>
          )}

          <p className="whitespace-pre-wrap break-words">{contenido}</p>
        </div>

        {/* Time */}
        <span className={`
          text-[10px] mt-1 px-1
          ${isAsistente ? 'text-slate-400' : 'text-slate-400 text-right'}
        `}>
          {format(createdAt, 'HH:mm')}
        </span>
      </div>
    </div>
  );
});
