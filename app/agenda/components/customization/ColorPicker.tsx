/**
 * ============================================================
 * COLOR PICKER - Selector compacto de colores
 * ============================================================
 * Versión simplificada y ligera
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useColorPreferences } from '../../hooks/useColorPreferences';

// Paleta reducida de 6 colores esenciales
const COLORS = [
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Violeta', value: '#8b5cf6' },
  { name: 'Naranja', value: '#f97316' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
];

export const ColorPicker: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { sedeColors, setSedeColor } = useColorPreferences();

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={popoverRef}>
      {/* Botón toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/40 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
        title="Cambiar colores"
      >
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2" style={{ borderColor: sedeColors.POLANCO }} />
          <span className="text-xs text-slate-300 hidden sm:inline">POL</span>
        </div>
        <div className="w-px h-3 bg-slate-600" />
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2" style={{ borderColor: sedeColors.SATELITE }} />
          <span className="text-xs text-slate-300 hidden sm:inline">SAT</span>
        </div>
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 p-4 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 w-64 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* POLANCO */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded border-2" style={{ borderColor: sedeColors.POLANCO }} />
              <span className="text-xs font-semibold text-white">POLANCO</span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {COLORS.map((color) => (
                <button
                  key={`pol-${color.value}`}
                  onClick={() => setSedeColor('POLANCO', color.value)}
                  className={`w-8 h-8 rounded border-2 transition-transform hover:scale-110 ${
                    sedeColors.POLANCO === color.value 
                      ? 'border-white ring-2 ring-white/30 scale-110' 
                      : 'border-slate-700'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* SATELITE */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded border-2" style={{ borderColor: sedeColors.SATELITE }} />
              <span className="text-xs font-semibold text-white">SATÉLITE</span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {COLORS.map((color) => (
                <button
                  key={`sat-${color.value}`}
                  onClick={() => setSedeColor('SATELITE', color.value)}
                  className={`w-8 h-8 rounded border-2 transition-transform hover:scale-110 ${
                    sedeColors.SATELITE === color.value 
                      ? 'border-white ring-2 ring-white/30 scale-110' 
                      : 'border-slate-700'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
