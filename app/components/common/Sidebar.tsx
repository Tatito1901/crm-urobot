'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { signOutAction } from "@/app/auth/actions";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { ThemeToggle } from "./ThemeToggle";

type NavItem = { readonly label: string; readonly href: string };

const navItems: readonly NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Agenda", href: "/agenda" },
  { label: "Leads", href: "/leads" },
  { label: "Pacientes", href: "/pacientes" },
  { label: "Consultas", href: "/consultas" },
  { label: "Confirmaciones", href: "/confirmaciones" },
  { label: "Estadísticas", href: "/estadisticas" },
];

// Subsecciones de estadísticas
interface EstadisticaSeccion {
  id: string;
  href: string;
  label: string;
  icon: string;
  color: string;
}

const estadisticasSecciones: EstadisticaSeccion[] = [
  { id: 'resumen', href: '/estadisticas', label: 'Resumen General', icon: '📊', color: 'blue' },
  { id: 'funnel', href: '/estadisticas/funnel', label: 'Funnel Conversión', icon: '📈', color: 'emerald' },
  { id: 'mensajeria', href: '/estadisticas/mensajeria', label: 'Mensajería', icon: '💬', color: 'purple' },
  { id: 'canales', href: '/estadisticas/canales', label: 'Canales Marketing', icon: '🎯', color: 'amber' },
  { id: 'consultas', href: '/estadisticas/performance', label: 'Performance', icon: '📅', color: 'cyan' },
  { id: 'leads', href: '/estadisticas/leads', label: 'Análisis Leads', icon: '👥', color: 'pink' },
  { id: 'operativo', href: '/estadisticas/realtime', label: 'Real-time', icon: '⚡', color: 'red' },
];

const DATE_FORMATTER = new Intl.DateTimeFormat("es-MX", { dateStyle: "long" });

export function Sidebar() {
  const pathname = usePathname();
  const today = useMemo(() => DATE_FORMATTER.format(new Date()), []);
  
  const isEstadisticas = pathname === '/estadisticas' || pathname?.startsWith('/estadisticas/');

  return (
    <>
      {/* Main Sidebar */}
      <aside
        className="hidden lg:flex lg:h-screen lg:flex-col lg:justify-between lg:border-r lg:border-sidebar-border lg:bg-sidebar lg:px-6 lg:py-8 lg:shadow-xl dark:lg:shadow-[0_25px_70px_-40px_rgba(10,33,94,0.75)] lg:backdrop-blur lg:w-60 xl:w-72 2xl:w-80 transition-all duration-300"
      >
        <div className="flex flex-1 flex-col gap-8 overflow-hidden">
          <header className="flex items-center gap-3 rounded-2xl border border-sidebar-border bg-sidebar-accent/50 px-4 py-3 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white dark:bg-blue-500/20 dark:text-blue-100 text-lg font-semibold shadow-md dark:shadow-none">
              DM
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.32em] text-sidebar-foreground/60">CRM Clínico</p>
              <p className="text-base font-semibold text-sidebar-foreground">Dr. Mario Martínez</p>
              <p className="text-xs text-sidebar-foreground/70">Operativo en tiempo real</p>
            </div>
          </header>

          {/* Botón de regresar cuando estás en estadísticas */}
          {isEstadisticas && (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Regresar al Dashboard</span>
            </Link>
          )}

          <nav aria-label="Secciones principales" className="flex-1 overflow-y-auto pr-1">
            {isEstadisticas ? (
              /* Subsecciones de estadísticas */
              <>
                <div className="mb-3 px-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/50 font-semibold">Categorías</p>
                </div>
                <ul className="flex flex-col gap-1.5 text-sm">
                  {estadisticasSecciones.map((seccion) => {
                    const isActive = pathname === seccion.href;
                    const colorClass = {
                      blue: 'border-blue-500/40 bg-blue-500/15 text-blue-600 dark:text-blue-300',
                      emerald: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
                      purple: 'border-purple-500/40 bg-purple-500/15 text-purple-600 dark:text-purple-300',
                      amber: 'border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-300',
                      cyan: 'border-cyan-500/40 bg-cyan-500/15 text-cyan-600 dark:text-cyan-300',
                      pink: 'border-pink-500/40 bg-pink-500/15 text-pink-600 dark:text-pink-300',
                      red: 'border-red-500/40 bg-red-500/15 text-red-600 dark:text-red-300',
                    }[seccion.color];

                    return (
                      <li key={seccion.id}>
                        <Link
                          href={seccion.href}
                          prefetch={true}
                          className={cn(
                            "w-full group flex items-center gap-2.5 rounded-xl border px-3 py-2.5 font-medium transition-all text-left",
                            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
                            isActive 
                              ? `${colorClass} shadow-sm` 
                              : "border-transparent text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                          )}
                        >
                          <span className="text-base flex-shrink-0">{seccion.icon}</span>
                          <span className="text-xs leading-tight">{seccion.label}</span>
                          {isActive && (
                            <span className="ml-auto text-xs">✓</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              /* Navegación principal normal */
              <ul className="flex flex-col gap-1.5 text-sm">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        prefetch={true}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          // ✅ Touch target optimizado desktop
                          "group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 font-medium transition-colors",
                          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
                          isActive 
                            ? "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/15 dark:text-white dark:border-white/10 shadow-sm"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        )}
                      >
                        <span className="relative flex items-center gap-2">
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full transition group-hover:opacity-70",
                              isActive ? "bg-blue-600 dark:bg-blue-400 opacity-100" : "bg-sidebar-foreground/30 opacity-0"
                            )}
                            aria-hidden
                          />
                          <span>{item.label}</span>
                        </span>
                        <span
                          className="ml-auto text-xs text-sidebar-foreground/40 transition group-hover:text-sidebar-foreground/70"
                          aria-hidden
                        >
                          →
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </nav>
        </div>

        <footer className="space-y-3">
          <div className="flex items-center justify-between px-1">
             <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40 font-medium">Preferencia</span>
             <ThemeToggle />
          </div>

          <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/30 px-4 py-3 text-xs text-sidebar-foreground/60">
            <p className="font-medium text-sidebar-foreground">Agenda al día</p>
            <p className="mt-1 text-sidebar-foreground/60">Hoy · {today}</p>
            <p className="text-sidebar-foreground/40">Actualización automática cada 60&nbsp;min</p>
          </div>

          <form action={signOutAction} className="w-full">
            <button
              type="submit"
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-xl border border-sidebar-border bg-sidebar px-4 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-all duration-100",
                "hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-200",
                "active:bg-red-100 dark:active:bg-red-500/15 active:scale-95",
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

          <p className="text-center text-xs uppercase tracking-[0.2em] text-sidebar-foreground/30">
            UROBOT · CRM
          </p>
        </footer>
      </aside>
    </>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegación inferior"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 backdrop-blur-lg shadow-[0_-4px_16px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.3)] lg:hidden"
    >
      <div className="flex items-center justify-between gap-1 px-2 py-2 sm:px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.label}
              href={item.href}
              prefetch={true}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                // ✅ Touch target optimizado: min 48px height
                "flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2.5 min-h-[48px] justify-center text-center transition-all duration-200 active:scale-95 active:bg-muted/50",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
                isActive 
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-white font-semibold shadow-sm dark:shadow-[0_0_12px_rgba(59,130,246,0.3)]" 
                  : "text-muted-foreground active:text-foreground"
              )}
            >
              <span className="text-[10px] sm:text-xs leading-tight truncate max-w-full text-center">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* ✅ Safe area para iPhones con notch */}
      <div className="h-[env(safe-area-inset-bottom)] bg-background/90" />
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
        className="lg:hidden fixed top-4 left-4 z-50 inline-flex items-center justify-center rounded-lg border border-border bg-card/80 px-4 py-3 text-sm font-medium text-foreground shadow-lg backdrop-blur transition-all duration-100 hover:bg-card active:scale-95 min-h-[44px] min-w-[44px]"
        aria-expanded={open}
        aria-label="Abrir menú principal"
      >
        <span className="sr-only">Abrir menú</span>
        <span className="flex flex-col gap-1">
          <span className="h-0.5 w-5 rounded-full bg-foreground" />
          <span className="h-0.5 w-5 rounded-full bg-foreground" />
          <span className="h-0.5 w-5 rounded-full bg-foreground" />
        </span>
      </button>

      {open ? (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            className="absolute inset-0 bg-black/20 dark:bg-black/55 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
          />
          <aside ref={swipeRef} className="relative h-full w-72 max-w-[85%] translate-x-0 bg-sidebar p-6 shadow-2xl border-r border-sidebar-border">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">CRM Clínico</p>
                <p className="text-lg font-semibold text-foreground">Dr. Mario Martínez</p>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground active:scale-95 transition-all duration-100"
                  aria-label="Cerrar menú"
                >
                  ×
                </button>
              </div>
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
                          "flex items-center justify-between rounded-xl border border-transparent px-3 py-2.5 font-medium transition-colors",
                          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
                          isActive 
                            ? "border-blue-100 bg-blue-50 text-blue-700 dark:border-white/25 dark:bg-white/12 dark:text-white"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                    "w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-base font-medium text-foreground transition-all duration-100",
                    "hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-200",
                    "active:bg-red-100 dark:active:bg-red-500/15 active:scale-95",
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
