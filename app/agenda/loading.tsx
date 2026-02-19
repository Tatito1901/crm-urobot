/**
 * ✅ STREAMING: Loading state para /agenda
 * Next.js muestra esto inmediatamente mientras carga el componente pesado
 */
export default function AgendaLoading() {
  return (
    <div className="flex h-full bg-background">
      {/* Sidebar skeleton */}
      <div className="hidden lg:block w-72 border-r border-border bg-card animate-pulse">
        <div className="p-4 space-y-4">
          <div className="h-8 bg-muted rounded" />
          <div className="h-48 bg-muted rounded" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
      
      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-border bg-card animate-pulse">
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-muted rounded" />
              <div className="h-6 w-32 bg-muted rounded" />
            </div>
            <div className="flex items-center gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 w-20 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
        
        {/* Calendar grid skeleton */}
        <div className="flex-1 p-4 animate-pulse">
          <div className="grid grid-cols-7 gap-2 h-full">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="bg-muted/50 rounded h-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
