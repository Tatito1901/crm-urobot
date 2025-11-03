'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';

// Configuración de calendarios de Google Calendar
const CALENDARIOS = {
  UNIFICADO: {
    nombre: 'Todas las sedes',
    // URL con ambos calendarios: Polanco (color morado) + Satélite (color cyan)
    url: 'https://calendar.google.com/calendar/embed?height=600&wkst=2&ctz=America%2FMexico_City&showCalendars=1&showTabs=1&showPrint=0&showTitle=0&mode=WEEK&src=92dbbeda09a6dfba909c43d9f05553f65309adcb629f35759153e59e3e401fc0%40group.calendar.google.com&src=ecdb381f314048b2662edd2d3169899eaab6e17bbc181151998ce7ad1ac0dabf%40group.calendar.google.com&color=%239E69AF&color=%2333B679',
    color: '#60a5fa',
    icon: '📅',
  },
  POLANCO: {
    nombre: 'Polanco',
    url: 'https://calendar.google.com/calendar/embed?src=92dbbeda09a6dfba909c43d9f05553f65309adcb629f35759153e59e3e401fc0%40group.calendar.google.com&ctz=America%2FMexico_City',
    color: '#8b5cf6',
    icon: '🏢',
  },
  SATELITE: {
    nombre: 'Satélite',
    url: 'https://calendar.google.com/calendar/embed?src=ecdb381f314048b2662edd2d3169899eaab6e17bbc181151998ce7ad1ac0dabf%40group.calendar.google.com&ctz=America%2FMexico_City',
    color: '#06b6d4',
    icon: '🏬',
  },
} as const;

type SedeKey = keyof typeof CALENDARIOS;

export default function AgendaPage() {
  const [vistaActiva, setVistaActiva] = useState<SedeKey>('UNIFICADO');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto p-4 pb-24 max-w-[1800px] sm:p-6 lg:pb-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Agenda de Consultas</h1>
              <p className="text-gray-400 mt-1">Calendarios sincronizados con Google Calendar</p>
            </div>
            
            {/* Selector de vista */}
            <div className="flex flex-wrap gap-2 bg-gray-800 p-1 rounded-lg border border-gray-700 sm:flex-nowrap">
              <button
                onClick={() => setVistaActiva('UNIFICADO')}
                className={`px-3 py-2 rounded-md text-xs font-medium transition-all sm:px-4 sm:text-sm ${
                  vistaActiva === 'UNIFICADO'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {CALENDARIOS.UNIFICADO.icon} {CALENDARIOS.UNIFICADO.nombre}
              </button>
              <button
                onClick={() => setVistaActiva('POLANCO')}
                className={`px-3 py-2 rounded-md text-xs font-medium transition-all sm:px-4 sm:text-sm ${
                  vistaActiva === 'POLANCO'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {CALENDARIOS.POLANCO.icon} {CALENDARIOS.POLANCO.nombre}
              </button>
              <button
                onClick={() => setVistaActiva('SATELITE')}
                className={`px-3 py-2 rounded-md text-xs font-medium transition-all sm:px-4 sm:text-sm ${
                  vistaActiva === 'SATELITE'
                    ? 'bg-cyan-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {CALENDARIOS.SATELITE.icon} {CALENDARIOS.SATELITE.nombre}
              </button>
            </div>
          </div>
        </div>

        {/* Calendarios */}
        <CalendarioCard
          titulo={CALENDARIOS[vistaActiva].nombre}
          icon={CALENDARIOS[vistaActiva].icon}
          url={CALENDARIOS[vistaActiva].url}
          color={CALENDARIOS[vistaActiva].color}
          descripcion={
            vistaActiva === 'UNIFICADO' 
              ? 'Vista consolidada de Polanco y Satélite' 
              : 'Calendario sincronizado en tiempo real'
          }
        />
      </div>
    </div>
  );
}

/* ---------- Componente de Calendario ---------- */
interface CalendarioCardProps {
  titulo: string;
  icon: string;
  url: string;
  color: string;
  descripcion?: string;
}

function CalendarioCard({ titulo, icon, url, color, descripcion }: CalendarioCardProps) {
  return (
    <Card className="bg-gray-800 border-gray-700 overflow-hidden shadow-xl">
      <CardHeader className="pb-3" style={{ borderBottom: `3px solid ${color}` }}>
        <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <span>{titulo}</span>
        </CardTitle>
        <CardDescription className="text-gray-400 text-sm">
          {descripcion || 'Calendario sincronizado en tiempo real'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-[850px]">
          <iframe
            src={url}
            style={{ border: 0 }}
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="yes"
            className="w-full h-full"
            title={`Calendario ${titulo}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
