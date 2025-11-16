/**
 * ============================================================
 * LOADING STATE - Agenda
 * ============================================================
 */

export default function AgendaLoading() {
  return (
    <div className="h-screen flex flex-col bg-urobot font-roboto">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar skeleton - oculto en móvil */}
        <div className="hidden lg:block w-80 border-r border-white/10 bg-white/[0.02]">
          <div className="p-6 space-y-6">
            {/* Mini calendario skeleton */}
            <div className="space-y-4">
              <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
              <div className="grid grid-cols-7 gap-2">
                {[...Array(35)].map((_, i) => (
                  <div key={i} className="h-8 bg-white/10 rounded animate-pulse" />
                ))}
              </div>
            </div>

            {/* Citas del día skeleton */}
            <div className="space-y-3">
              <div className="h-5 w-28 bg-white/10 rounded animate-pulse" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-32 bg-white/10 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Zona principal skeleton */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header skeleton */}
          <div className="border-b border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 bg-white/10 rounded animate-pulse" />
                <div className="h-6 w-48 bg-white/10 rounded animate-pulse" />
                <div className="h-8 w-8 bg-white/10 rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-24 bg-white/10 rounded animate-pulse" />
                <div className="h-8 w-24 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Calendario skeleton */}
          <div className="flex-1 p-4 overflow-auto">
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 min-h-full">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-6 bg-white/10 rounded animate-pulse" />
                  <div className="space-y-2">
                    {[...Array(8)].map((_, j) => (
                      <div key={j} className="h-16 bg-white/5 rounded animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
