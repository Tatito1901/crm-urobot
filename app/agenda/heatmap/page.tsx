/**
 * ============================================================
 * HEATMAP PAGE - Vista dedicada de análisis de ocupación
 * ============================================================
 * Ruta: /agenda/heatmap
 * Muestra el mapa de calor y análisis predictivo.
 */

'use client';

import React, { useState } from 'react';
import { startOfWeek } from '@/lib/date-utils';
import { useAgendaState } from '../hooks/useAgendaState';
import { Sidebar } from '../components/calendar/Sidebar';
import { HeaderBar } from '../components/calendar/HeaderBar';
import { HeatmapView } from '../components/calendar/HeatmapView';
import { useRouter } from 'next/navigation';

export default function HeatmapPage() {
  const router = useRouter();
  const { isSidebarOpen, setIsSidebarOpen } = useAgendaState();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date()));

  // Handlers simplificados para mantener la consistencia de la UI
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCurrentWeekStart(startOfWeek(date));
    // Opcional: Redirigir a la agenda al seleccionar una fecha
    // router.push('/agenda');
  };

  return (
    <div className="h-screen flex flex-col bg-[#050b18]">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar unificado - Desktop */}
        <div className="hidden lg:flex lg:flex-shrink-0 z-30 relative">
          <Sidebar 
            selectedDate={selectedDate} 
            onDateSelect={handleDateSelect}
            onCreateAppointment={() => router.push('/agenda')} // Redirigir a agenda para crear
            onAppointmentClick={() => {}}
          />
        </div>

        {/* Sidebar unificado - Mobile Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-[150] lg:hidden flex">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />
            <div className="relative w-[85%] max-w-[340px] h-full shadow-2xl animate-in slide-in-from-left duration-300">
              <Sidebar 
                selectedDate={selectedDate} 
                onDateSelect={(date) => {
                  handleDateSelect(date);
                  setIsSidebarOpen(false);
                }}
                onCreateAppointment={() => {
                  setIsSidebarOpen(false);
                  router.push('/agenda');
                }}
                onAppointmentClick={() => {}}
              />
            </div>
          </div>
        )}

        {/* Zona principal */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header de navegación */}
          <HeaderBar
            currentWeekStart={currentWeekStart}
            onWeekChange={setCurrentWeekStart}
            totalAppointments={0} 
            pendingConfirmation={0}
            todayAppointments={0}
          />

          {/* Área principal */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <HeatmapView monthsToShow={12} />
          </div>
        </div>
      </div>
    </div>
  );
}
