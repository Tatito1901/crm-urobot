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
  title: string;
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
    ? "relative mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-10 pt-6 sm:gap-5 sm:px-6 sm:pb-12 sm:pt-6 md:gap-5 lg:px-6 lg:pt-8 lg:pb-10"
    : "relative mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-20 pt-6 sm:gap-8 sm:px-6 sm:pb-24 sm:pt-8 md:gap-10 lg:pt-8 lg:pb-20";

  const headerClasses = cn(
    "flex flex-col",
    compact ? "gap-3" : "gap-4",
    headerSlot ? "lg:flex-row lg:items-end lg:justify-between" : ""
  );

  const titleBlockClasses = compact ? "space-y-1.5" : "space-y-2";

  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden bg-urobot text-white",
        className
      )}
    >
      {accent && (
        <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
          <div className="absolute left-1/2 top-[-10%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-500/40 blur-[180px]" />
        </div>
      )}
      <div className={layoutClasses}>
        <header className={headerClasses}>
          <div className={titleBlockClasses}>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-200/60">{eyebrow}</p>
            <h1 className="text-2xl font-semibold text-white sm:text-3xl">{title}</h1>
            {description && <p className="text-sm text-white/60">{description}</p>}
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
