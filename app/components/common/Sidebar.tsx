'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/app/lib/utils";
import { signOutAction } from "@/app/auth/actions";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";

type NavItem = { readonly label: string; readonly href: string };

const navItems: readonly NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Leads", href: "/leads" },
  { label: "Pacientes", href: "/pacientes" },
  { label: "Consultas", href: "/consultas" },
  { label: "Confirmaciones", href: "/confirmaciones" },
  { label: "Métricas", href: "/metricas" },
];

const DATE_FORMATTER = new Intl.DateTimeFormat("es-MX", { dateStyle: "long" });

export function Sidebar() {
  const pathname = usePathname();
  const today = useMemo(() => DATE_FORMATTER.format(new Date()), []);

  return (
    <aside className="hidden lg:flex lg:h-screen lg:w-60 xl:w-72 2xl:w-80 lg:flex-col lg:justify-between lg:border-r lg:border-white/10 lg:bg-gradient-to-b lg:from-[#0a1429]/90 lg:via-[#060b18]/88 lg:to-[#02040a]/92 lg:px-6 lg:py-8 lg:shadow-[0_25px_70px_-40px_rgba(10,33,94,0.75)] lg:backdrop-blur">
      <div className="flex flex-1 flex-col gap-8 overflow-hidden">
        <header className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/5/40 px-4 py-3 shadow-inner">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-lg font-semibold text-blue-100">
            DM
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.32em] text-white/40">CRM Clínico</p>
            <p className="text-base font-semibold text-white">Dr. Mario Martínez Thomas</p>
            <p className="text-xs text-white/50">Operativo en tiempo real</p>
          </div>
        </header>

        <nav aria-label="Secciones principales" className="flex-1 overflow-y-auto pr-1">
          <ul className="flex flex-col gap-1.5 text-sm">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 font-medium text-white/65 transition-colors",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
                      "hover:border-white/15 hover:bg-white/5 hover:text-white",
                      isActive && "border-white/20 bg-white/12 text-white shadow-[0_15px_35px_-25px_rgba(56,189,248,0.7)]"
                    )}
                  >
                    <span className="relative flex items-center gap-2">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full bg-blue-400/70 opacity-0 transition group-hover:opacity-70",
                          isActive && "opacity-100"
                        )}
                        aria-hidden
                      />
                      <span>{item.label}</span>
                    </span>
                    <span
                      className="ml-auto text-xs text-white/40 transition group-hover:text-white/70"
                      aria-hidden
                    >
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <footer className="space-y-3">
        <div className="rounded-2xl border border-white/20 bg-white/[0.04] px-4 py-3 text-xs text-white/70">
          <p className="font-medium text-white">Agenda al día</p>
          <p className="mt-1 text-white/60">Hoy · {today}</p>
          <p className="text-white/40">Actualización automática cada 60&nbsp;min</p>
        </div>
        
        <form action={signOutAction} className="w-full">
          <button
            type="submit"
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 transition-all duration-100",
              "hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-200",
              "active:bg-red-500/15 active:scale-95",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
            )}
          >
            <svg 
              className="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              strokeWidth={2}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
              />
            </svg>
            Cerrar sesión
          </button>
        </form>

        <p className="text-center text-xs uppercase tracking-[0.2em] text-white/50">
          UROBOT · CRM
        </p>
      </footer>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegación inferior"
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-1 border-t border-white/20 bg-[#050b18]/90 px-2 py-2 text-[11px] text-white/60 backdrop-blur-md safe-bottom lg:hidden"
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-lg px-1 py-2 text-center transition-colors",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
              isActive ? "bg-white/12 text-white" : "hover:text-white"
            )}
          >
            <span className="leading-tight truncate max-w-full text-center">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Swipe-to-close gesture
  const swipeRef = useSwipeGesture(() => setOpen(false), undefined, 75);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-blue-900/30 backdrop-blur transition-all duration-100 hover:border-white/30 hover:bg-white/20 active:scale-95 min-h-[44px] min-w-[44px]"
        aria-expanded={open}
        aria-label="Abrir menú principal"
      >
        <span className="sr-only">Abrir menú</span>
        <span className="flex flex-col gap-1">
          <span className="h-0.5 w-5 rounded-full bg-white" />
          <span className="h-0.5 w-5 rounded-full bg-white" />
          <span className="h-0.5 w-5 rounded-full bg-white" />
        </span>
      </button>

      {open ? (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
          />
          <aside ref={swipeRef} className="relative h-full w-72 max-w-[85%] translate-x-0 bg-gradient-to-b from-[#0a1429]/95 via-[#060b18]/92 to-[#02040a]/96 p-6 shadow-2xl shadow-blue-900/40">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.32em] text-white/40">CRM Clínico</p>
                <p className="text-lg font-semibold text-white">Dr. Mario Martínez Thomas</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 hover:text-white active:scale-95 transition-all duration-100"
                aria-label="Cerrar menú"
              >
                ×
              </button>
            </div>

            <nav className="mt-8" aria-label="Menú móvil">
              <ul className="flex flex-col gap-2 text-base">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex items-center justify-between rounded-xl border border-transparent px-3 py-2.5 font-medium text-white/70 transition-colors",
                          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
                          "hover:border-white/15 hover:bg-white/5 hover:text-white",
                          isActive && "border-white/25 bg-white/12 text-white"
                        )}
                        onClick={() => setOpen(false)}
                      >
                        <span>{item.label}</span>
                        <span aria-hidden>→</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <form action={signOutAction} className="mt-6">
                <button
                  type="submit"
                  className={cn(
                    "w-full flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-base font-medium text-white/70 transition-all duration-100",
                    "hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-200",
                    "active:bg-red-500/15 active:scale-95",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
                  )}
                >
                  <svg 
                    className="h-5 w-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                    />
                  </svg>
                  Cerrar sesión
                </button>
              </form>
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}
