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
        
        {/* Etiqueta de remitente (solo primer mensaje de serie) */}
        {!isConsecutive && (
          <div className={`flex items-center gap-1 mb-1 px-1 ${isAsistente ? '' : 'flex-row-reverse'}`}>
            <div className={`
              w-4 h-4 rounded-full flex items-center justify-center
              ${isAsistente 
                ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white' 
                : 'bg-blue-500 text-white'}
            `}>
              {isAsistente ? <Bot className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
            </div>
            <span className={`text-[10px] font-semibold ${isAsistente ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600'}`}>
              {isAsistente ? 'UroBot' : 'Paciente'}
            </span>
          </div>
        )}
        
        {/* Bubble */}
        <div className={`
          relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
          ${isAsistente 
            ? 'bg-white dark:bg-slate-800 border-l-4 border-l-purple-500 border border-slate-200 dark:border-slate-700 text-foreground rounded-tl-sm' 
            : 'bg-blue-600 text-white rounded-tr-none border border-blue-600'}
        `}>
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
