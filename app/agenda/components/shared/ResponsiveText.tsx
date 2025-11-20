/**
 * ============================================================
 * RESPONSIVE TEXT - Texto que se escala dinámicamente
 * ============================================================
 * Ajusta el tamaño de fuente según el espacio disponible
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ResponsiveTextProps {
  text: string;
  maxLines?: 1 | 2 | 3;
  minSize?: number;
  maxSize?: number;
  className?: string;
  priority?: 'readability' | 'fit'; // readability = mantener tamaño, fit = ajustar siempre
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  text,
  maxLines = 1,
  minSize = 10,
  maxSize = 14,
  className = '',
  priority = 'fit',
}) => {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [fontSize, setFontSize] = useState(maxSize);

  useEffect(() => {
    if (!textRef.current || priority === 'readability') return;

    const adjustFontSize = () => {
      const element = textRef.current;
      if (!element) return;

      const container = element.parentElement;
      if (!container) return;

      let currentSize = maxSize;
      element.style.fontSize = `${currentSize}px`;

      // Reducir tamaño hasta que quepa
      while (
        (element.scrollHeight > container.clientHeight || 
         element.scrollWidth > container.clientWidth) &&
        currentSize > minSize
      ) {
        currentSize -= 0.5;
        element.style.fontSize = `${currentSize}px`;
      }

      setFontSize(currentSize);
    };

    // Ajustar al montar y cuando cambie el texto
    adjustFontSize();
    
    // Re-ajustar en resize
    const resizeObserver = new ResizeObserver(adjustFontSize);
    if (textRef.current.parentElement) {
      resizeObserver.observe(textRef.current.parentElement);
    }

    return () => resizeObserver.disconnect();
  }, [text, maxSize, minSize, priority, maxLines]);

  const lineClampClass = maxLines === 1 ? 'line-clamp-1' : maxLines === 2 ? 'line-clamp-2' : 'line-clamp-3';

  return (
    <p
      ref={textRef}
      className={`${lineClampClass} ${className}`}
      style={{ fontSize: priority === 'readability' ? undefined : `${fontSize}px` }}
      title={text} // Tooltip nativo como fallback
    >
      {text}
    </p>
  );
};
