/**
 * Loading state para /conversaciones
 * Actúa como Suspense fallback automático
 */

export default function ConversacionesLoading() {
  return (
    <div className="h-[calc(100dvh-4rem)] lg:min-h-full flex bg-background overflow-hidden">
      {/* Sidebar skeleton */}
      <aside className="w-full sm:w-[320px] lg:w-[380px] border-r border-border flex flex-col shrink-0">
        <div className="px-4 py-3 border-b border-border">
          <div className="h-5 w-24 bg-muted rounded animate-pulse" />
          <div className="h-3 w-32 bg-muted rounded animate-pulse mt-2" />
        </div>
        <div className="px-3 py-2 space-y-2">
          <div className="h-9 bg-muted rounded-lg animate-pulse" />
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-7 w-16 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-2 space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="w-12 h-12 rounded-2xl bg-muted shrink-0 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded-lg w-3/4 animate-pulse" />
                <div className="h-3 bg-muted rounded-lg w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat area skeleton (desktop only) */}
      <main className="hidden sm:flex flex-1 items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-muted mx-auto animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded mx-auto animate-pulse" />
          <div className="h-3 w-36 bg-muted rounded mx-auto animate-pulse" />
        </div>
      </main>
    </div>
  );
}
