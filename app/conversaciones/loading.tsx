/**
 * Loading state para /conversaciones
 * Actúa como Suspense fallback automático
 */

export default function ConversacionesLoading() {
  return (
    <div className="h-[calc(100dvh-4rem)] lg:min-h-full flex bg-background overflow-hidden">
      {/* Sidebar skeleton */}
      <aside className="w-full sm:w-[300px] md:w-[340px] lg:w-[380px] border-r border-border flex flex-col shrink-0 bg-card">
        <div className="px-5 py-4 border-b border-border">
          <div className="h-4 w-28 bg-muted rounded animate-pulse" />
          <div className="h-3 w-20 bg-muted rounded animate-pulse mt-2" />
        </div>
        <div className="px-4 pt-3 pb-2 space-y-3">
          <div className="h-9 bg-muted/60 rounded-lg animate-pulse" />
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-7 w-16 bg-muted rounded-full animate-pulse" />
            ))}
          </div>
        </div>
        <div className="flex-1 px-4 py-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-2 py-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat area skeleton (desktop only) */}
      <main className="hidden sm:flex flex-1 items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-muted mx-auto animate-pulse" />
          <div className="h-4 w-44 bg-muted rounded mx-auto animate-pulse" />
          <div className="h-3 w-32 bg-muted rounded mx-auto animate-pulse" />
        </div>
      </main>
    </div>
  );
}
