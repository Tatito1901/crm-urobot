export default function LoadingEstadisticas() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header skeleton */}
          <div className="space-y-3">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-800" />
            <div className="h-8 w-64 animate-pulse rounded bg-slate-800" />
            <div className="h-4 w-96 animate-pulse rounded bg-slate-800" />
          </div>

          {/* Selector de periodo skeleton */}
          <div className="flex gap-2">
            <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-800" />
            <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-800" />
            <div className="h-10 w-40 animate-pulse rounded-lg bg-slate-800" />
            <div className="h-10 w-40 animate-pulse rounded-lg bg-slate-800" />
          </div>

          {/* Cards skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-slate-800/50" />
            ))}
          </div>

          {/* Gráfico grande skeleton */}
          <div className="h-80 animate-pulse rounded-xl bg-slate-800/50" />

          {/* Grid de estadísticas */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-96 animate-pulse rounded-xl bg-slate-800/50" />
            <div className="h-96 animate-pulse rounded-xl bg-slate-800/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
