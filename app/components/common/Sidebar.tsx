'use client';

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Target, MessageCircle, Users, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { signOutAction } from "@/app/auth/actions";
import { ThemeToggle } from "./ThemeToggle";

type NavItem = { readonly label: string; readonly href: string };

const navItems: readonly NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  // { label: "Agenda", href: "/agenda" }, // Temporalmente oculta
  { label: "Conversaciones", href: "/conversaciones" },
  { label: "Leads", href: "/leads" },
  { label: "Pacientes", href: "/pacientes" },
  { label: "Consultas", href: "/consultas" },
  { label: "Confirmaciones", href: "/confirmaciones" },
  { label: "Estadísticas", href: "/estadisticas" },
  { label: "🤖 UroBot", href: "/urobot" },
];

const DATE_FORMATTER = new Intl.DateTimeFormat("es-MX", { dateStyle: "long" });

export function Sidebar() {
  const pathname = usePathname();
  const [today, setToday] = useState<string>('');
  
  // Evitar hydration mismatch: solo formatear fecha en el cliente
  useEffect(() => {
    setToday(DATE_FORMATTER.format(new Date()));
  }, []);

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

          <nav aria-label="Secciones principales" className="flex-1 overflow-y-auto pr-1">
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
                        "group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 font-medium transition-colors",
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
          </nav>
        </div>

        <footer className="space-y-3">
          <div className="flex items-center justify-between px-1">
             <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40 font-medium">Preferencia</span>
             <ThemeToggle />
          </div>

          <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/30 px-4 py-3 text-xs text-sidebar-foreground/60">
            <p className="font-medium text-sidebar-foreground">Agenda al día</p>
            <span className="mt-1 block text-sidebar-foreground/60" suppressHydrationWarning>Hoy · {today}</span>
            <p className="text-sidebar-foreground/40">Actualización automática cada 60&nbsp;min</p>
          </div>

          <form action={signOutAction} className="w-full">
            <button
              type="submit"
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-2xl border border-sidebar-border bg-sidebar px-4 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-all duration-100",
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

// Items principales para bottom nav (máximo 5 para UX óptima)
const BOTTOM_NAV_ITEMS: readonly { label: string; href: string; icon: ReactNode }[] = [
  { label: "Inicio", href: "/dashboard", icon: <Home className="w-5 h-5" /> },
  { label: "Leads", href: "/leads", icon: <Target className="w-5 h-5" /> },
  { label: "Chat", href: "/conversaciones", icon: <MessageCircle className="w-5 h-5" /> },
  { label: "Pacientes", href: "/pacientes", icon: <Users className="w-5 h-5" /> },
  { label: "Más", href: "#more", icon: <MoreHorizontal className="w-5 h-5" /> },
];

// Items secundarios (accesibles desde "Más")
const SECONDARY_NAV_ITEMS: readonly NavItem[] = [
  { label: "Consultas", href: "/consultas" },
  { label: "Confirmaciones", href: "/confirmaciones" },
  { label: "Estadísticas", href: "/estadisticas" },
  { label: "UroBot", href: "/urobot" },
];

export function BottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ✅ Prevenir hydration mismatch - renderizar solo en cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setShowMore(false);
  }, [pathname]);

  // Cerrar con Escape
  useEffect(() => {
    if (!showMore) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowMore(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showMore]);

  // Verificar si algún item secundario está activo
  const isSecondaryActive = SECONDARY_NAV_ITEMS.some(
    item => pathname === item.href || pathname?.startsWith(`${item.href}/`)
  );

  // ✅ Skeleton mientras no está montado para evitar hydration mismatch
  if (!mounted) {
    return (
      <nav
        aria-label="Navegación inferior"
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg lg:hidden"
      >
        <div className="flex items-center justify-around px-1 py-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1 px-3 py-2 min-h-[52px] min-w-[60px]">
              <div className="w-5 h-5 rounded bg-muted animate-pulse" />
              <div className="w-8 h-2 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
        <div className="h-[env(safe-area-inset-bottom)] bg-background/95" />
      </nav>
    );
  }

  return (
    <>
      {/* Menú expandido "Más" */}
      {showMore && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
            onClick={() => setShowMore(false)}
          />
          <div className="absolute bottom-[calc(64px+env(safe-area-inset-bottom))] left-2 right-2 z-50 
                          bg-card border border-border rounded-2xl shadow-2xl p-2 
                          animate-in slide-in-from-bottom-4 duration-200">
            <div className="grid grid-cols-2 gap-1">
              {SECONDARY_NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                      "active:scale-95 active:bg-muted/50 min-h-[48px]",
                      isActive
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-white"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span>{item.label}</span>
                    {isActive && <span className="ml-auto text-blue-500">•</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav
        aria-label="Navegación inferior"
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg shadow-[0_-4px_16px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.3)] lg:hidden"
      >
        <div className="flex items-center justify-around px-1 py-1">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const isMoreButton = item.href === "#more";
            const isActive = isMoreButton 
              ? (showMore || isSecondaryActive)
              : (pathname === item.href || pathname?.startsWith(`${item.href}/`));
            
            if (isMoreButton) {
              return (
                <button
                  key={item.label}
                  onClick={() => setShowMore(!showMore)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-2 min-h-[52px] min-w-[60px] transition-all duration-150",
                    "active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400",
                    isActive
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-white"
                      : "text-muted-foreground"
                  )}
                  aria-expanded={showMore}
                  aria-label="Más opciones"
                >
                  {showMore ? <span className="text-lg leading-none">✕</span> : item.icon}
                  <span className="text-[10px] font-medium">{showMore ? "Cerrar" : item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                prefetch={true}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-2 min-h-[52px] min-w-[60px] transition-all duration-150",
                  "active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400",
                  isActive 
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-white font-semibold" 
                    : "text-muted-foreground"
                )}
              >
                {item.icon}
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
        {/* ✅ Safe area para iPhones con notch */}
        <div className="h-[env(safe-area-inset-bottom)] bg-background/95" />
      </nav>
    </>
  );
}

