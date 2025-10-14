'use client';

import { useEffect, useMemo, useState } from 'react';
import { ScheduleXCalendar } from '@schedule-x/react';
import {
  createCalendar,
  createViewDay,
  createViewWeek,
  createViewMonthGrid,
  createViewMonthAgenda,
} from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import 'temporal-polyfill/global';
import '@schedule-x/theme-default/dist/index.css';
import 'react-day-picker/dist/style.css';

import { DayPicker } from 'react-day-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { mockData, Consulta } from '@/app/lib/crm-data';

type ViewKey = 'day' | 'week';

const TZ = 'America/Mexico_City' as const;

const estadoToCalendarId = (estado: Consulta['estado']) =>
  estado.toLowerCase() as 'programada' | 'confirmada' | 'reagendada' | 'cancelada';

export default function AgendaPage() {
  const [activeView, setActiveView] = useState<ViewKey>('week');
  const [selectedDate, setSelectedDate] = useState(() => Temporal.Now.plainDateISO(TZ));

  const filteredConsultas = mockData.consultas;

  // Eventos -> Schedule-X
  const sxEvents = useMemo(() => {
    return filteredConsultas.map((consulta) => {
      const startJs = new Date(consulta.fecha);
      const start = Temporal.Instant.from(startJs.toISOString()).toZonedDateTimeISO(TZ);
      const end = start.add({ minutes: 45 });
      return {
        id: consulta.id,
        title: consulta.paciente,
        start,
        end,
        calendarId: estadoToCalendarId(consulta.estado),
        data: { consulta },
      };
    });
  }, [filteredConsultas]);

  // Servicio de eventos (plugin oficial)
  const eventsService = useState(() => createEventsServicePlugin())[0];

  // Crear/recrear la app cuando cambien view o fecha (para mantener todo en sync)
  const calendarApp = useMemo(() => {
    const views =
      activeView === 'day'
        ? [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()]
        : [createViewWeek(), createViewDay(), createViewMonthGrid(), createViewMonthAgenda()];

    return createCalendar(
      {
        locale: 'es-MX',
        timezone: TZ,
        firstDayOfWeek: 1,
        selectedDate,
        isDark: false, // base clara, como Doctoralia
        views,
        // Paleta por estado
        calendars: {
          programada: {
            colorName: 'programada',
            lightColors: { main: '#93c5fd', container: '#eaf2ff', onContainer: '#0f3a5b' },
            darkColors: { main: '#93c5fd', container: '#0f3a5b', onContainer: '#eaf2ff' },
          },
          confirmada: {
            colorName: 'confirmada',
            lightColors: { main: '#86efac', container: '#e9f9ef', onContainer: '#14532d' },
            darkColors: { main: '#86efac', container: '#123a26', onContainer: '#dcfce7' },
          },
          reagendada: {
            colorName: 'reagendada',
            lightColors: { main: '#fde68a', container: '#fff7db', onContainer: '#7c5400' },
            darkColors: { main: '#fde68a', container: '#4a3b00', onContainer: '#fff7db' },
          },
          cancelada: {
            colorName: 'cancelada',
            lightColors: { main: '#fca5a5', container: '#ffe9e9', onContainer: '#7f1d1d' },
            darkColors: { main: '#fca5a5', container: '#471717', onContainer: '#ffe9e9' },
          },
        },
        events: [],
      },
      [eventsService]
    );
  }, [eventsService, selectedDate, activeView]);

  // Cargar eventos cuando cambie el filtro
  useEffect(() => {
    eventsService.set(sxEvents);
  }, [sxEvents, eventsService]);

  // ---- Toolbar estilo Doctoralia ----
  const goToday = () => setSelectedDate(Temporal.Now.plainDateISO(TZ));
  const goPrev = () => {
    setSelectedDate((d) =>
      activeView === 'week' ? d.subtract({ days: 7 }) : d.subtract({ days: 1 })
    );
  };
  const goNext = () => {
    setSelectedDate((d) =>
      activeView === 'week' ? d.add({ days: 7 }) : d.add({ days: 1 })
    );
  };

  const rangeLabel = useMemo(() => {
    if (activeView === 'day') {
      return `${pad(d(selectedDate).day)} ${monthName(selectedDate.month)} ${selectedDate.year}`;
    }
    // Semana (lunes a domingo)
    const start = startOfWeek(selectedDate);
    const end = start.add({ days: 4 }); // L-V como en doctoralia; cambia a 6 si quieres domingo
    return `${pad(start.day)}–${pad(end.day)} ${monthName(start.month)}, ${start.year}`;
  }, [selectedDate, activeView]);

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base">Agenda visual</CardTitle>
              <CardDescription>Diseño inspirado en Doctoralia</CardDescription>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={goToday} className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50">
                Hoy
              </button>
              <div className="flex items-center">
                <button onClick={goPrev} className="rounded-l-md border px-2 py-1.5 hover:bg-slate-50">
                  ‹
                </button>
                <button onClick={goNext} className="rounded-r-md border border-l-0 px-2 py-1.5 hover:bg-slate-50">
                  ›
                </button>
              </div>
              <span className="mx-2 text-sm text-slate-600">{rangeLabel}</span>

              <div className="ml-2 flex rounded-md border">
                <button
                  onClick={() => setActiveView('day')}
                  className={`px-3 py-1.5 text-sm ${activeView === 'day' ? 'bg-slate-100 font-medium' : 'hover:bg-slate-50'}`}
                >
                  Día
                </button>
                <button
                  onClick={() => setActiveView('week')}
                  className={`border-l px-3 py-1.5 text-sm ${activeView === 'week' ? 'bg-slate-100 font-medium' : 'hover:bg-slate-50'}`}
                >
                  Semana
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="grid gap-3 lg:grid-cols-[260px_1fr]">
            {/* Sidebar mini calendario */}
            <aside className="rounded-xl border bg-white p-3">
              <DayPicker
                mode="single"
                weekStartsOn={1}
                selected={toDate(selectedDate)}
                onSelect={(d) => d && setSelectedDate(toPlainDate(d))}
                showOutsideDays
                fixedWeeks
                className="doctoralia-mini"
              />
              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-[#93c5fd]" />
                  <span>Programada</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-[#86efac]" />
                  <span>Confirmada</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-[#fde68a]" />
                  <span>Reagendada</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-[#fca5a5]" />
                  <span>Cancelada</span>
                </div>
              </div>
            </aside>

            {/* Calendario principal */}
            <div className="overflow-hidden rounded-xl border bg-white p-2">
              <div className="sx-calendar sx-theme-default doctoralia-sx">
                <ScheduleXCalendar key={activeView + selectedDate.toString()} calendarApp={calendarApp} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estilos “tipo Doctoralia” */}
      <style jsx global>{`
        /* Fondo y líneas del grid */
        .doctoralia-sx .sx__time-grid,
        .doctoralia-sx .sx__month-grid {
          background: #fff;
        }
        .doctoralia-sx .sx__time-grid .sx__column,
        .doctoralia-sx .sx__month-grid .sx__cell {
          border-color: #eef2f7 !important;
        }
        .doctoralia-sx .sx__time-grid .sx__hour-marker {
          border-color: #eef2f7 !important;
        }

        /* Header del calendario */
        .doctoralia-sx .sx__header {
          background: #fff;
          border-bottom: 1px solid #e6eef6;
        }
        .doctoralia-sx .sx__header .sx__button {
          border-color: #e6eef6;
          background: #fff;
          color: #1f2937;
        }
        .doctoralia-sx .sx__header .sx__button:hover {
          background: #f8fafc;
        }

        /* Evento */
        .doctoralia-sx .sx__event {
          border-radius: 8px !important;
          box-shadow: 0 1px 0 rgba(16, 24, 40, 0.06), 0 1px 2px rgba(16, 24, 40, 0.06);
          border: 1px solid rgba(16, 24, 40, 0.06);
        }
        .doctoralia-sx .sx__event .sx__title {
          font-weight: 600;
          letter-spacing: 0;
        }
        .doctoralia-sx .sx__event .sx__time {
          font-size: 12px;
          opacity: 0.9;
        }

        /* Mini calendario (day-picker) para parecerse a Doctoralia) */
        .doctoralia-mini .rdp {
          --rdp-accent-color: #2563eb;
          --rdp-background-color: #eff6ff;
          --rdp-accent-color-dark: #2563eb;
          --rdp-outline: 2px solid var(--rdp-accent-color);
          --rdp-outline-selected: 2px solid var(--rdp-accent-color);
        }
        .doctoralia-mini .rdp-day_selected,
        .doctoralia-mini .rdp-day_selected:focus-visible,
        .doctoralia-mini .rdp-day_selected:hover {
          background-color: #2563eb;
        }
        .doctoralia-mini .rdp-day_today {
          color: #2563eb;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}


/* ---------- Utilidades de fecha ---------- */
function d(p: Temporal.PlainDate) {
  return p;
}
function pad(n: number) {
  return n.toString().padStart(2, '0');
}
function monthName(m: number) {
  const names = [
    'enero','febrero','marzo','abril','mayo','junio',
    'julio','agosto','septiembre','octubre','noviembre','diciembre'
  ];
  return names[m - 1];
}
function startOfWeek(date: Temporal.PlainDate) {
  // Lunes como inicio de semana
  const dow = (date.dayOfWeek ?? 1) as number; // Temporal tiene dayOfWeek 1-7
  return date.subtract({ days: dow - 1 });
}
// Convertidores DayPicker <-> Temporal
function toPlainDate(d: Date): Temporal.PlainDate {
  const iso = d.toISOString();
  return Temporal.PlainDate.from(iso.split('T')[0]);
}
function toDate(p: Temporal.PlainDate): Date {
  return new Date(`${p.toString()}T00:00:00`);
}
