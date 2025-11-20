/**
 * ============================================================
 * PAGE SHELL - Layout wrapper para páginas (SERVER COMPONENT)
 * ============================================================
 * Componente optimizado como Server Component.
 * No requiere interactividad del cliente.
 */

import { ReactNode } from "react";

import { cn } from "@/app/lib/utils";

interface PageShellProps {
  eyebrow: string;
  title: string | ReactNode;
  description?: string;
  headerSlot?: ReactNode;
  children: ReactNode;
  accent?: boolean;
  className?: string;
  compact?: boolean;
}

export function PageShell({
  eyebrow,
  title,
  description,
  headerSlot,
  children,
  accent = false,
  compact = false,
  className,
}: PageShellProps) {
  const layoutClasses = compact
    ? "relative flex w-full flex-col gap-3 px-6 py-3 sm:gap-3 sm:px-8 sm:py-4 md:gap-3 lg:px-12 lg:py-4 xl:px-16"
    : "relative mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-20 pt-6 sm:gap-8 sm:px-6 sm:pb-24 sm:pt-8 md:gap-10 lg:pt-8 lg:pb-20";

  const headerClasses = cn(
    "flex flex-col",
    compact ? "gap-2" : "gap-4",
    headerSlot ? "lg:flex-row lg:items-end lg:justify-between" : ""
  );

  const titleBlockClasses = compact ? "space-y-1" : "space-y-2";

  return (
    <div
      className={cn(
        "relative h-screen overflow-hidden bg-urobot text-white flex flex-col",
        className
      )}
    >
      {accent && (
        <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
          <div className="absolute left-1/2 top-[-10%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-500/40 blur-[180px]" />
        </div>
      )}
      <div className={cn(layoutClasses, "flex-1 min-h-0 overflow-y-auto")}>
        <header className={headerClasses}>
          <div className={titleBlockClasses}>
            <p className={cn(
              "uppercase tracking-[0.3em] text-blue-200/60",
              compact ? "text-[10px]" : "text-xs"
            )}>{eyebrow}</p>
            <h1 className={cn(
              "font-semibold text-white",
              compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
            )}>{title}</h1>
            {description && <p className={cn(
              "text-white/60",
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
