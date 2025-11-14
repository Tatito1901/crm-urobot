/**
 * ============================================================
 * MINI MONTH - Mini calendario para sidebar
 * ============================================================
 * Grid 7x6 con navegación de mes y selección de día
 */

'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthMatrix, getMonthName, isSameDay, isToday, addMonths } from '@/lib/date-utils';

interface MiniMonthProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export const MiniMonth = React.memo(function MiniMonth({ selectedDate, onDateSelect, currentMonth, onMonthChange }: MiniMonthProps) {
  const matrix = getMonthMatrix(currentMonth.getFullYear(), currentMonth.getMonth());
  const dayAbbreviations = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  const handlePrevMonth = () => {
    onMonthChange(addMonths(currentMonth, -1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  return (
    <div className="px-4 py-3">
      {/* Header con navegación */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="rounded p-1 hover:bg-slate-800/60 transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4 text-slate-300" />
        </button>

        <span className="text-sm font-bold text-slate-100">
          {getMonthName(currentMonth.getMonth())} {currentMonth.getFullYear()}
        </span>

        <button
          onClick={handleNextMonth}
          className="rounded p-1 hover:bg-slate-800/60 transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {dayAbbreviations.map((day, index) => (
          <div key={index} className="text-center text-xs font-medium text-slate-400">
            {day}
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-7 gap-1">
        {matrix.map((week, weekIndex) =>
          week.map((date, dayIndex) => {
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            const isCurrentDay = isToday(date);
            const isSelected = isSameDay(date, selectedDate);

            return (
              <button
                key={`${weekIndex}-${dayIndex}`}
                onClick={() => onDateSelect(date)}
                className={`
                  aspect-square flex items-center justify-center rounded-full text-xs transition-colors
                  ${!isCurrentMonth ? 'text-slate-600' : 'text-slate-200'}
                  ${isCurrentDay ? 'bg-emerald-500 text-white font-bold' : ''}
                  ${isSelected && !isCurrentDay ? 'bg-slate-700' : ''}
                  ${!isCurrentDay && !isSelected ? 'hover:bg-slate-800/60' : ''}
                `}
                aria-current={isCurrentDay ? 'date' : undefined}
              >
                {date.getDate()}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
});
