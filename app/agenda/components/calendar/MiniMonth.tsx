/**
 * ============================================================
 * MINI MONTH - Mini calendario para sidebar
 * ============================================================
 * Grid 7x6 con navegación de mes y selección de día
 */

'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthMatrix, getMonthName, getDayName, isSameDay, isToday, addMonths } from '@/lib/date-utils';

interface MiniMonthProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function MiniMonth({ selectedDate, onDateSelect, currentMonth, onMonthChange }: MiniMonthProps) {
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
          className="rounded p-1 hover:bg-gray-100 transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>

        <span className="text-sm font-bold text-gray-900">
          {getMonthName(currentMonth.getMonth())} {currentMonth.getFullYear()}
        </span>

        <button
          onClick={handleNextMonth}
          className="rounded p-1 hover:bg-gray-100 transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {dayAbbreviations.map((day, index) => (
          <div key={index} className="text-center text-xs font-medium text-gray-500">
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
                  ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-900'}
                  ${isCurrentDay ? 'bg-[#2E7D32] text-white font-bold' : ''}
                  ${isSelected && !isCurrentDay ? 'bg-gray-200' : ''}
                  ${!isCurrentDay && !isSelected ? 'hover:bg-gray-100' : ''}
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
}
