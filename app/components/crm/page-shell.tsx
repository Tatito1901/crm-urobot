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
    ? "relative flex w-full flex-col gap-3 px-4 py-3 pt-4 sm:gap-3 sm:px-8 sm:py-4 md:gap-3 lg:px-12 lg:py-4 xl:px-16"
    : cn(
        "relative mx-auto flex w-full flex-col gap-4 px-4 pb-20 pt-4 sm:gap-8 sm:px-8 sm:pb-24 sm:pt-10 md:gap-10 lg:px-12 lg:pt-12 lg:pb-20 xl:px-16",
        fullWidth ? "max-w-[1600px]" : "max-w-6xl"
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
        "relative transition-colors duration-300",
        "bg-background text-foreground",
        className
      )}
    >
      {accent && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] opacity-40 overflow-hidden" aria-hidden>
          <div className="absolute left-1/2 top-[-10%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-[180px] dark:bg-blue-500/40" />
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
