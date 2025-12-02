import React, { memo, useState } from 'react';
import { format } from 'date-fns';
import { Bot, User, FileText, Download, Play, Pause, MapPin, Image as ImageIcon, Film, Mic, X } from 'lucide-react';
import type { TipoMensaje } from '@/hooks/useConversaciones';

interface MessageBubbleProps {
  contenido: string;
  rol: 'usuario' | 'asistente';
  createdAt: Date;
  isConsecutive?: boolean;
  // Campos multimedia
  tipoMensaje?: TipoMensaje;
  mediaUrl?: string | null;
  mediaMimeType?: string | null;
  mediaFilename?: string | null;
  mediaCaption?: string | null;
  mediaDurationSeconds?: number | null;
}

// Componente para renderizar imágenes con lightbox
const ImageContent = memo(function ImageContent({ 
  url, 
  caption 
}: { 
  url: string; 
  caption?: string | null;
}) {
  const [showLightbox, setShowLightbox] = useState(false);
  
  return (
    <>
      <div className="relative cursor-pointer group" onClick={() => setShowLightbox(true)}>
        <img 
          src={url} 
          alt={caption || 'Imagen'} 
          className="max-w-full max-h-64 rounded-lg object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      {caption && <p className="mt-1 text-xs opacity-80">{caption}</p>}
      
      {/* Lightbox */}
      {showLightbox && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <button 
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            onClick={() => setShowLightbox(false)}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img 
            src={url} 
            alt={caption || 'Imagen'} 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </>
  );
});

// Componente para documentos (PDF, Word, etc.)
const DocumentContent = memo(function DocumentContent({ 
  url, 
  filename, 
  mimeType,
  caption 
}: { 
  url: string; 
  filename?: string | null;
  mimeType?: string | null;
  caption?: string | null;
}) {
  const isPdf = mimeType?.includes('pdf');
  const displayName = filename || 'Documento';
  const extension = filename?.split('.').pop()?.toUpperCase() || 'DOC';
  
  return (
    <div className="space-y-2">
      {/* Preview de PDF */}
      {isPdf && (
        <div className="relative rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
          <iframe 
            src={`${url}#toolbar=0&navpanes=0`}
            className="w-full h-48 border-0"
            title={displayName}
          />
        </div>
      )}
      
      {/* Info del archivo + descarga */}
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group"
      >
        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{displayName}</p>
          <p className="text-xs text-muted-foreground">{extension}</p>
        </div>
        <Download className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
      </a>
      {caption && <p className="text-xs opacity-80">{caption}</p>}
    </div>
  );
});

// Componente para audio
const AudioContent = memo(function AudioContent({ 
  url, 
  duration,
  caption 
}: { 
  url: string; 
  duration?: number | null;
  caption?: string | null;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
        <button 
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white ml-0.5" />
          )}
        </button>
        <div className="flex-1">
          <div className="h-1 bg-slate-300 dark:bg-slate-600 rounded-full">
            <div className="h-full w-0 bg-green-500 rounded-full" />
          </div>
        </div>
        {duration && (
          <span className="text-xs text-muted-foreground pr-2">
            {formatDuration(duration)}
          </span>
        )}
      </div>
      <audio 
        ref={audioRef} 
        src={url} 
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      {caption && <p className="text-xs opacity-80">{caption}</p>}
    </div>
  );
});

// Componente para video
const VideoContent = memo(function VideoContent({ 
  url, 
  caption 
}: { 
  url: string; 
  caption?: string | null;
}) {
  return (
    <div className="space-y-2">
      <video 
        src={url} 
        controls 
        className="max-w-full max-h-64 rounded-lg"
        preload="metadata"
      />
      {caption && <p className="text-xs opacity-80">{caption}</p>}
    </div>
  );
});

// Componente para ubicación
const LocationContent = memo(function LocationContent({ 
  contenido 
}: { 
  contenido: string;
}) {
  // El contenido puede ser "lat,lng" o una URL de maps
  const coords = contenido.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
  
  if (coords) {
    const [, lat, lng] = coords;
    const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    
    return (
      <a 
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group"
      >
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Ubicación compartida</p>
          <p className="text-xs text-muted-foreground truncate">{lat}, {lng}</p>
        </div>
      </a>
    );
  }
  
  return <p className="whitespace-pre-wrap break-words">{contenido}</p>;
});

export const MessageBubble = memo(function MessageBubble({
  contenido,
  rol,
  createdAt,
  isConsecutive = false,
  tipoMensaje = 'text',
  mediaUrl,
  mediaMimeType,
  mediaFilename,
  mediaCaption,
  mediaDurationSeconds,
}: MessageBubbleProps) {
  const isAsistente = rol === 'asistente';

  // Renderizar contenido según tipo
  const renderContent = () => {
    // Si hay mediaUrl, renderizar según tipo
    if (mediaUrl) {
      switch (tipoMensaje) {
        case 'image':
          return <ImageContent url={mediaUrl} caption={mediaCaption} />;
        case 'document':
          return <DocumentContent url={mediaUrl} filename={mediaFilename} mimeType={mediaMimeType} caption={mediaCaption} />;
        case 'audio':
          return <AudioContent url={mediaUrl} duration={mediaDurationSeconds} caption={mediaCaption} />;
        case 'video':
          return <VideoContent url={mediaUrl} caption={mediaCaption} />;
        case 'sticker':
          return <img src={mediaUrl} alt="Sticker" className="max-w-32 max-h-32" />;
        default:
          break;
      }
    }
    
    // Location
    if (tipoMensaje === 'location') {
      return <LocationContent contenido={contenido} />;
    }
    
    // Texto normal
    return <p className="whitespace-pre-wrap break-words">{contenido}</p>;
  };

  // Icono según tipo de mensaje
  const getTypeIcon = () => {
    switch (tipoMensaje) {
      case 'image': return <ImageIcon className="w-3 h-3" />;
      case 'document': return <FileText className="w-3 h-3" />;
      case 'audio': return <Mic className="w-3 h-3" />;
      case 'video': return <Film className="w-3 h-3" />;
      case 'location': return <MapPin className="w-3 h-3" />;
      default: return null;
    }
  };

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
          {renderContent()}
        </div>

        {/* Time + Type indicator */}
        <div className={`flex items-center gap-1 mt-1 px-1 ${isAsistente ? '' : 'flex-row-reverse'}`}>
          {tipoMensaje !== 'text' && (
            <span className="text-muted-foreground">{getTypeIcon()}</span>
          )}
          <span className="text-[10px] text-slate-400">
            {format(createdAt, 'HH:mm')}
          </span>
        </div>
      </div>
    </div>
  );
});
