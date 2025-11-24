/**
 * ============================================================
 * SIDEBAR UNIFICADO - Calendario + Configuración
 * ============================================================
 * Sidebar limpio estilo Google Calendar con gestión de calendarios (sedes)
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, MoreVertical } from 'lucide-react';
import { MiniMonth } from './MiniMonth';
import type { Consulta } from '@/types/consultas';
import { useAgendaState } from '../../hooks/useAgendaState';
import { SEDES } from '../../lib/constants';

// Paleta de colores estilo Google Calendar
const CALENDAR_COLORS = [
  { name: 'Tomato', value: 'bg-red-500', hex: '#ef4444' },
  { name: 'Flamingo', value: 'bg-pink-500', hex: '#ec4899' },
  { name: 'Tangerine', value: 'bg-orange-500', hex: '#f97316' },
  { name: 'Banana', value: 'bg-yellow-500', hex: '#eab308' },
  { name: 'Sage', value: 'bg-emerald-500', hex: '#10b981' },
  { name: 'Basil', value: 'bg-green-600', hex: '#16a34a' },
  { name: 'Peacock', value: 'bg-cyan-500', hex: '#06b6d4' },
  { name: 'Blueberry', value: 'bg-blue-600', hex: '#2563eb' },
  { name: 'Lavender', value: 'bg-indigo-500', hex: '#6366f1' },
  { name: 'Grape', value: 'bg-purple-600', hex: '#9333ea' },
  { name: 'Graphite', value: 'bg-slate-600', hex: '#475569' },
];

interface SidebarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onCreateAppointment?: () => void;
  onAppointmentClick?: (consulta: Consulta) => void;
}

export const Sidebar = React.memo(function Sidebar({ 
  selectedDate, 
  onDateSelect,
}: SidebarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // const { consultas } = useConsultas(); // ❌ Eliminado fetch innecesario
  const { 
    visibleSedes,
    toggleSedeVisibility,
    sedeColors,
    setSedeColor
  } = useAgendaState();

  // Estado para el menú de colores (ID de sede y posición)
  const [colorMenu, setColorMenu] = useState<{sede: string, top: number, left: number} | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setColorMenu(null);
      }
    };
    // Usar capture para asegurar que se detecta antes
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, []);

  // Manejar scroll para cerrar el menú si se hace scroll
  useEffect(() => {
    const handleScroll = () => {
      if (colorMenu) setColorMenu(null);
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [colorMenu]);

  return (
    <aside className="w-[280px] h-full border-r border-border bg-sidebar flex flex-col relative z-20">
      {/* Botón Crear + Mini Calendario */}
      <div className="p-4 space-y-4 shrink-0">
        {/* Botón Crear eliminado temporalmente a petición */}
        
        <div className="pb-2 border-b border-border">
          <MiniMonth
            selectedDate={selectedDate}
            onDateSelect={onDateSelect}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />
        </div>
      </div>

      {/* Sección: Mis Calendarios (Sedes) */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
        <div className="mb-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 pl-2">Mis calendarios</h3>
          
          <div className="space-y-1">
            {SEDES.map((sede) => {
              const isVisible = visibleSedes[sede.value];
              // Colores más vibrantes estilo GCal
              const colorClass = sedeColors[sede.value] || (sede.value === 'POLANCO' ? 'bg-blue-600' : 'bg-purple-600');
              const isMenuOpen = colorMenu?.sede === sede.value;

              return (
                <div key={sede.value} className="relative group flex items-center justify-between py-2 px-2 rounded-md hover:bg-accent transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => toggleSedeVisibility(sede.value)}>
                    <div className={`
                      w-[18px] h-[18px] rounded-[4px] flex items-center justify-center border transition-all duration-200
                      ${isVisible ? `border-transparent ${colorClass} shadow-sm` : 'border-muted-foreground/50 bg-transparent hover:border-muted-foreground'}
                    `}>
                      {isVisible && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </div>
                    <span className={`text-[13px] truncate transition-colors ${isVisible ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {sede.label}
                    </span>
                  </div>

                  {/* Botón 3 puntos */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      setColorMenu(isMenuOpen ? null : {
                        sede: sede.value,
                        top: rect.top,
                        left: rect.right + 5 // Un poco a la derecha del botón
                      });
                    }}
                    className={`p-1.5 rounded-full hover:bg-accent text-muted-foreground opacity-0 group-hover:opacity-100 transition-all ${isMenuOpen ? 'opacity-100 bg-accent text-foreground' : ''}`}
                    aria-label="Opciones de color"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer minimalista */}
      <div className="p-4 border-t border-border text-[10px] text-muted-foreground text-center shrink-0">
        CRM UROBOT v1.0
      </div>

      {/* Menú de colores (Fixed Position / Portal-like) */}
      {colorMenu && (
        <div 
          ref={menuRef}
          className="fixed z-[100] bg-popover border border-border rounded-lg shadow-2xl p-3 grid grid-cols-4 gap-2 w-[180px] animate-in fade-in zoom-in-95 duration-150"
          style={{ 
            top: Math.min(colorMenu.top - 60, window.innerHeight - 200), // Evitar que se salga por abajo
            left: colorMenu.left 
          }}
        >
          {CALENDAR_COLORS.map((color) => (
            <button
              key={color.name}
              onClick={() => {
                setSedeColor(colorMenu.sede, color.value);
                setColorMenu(null);
              }}
              className={`w-6 h-6 rounded-full hover:scale-110 transition-transform border-2 ${color.value} ${
                sedeColors[colorMenu.sede] === color.value ? 'border-white scale-110' : 'border-transparent hover:border-white/30'
              }`}
              title={color.name}
            />
          ))}
        </div>
      )}
    </aside>
  );
});
