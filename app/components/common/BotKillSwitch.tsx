'use client'

import { useState } from 'react'
import { ShieldOff, ShieldCheck, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBotKillSwitch } from '@/hooks/common/useBotKillSwitch'

export function BotKillSwitch() {
  const { enabled, loading, toggling, toggle, updatedBy } = useBotKillSwitch()
  const [confirming, setConfirming] = useState(false)

  const handleClick = () => {
    if (toggling || loading) return

    // If bot is OFF (kill switch enabled) → turn it back on without confirmation
    if (enabled) {
      toggle()
      setConfirming(false)
      return
    }

    // If bot is ON → require double-click confirmation to shut it down
    if (!confirming) {
      setConfirming(true)
      // Auto-reset confirmation after 3 seconds
      setTimeout(() => setConfirming(false), 3000)
      return
    }

    toggle()
    setConfirming(false)
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 px-3.5 py-3 flex items-center gap-2">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Cargando estado del bot...</span>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={toggling}
        className={cn(
          "w-full flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all duration-200",
          "focus-visible:outline-2 focus-visible:outline-offset-2",
          "active:scale-[0.98]",
          enabled
            ? [
                "border-red-500/40 bg-red-500/20 text-red-400",
                "hover:bg-red-500/30 hover:border-red-500/50",
                "focus-visible:outline-red-400",
                "animate-pulse",
              ]
            : confirming
              ? [
                  "border-amber-500/40 bg-amber-500/20 text-amber-400",
                  "hover:bg-amber-500/30 hover:border-amber-500/50",
                  "focus-visible:outline-amber-400",
                ]
              : [
                  "border-border bg-muted/30 text-muted-foreground",
                  "hover:border-red-500/25 hover:bg-red-500/10 hover:text-red-400",
                  "focus-visible:outline-red-400",
                ]
        )}
      >
        {toggling ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : enabled ? (
          <ShieldOff className="h-3.5 w-3.5" />
        ) : (
          <ShieldCheck className="h-3.5 w-3.5" />
        )}
        {toggling
          ? 'Procesando...'
          : enabled
            ? 'Bot APAGADO — Click para reactivar'
            : confirming
              ? 'Click de nuevo para APAGAR'
              : 'Apagado de emergencia'}
      </button>

      {enabled && (
        <p className="text-center text-[10px] text-red-400/80 font-medium">
          Todos los mensajes entrantes están bloqueados
          {updatedBy && <span className="block text-red-400/60">por {updatedBy}</span>}
        </p>
      )}
    </div>
  )
}

/** Compact version for mobile bottom nav drawer */
export function BotKillSwitchCompact() {
  const { enabled, loading, toggling, toggle } = useBotKillSwitch()
  const [confirming, setConfirming] = useState(false)

  const handleClick = () => {
    if (toggling || loading) return

    if (enabled) {
      toggle()
      setConfirming(false)
      return
    }

    if (!confirming) {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 3000)
      return
    }

    toggle()
    setConfirming(false)
  }

  if (loading) return null

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={toggling}
      className={cn(
        "col-span-2 flex items-center gap-3 rounded-xl px-4 py-4 text-sm font-semibold transition-colors min-h-[52px] border",
        "active:scale-95",
        enabled
          ? "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse"
          : confirming
            ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
            : "bg-muted/50 text-red-400 hover:bg-red-500/10 border-border hover:border-red-500/20"
      )}
    >
      {toggling ? (
        <Loader2 className="h-5 w-5 animate-spin shrink-0" />
      ) : enabled ? (
        <ShieldOff className="h-5 w-5 shrink-0" />
      ) : (
        <ShieldCheck className="h-5 w-5 shrink-0" />
      )}
      <span>
        {toggling
          ? 'Procesando...'
          : enabled
            ? 'Bot APAGADO — Reactivar'
            : confirming
              ? 'Confirmar APAGADO'
              : 'Apagado de emergencia'}
      </span>
    </button>
  )
}
