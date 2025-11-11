/**
 * ============================================================
 * CALENDAR SKELETON - Loading state del calendario
 * ============================================================
 * Skeleton elegante que se muestra mientras se carga Schedule-X.
 * Mejora la percepción de rendimiento con un loading state visual.
 */

export function CalendarSkeleton() {
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-[#0d1118]">
      <div className="relative animate-pulse w-full h-[520px] sm:h-[620px] lg:h-[720px] xl:h-[780px]">
        {/* Header simulado */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex gap-3">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="h-10 w-12 rounded-lg bg-slate-800"
              />
            ))}
          </div>
        </div>

        {/* Grid simulado */}
        <div className="grid grid-cols-7 gap-px bg-slate-800 p-6">
          {[...Array(7)].map((_, colIndex) => (
            <div key={colIndex} className="space-y-2">
              {/* Header de columna */}
              <div className="h-8 rounded bg-slate-800/50" />

              {/* Eventos simulados */}
              {[...Array(3)].map((_, rowIndex) => (
                <div
                  key={rowIndex}
                  className="h-20 rounded-lg bg-gradient-to-br from-slate-800/80 to-slate-900/80"
                  style={{
                    marginTop: `${rowIndex * 10}px`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Texto de carga */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-xl border border-slate-700 bg-slate-900/90 px-6 py-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <p className="text-sm font-medium text-slate-300">
                Cargando calendario...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
