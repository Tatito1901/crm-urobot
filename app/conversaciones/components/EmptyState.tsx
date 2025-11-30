'use client'

import { MessageCircle } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#0b141a]">
      <div className="text-center max-w-md px-6">
        {/* Icono decorativo */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-800/50 flex items-center justify-center">
          <MessageCircle className="w-12 h-12 text-slate-500" />
        </div>

        {/* Título */}
        <h2 className="text-2xl font-light text-slate-300 mb-2">
          Urobot Web
        </h2>

        {/* Descripción */}
        <p className="text-slate-500 text-sm leading-relaxed">
          Selecciona una conversación para ver los mensajes de WhatsApp entre pacientes y el asistente Urobot.
        </p>

        {/* Indicadores */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Respuestas Urobot</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Respuestas Doctor</span>
          </div>
        </div>

        {/* Nota */}
        <p className="mt-6 text-[11px] text-slate-600 flex items-center justify-center gap-1">
          <span>🔒</span>
          <span>Mensajes cifrados de extremo a extremo</span>
        </p>
      </div>
    </div>
  )
}
