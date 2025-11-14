/**
 * ============================================================
 * AGENDA PAGE - Vista de calendario tipo Google Calendar
 * ============================================================
 * Diseño limpio y minimalista con navegación semanal
 */

'use client';

import React, { useState, useCallback } from 'react';
import { startOfWeek } from '@/lib/date-utils';
import { Sidebar } from './components/calendar/Sidebar';
import { HeaderBar } from './components/calendar/HeaderBar';
import { DaysHeader } from './components/calendar/DaysHeader';
import { TimeGrid } from './components/calendar/TimeGrid';

export default function AgendaPage() {
  // Estado: fecha seleccionada (default: hoy)
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Estado: inicio de la semana actual
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date())
  );

  // Cuando se selecciona una fecha en el mini-calendario, ir a esa semana
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setCurrentWeekStart(startOfWeek(date));
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#0b0f16] font-roboto">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar fijo */}
        <Sidebar selectedDate={selectedDate} onDateSelect={handleDateSelect} />

        {/* Zona principal */}
        <div className="flex-1 flex flex-col">
          {/* Header de navegación */}
          <HeaderBar currentWeekStart={currentWeekStart} onWeekChange={setCurrentWeekStart} />

          {/* Área del calendario */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header de días (sticky) */}
            <DaysHeader weekStart={currentWeekStart} />

            {/* Grid de tiempo (scrollable) */}
            <TimeGrid weekStart={currentWeekStart} startHour={11} endHour={21} />
          </div>
        </div>
      </div>
    </div>
  );
}
