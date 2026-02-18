import React, { memo, useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { FileText, Download, Play, Pause, MapPin, Image as ImageIcon, Film, Mic, X, Eye } from 'lucide-react';
import type { TipoMensaje } from '@/types/chat';

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
        <Image 
          src={url} 
          alt={caption || 'Imagen'} 
          width={400}
          height={256}
          className="max-w-full max-h-64 rounded-lg object-cover"
          loading="lazy"
          unoptimized
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
            className="absolute top-4 right-4 z-10 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            onClick={() => setShowLightbox(false)}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="relative w-full h-full max-w-4xl max-h-[90vh]">
            <Image 
              src={url} 
              alt={caption || 'Imagen'} 
              fill
              className="object-contain"
              unoptimized
            />
          </div>
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
  const [iframeError, setIframeError] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  
  const isPdf = mimeType?.includes('pdf') || filename?.toLowerCase().endsWith('.pdf') || url?.toLowerCase().includes('.pdf');
  const displayName = filename || 'Documento';
  const extension = filename?.split('.').pop()?.toUpperCase() || (isPdf ? 'PDF' : 'DOC');
  
  // Obtener color según tipo de documento
  const getDocStyles = () => {
    if (isPdf) return { bg: 'bg-red-500/10', text: 'text-red-500', accent: 'bg-red-500' };
    if (extension === 'DOC' || extension === 'DOCX') return { bg: 'bg-blue-500/10', text: 'text-blue-500', accent: 'bg-blue-500' };
    if (extension === 'XLS' || extension === 'XLSX') return { bg: 'bg-green-500/10', text: 'text-green-500', accent: 'bg-green-500' };
    return { bg: 'bg-slate-500/10', text: 'text-slate-500', accent: 'bg-slate-500' };
  };
  
  const styles = getDocStyles();
  
  return (
    <div className="space-y-2">
      {/* Card de documento con preview para PDFs */}
      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
        {/* Header con info del archivo */}
        <div className="flex items-center gap-3 p-3">
          <div className={`w-12 h-12 rounded-lg ${styles.bg} flex items-center justify-center shrink-0`}>
            <FileText className={`w-6 h-6 ${styles.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-foreground">{displayName}</p>
            <p className="text-xs text-muted-foreground">{extension} • Toca para abrir</p>
          </div>
        </div>
        
        {/* Preview de PDF (si está habilitado) */}
        {isPdf && showPdfViewer && !iframeError && (
          <div className="relative border-t border-slate-200 dark:border-slate-700">
            <iframe 
              src={`${url}#toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full h-64 border-0 bg-slate-100 dark:bg-slate-900"
              title={displayName}
              onError={() => setIframeError(true)}
            />
            <button
              onClick={() => setShowPdfViewer(false)}
              className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
        
        {/* Botones de acción */}
        <div className="flex border-t border-slate-200 dark:border-slate-700">
          {isPdf && !showPdfViewer && (
            <button
              onClick={() => setShowPdfViewer(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors border-r border-slate-200 dark:border-slate-700"
            >
              <Eye className="w-4 h-4" />
              Vista previa
            </button>
          )}
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <Download className="w-4 h-4" />
            {isPdf ? 'Abrir PDF' : 'Descargar'}
          </a>
        </div>
      </div>
      
      {caption && <p className="text-xs opacity-80 mt-1">{caption}</p>}
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

// Componente para renderizar texto con formato básico (negritas, cursivas, saltos, listas)
const RichText = memo(function RichText({ content, className, isBot }: { content: string; className?: string; isBot?: boolean }) {
  // Función para parsear markdown básico con mejor soporte
  const parseMarkdown = (text: string) => {
    if (!text) return null;

    // 1. Dividir por saltos de línea para manejar párrafos
    const lines = text.split('\n');
    let inList = false;
    const elements: React.ReactNode[] = [];

    lines.forEach((line, i) => {
      // Detectar si es item de lista
      const listMatch = line.match(/^(\d+\.\s*|[-•]\s*)(.*)/);
      
      if (listMatch) {
        if (!inList) {
          inList = true;
        }
        const [, bullet, content] = listMatch;
        elements.push(
          <div key={i} className="flex gap-2 py-0.5">
            <span className={`shrink-0 ${isBot ? 'text-slate-500' : 'text-white/70'}`}>{bullet.trim()}</span>
            <span>{parseInlineFormatting(content)}</span>
          </div>
        );
      } else {
        inList = false;
        // Línea normal
        if (line.trim() === '') {
          elements.push(<div key={i} className="h-2" />);
        } else {
          elements.push(
            <React.Fragment key={i}>
              {parseInlineFormatting(line)}
              {i < lines.length - 1 && !lines[i + 1]?.match(/^(\d+\.\s*|[-•]\s*)/) && <br />}
            </React.Fragment>
          );
        }
      }
    });

    return elements;
  };

  // Parsear formato inline (negritas, cursivas)
  const parseInlineFormatting = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    
    return parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={j} className={`font-semibold ${isBot ? 'text-slate-900 dark:text-white' : ''}`}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={j} className="italic">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <div className={`whitespace-pre-wrap break-words leading-relaxed ${className}`}>
      {parseMarkdown(content)}
    </div>
  );
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
    if (mediaUrl) {
      const mediaComponent = (() => {
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
            return <Image src={mediaUrl} alt="Sticker" width={128} height={128} className="max-w-32 max-h-32" unoptimized />;
          default:
            return <DocumentContent url={mediaUrl} filename={mediaFilename} mimeType={mediaMimeType} caption={mediaCaption} />;
        }
      })();
      
      const textoAdicional = contenido && 
        contenido !== '[Archivo adjunto]' && 
        contenido !== mediaCaption &&
        !contenido.startsWith('undefined');
      
      return (
        <div className="space-y-2">
          {mediaComponent}
          {textoAdicional && (
            <RichText content={contenido} className="text-[15px]" isBot={isAsistente} />
          )}
        </div>
      );
    }
    
    if (tipoMensaje === 'location') {
      return <LocationContent contenido={contenido} />;
    }
    
    return <RichText content={contenido} className="text-sm sm:text-[15px]" isBot={isAsistente} />;
  };

  return (
    <div className={`cv-auto-message flex w-full ${isAsistente ? 'justify-start' : 'justify-end'} ${isConsecutive ? '-mt-1.5 sm:-mt-2' : ''}`}>
      <div className={`flex flex-col max-w-[88%] sm:max-w-[75%] lg:max-w-[65%] ${isAsistente ? 'items-start' : 'items-end'}`}>
        
        {/* Bubble - estilo minimalista y elegante */}
        <div className={`
          relative transition-all duration-200
          ${isAsistente 
            ? `bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200
               rounded-2xl rounded-tl-sm shadow-sm border border-slate-100 dark:border-slate-700/50` 
            : `bg-gradient-to-br from-blue-500 to-blue-600 text-white
               rounded-2xl rounded-tr-sm shadow-md shadow-blue-500/20`}
        `}>
          {/* Contenido principal */}
          <div className="px-3 sm:px-4 pt-2.5 sm:pt-3 pb-1">
            {renderContent()}
          </div>
          
          {/* Footer con hora - más elegante */}
          <div className={`flex items-center justify-end gap-1 sm:gap-1.5 px-3 sm:px-3.5 pb-2 sm:pb-2.5 ${isAsistente ? 'text-slate-400' : 'text-white/60'}`}>
            {tipoMensaje !== 'text' && (
              <>
                {tipoMensaje === 'image' && <ImageIcon className="w-3 h-3" />}
                {tipoMensaje === 'document' && <FileText className="w-3 h-3" />}
                {tipoMensaje === 'audio' && <Mic className="w-3 h-3" />}
                {tipoMensaje === 'video' && <Film className="w-3 h-3" />}
                {tipoMensaje === 'location' && <MapPin className="w-3 h-3" />}
              </>
            )}
            <span className="text-[10px] font-medium tracking-wide">
              {format(createdAt, 'HH:mm')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
