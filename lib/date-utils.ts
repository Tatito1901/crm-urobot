/**
 * ============================================================
 * UTILIDADES DE FECHAS - Sin dependencias externas
 * ============================================================
 * Funciones puras para manejo de fechas usando Date nativo
 */

/**
 * Obtiene el inicio de la semana (lunes) para una fecha dada
 */
export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Lunes como primer día
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Agrega días a una fecha
 */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Agrega semanas a una fecha
 */
export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

/**
 * Agrega meses a una fecha
 */
export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * Verifica si dos fechas son el mismo día
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Verifica si una fecha es hoy
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Formatea el rango de la semana en español (México)
 * Ejemplo: "10 - 16 noviembre, 2025"
 */
export function formatWeekRangeMX(startDate: Date): string {
  const endDate = addDays(startDate, 6);
  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const month = monthNames[endDate.getMonth()];
  const year = endDate.getFullYear();

  if (startDate.getMonth() === endDate.getMonth()) {
    return `${startDay} - ${endDay} ${month}, ${year}`;
  } else {
    const startMonth = monthNames[startDate.getMonth()];
    return `${startDay} ${startMonth} - ${endDay} ${month}, ${year}`;
  }
}

/**
 * Obtiene la matriz del mes (6 semanas x 7 días)
 */
export function getMonthMatrix(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1);
  const startDate = startOfWeek(firstDay);

  const matrix: Date[][] = [];
  let currentDate = new Date(startDate);

  for (let week = 0; week < 6; week++) {
    const weekDays: Date[] = [];
    for (let day = 0; day < 7; day++) {
      weekDays.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
    matrix.push(weekDays);
  }

  return matrix;
}

/**
 * Formatea fecha a ISO (YYYY-MM-DD)
 */
export function formatISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Obtiene el nombre del mes en español
 */
export function getMonthName(month: number): string {
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return monthNames[month];
}

/**
 * Obtiene el nombre del día en español (abreviado)
 */
export function getDayName(day: number, short = false): string {
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const dayNamesFull = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return short ? dayNames[day] : dayNamesFull[day];
}

/**
 * Genera slots de tiempo cada hora completa
 */
export function generateTimeSlots(startHour: number, endHour: number): string[] {
  const slots: string[] = [];

  for (let hour = startHour; hour < endHour; hour++) {
    const hourStr = String(hour).padStart(2, '0');
    slots.push(`${hourStr}:00`);
  }

  return slots;
}
