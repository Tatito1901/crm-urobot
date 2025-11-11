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
}

export function PageShell({
  eyebrow,
  title,
  description,
  headerSlot,
  children,
  accent = false,
  className,
}: PageShellProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#101c3b,_#02040a_70%)] text-white",
        className
      )}
    >
      {accent && (
        <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
          <div className="absolute left-1/2 top-[-10%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-500/40 blur-[180px]" />
        </div>
      )}
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 pb-20 pt-6 sm:gap-8 sm:px-6 sm:pb-24 sm:pt-8 md:gap-10 md:pt-10 lg:pb-20">
        <header
          className={cn(
            "flex flex-col gap-4",
            headerSlot ? "lg:flex-row lg:items-end lg:justify-between" : ""
          )}
        >
          <div className="space-y-2">
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
