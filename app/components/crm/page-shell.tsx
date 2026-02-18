/**
 * ============================================================
 * PAGE SHELL - Layout wrapper para páginas (SERVER COMPONENT)
 * ============================================================
 * Componente optimizado como Server Component.
 * No requiere interactividad del cliente.
 */

import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageShellProps {
  eyebrow: string;
  title: string | ReactNode;
  description?: string;
  headerSlot?: ReactNode;
  children: ReactNode;
  accent?: boolean;
  className?: string;
  compact?: boolean;
  fullWidth?: boolean;
}

export function PageShell({
  eyebrow,
  title,
  description,
  headerSlot,
  children,
  accent = false,
  compact = false,
  fullWidth = false,
  className,
}: PageShellProps) {
  const layoutClasses = compact
    ? "relative flex w-full flex-col gap-2.5 px-3 py-2.5 pt-3 sm:gap-3 sm:px-6 sm:py-4 md:gap-3 lg:px-8 lg:py-4 xl:px-10"
    : cn(
        "relative mx-auto flex w-full flex-col gap-3 px-3 pb-24 pt-3 sm:gap-5 sm:px-6 sm:pb-24 sm:pt-6 md:gap-6 lg:px-8 lg:pt-10 lg:pb-20 xl:px-10",
        fullWidth ? "max-w-full" : "max-w-6xl"
      );

  const headerClasses = cn(
    "flex flex-col",
    compact ? "gap-2" : "gap-4",
    headerSlot ? "lg:flex-row lg:items-end lg:justify-between" : ""
  );

  const titleBlockClasses = compact ? "space-y-1" : "space-y-2";

  return (
    <div
      className={cn(
        "relative",
        "bg-background text-foreground",
        className
      )}
    >
      {accent && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] opacity-30 overflow-hidden" aria-hidden style={{ contain: 'strict', willChange: 'opacity' }}>
          <div className="absolute left-1/3 top-[-15%] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-teal-500/15 blur-[160px] dark:bg-teal-500/20" />
          <div className="absolute right-[10%] top-[5%] h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[120px] dark:bg-cyan-500/15" />
        </div>
      )}
      <div className={layoutClasses}>
        <header className={headerClasses}>
          <div className={titleBlockClasses}>
            <p className={cn(
              "uppercase tracking-[0.3em] font-semibold",
              "text-muted-foreground",
              compact ? "text-[10px]" : "text-xs"
            )}>{eyebrow}</p>
            <h1 className={cn(
              "font-bold tracking-tight",
              "text-foreground",
              compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
            )}>{title}</h1>
            {description && <p className={cn(
              "font-medium",
              "text-muted-foreground",
              compact ? "text-xs" : "text-sm"
            )}>{description}</p>}
          </div>
          {headerSlot && (
            <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end lg:w-auto">
              {headerSlot}
            </div>
          )}
        </header>
        {children}
      </div>
    </div>
  );
}
