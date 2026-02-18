'use client';

import { useEffect, useState, type ReactNode, type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Target,
  MessageCircle,
  MoreHorizontal,
  Calendar,
  BarChart3,
  Bot,
  Stethoscope,
  X,
  type LucideProps,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { signOutAction } from "@/app/auth/actions";
import { ThemeToggle } from "./ThemeToggle";

type NavItem = {
  readonly label: string;
  readonly href: string;
  readonly icon: ComponentType<LucideProps>;
};

type NavSection = {
  readonly title: string;
  readonly items: readonly NavItem[];
};

const NAV_SECTIONS: readonly NavSection[] = [
  {
    title: "Operación",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: Home },
      { label: "Leads", href: "/leads", icon: Target },
      { label: "Conversaciones", href: "/conversaciones", icon: MessageCircle },
      { label: "Consultas", href: "/consultas", icon: Stethoscope },
    ],
  },
  {
    title: "Inteligencia",
    items: [
      { label: "Estadísticas", href: "/estadisticas", icon: BarChart3 },
      { label: "UroBot", href: "/urobot", icon: Bot },
    ],
  },
];

const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);

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
      {/* Main Sidebar — Glass Morphism Premium */}
      <aside
        className="hidden lg:flex lg:h-screen lg:flex-col lg:justify-between lg:border-r lg:border-border lg:bg-sidebar lg:px-5 lg:py-6 lg:w-60 xl:w-72 2xl:w-80 transition-all duration-300 relative overflow-hidden"
      >
        <div className="relative flex flex-1 flex-col gap-6 overflow-hidden">
          {/* Brand Header */}
          <header className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/15">
              <Bot className="h-5 w-5 text-teal-400" aria-hidden />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">CRM Clínico</p>
              <p className="text-sm font-bold text-sidebar-foreground font-jakarta tracking-tight">Urobot</p>
            </div>
          </header>

          {/* Navigation */}
          <nav aria-label="Secciones principales" className="flex-1 overflow-y-auto pr-1 scrollbar-hide space-y-5">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title}>
                <p className="mb-2 px-3 text-xs uppercase tracking-widest text-muted-foreground font-semibold">{section.title}</p>
                <ul className="flex flex-col gap-0.5 text-[13px]">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                    const Icon = item.icon;
                    return (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          prefetch={true}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "group flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-medium transition-all duration-150",
                            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400",
                            isActive 
                              ? "bg-muted text-foreground border border-border shadow-sm"
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-colors duration-200",
                              isActive ? "text-teal-400" : "text-muted-foreground group-hover:text-foreground"
                            )}
                            aria-hidden
                          />
                          <span className="flex-1">{item.label}</span>
                          {isActive && (
                            <span className="h-4 w-0.5 rounded-full bg-teal-400/60" aria-hidden />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <footer className="relative space-y-3">
          <div className="flex items-center justify-between px-1">
             <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Tema</span>
             <ThemeToggle />
          </div>

          <div className="rounded-xl border border-border bg-muted/30 px-3.5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
              <p className="font-semibold text-sidebar-foreground text-xs">Agenda al día</p>
            </div>
            <span className="mt-1.5 block text-xs text-muted-foreground" suppressHydrationWarning>{today}</span>
          </div>

          <form action={signOutAction} className="w-full">
            <button
              type="submit"
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-xs font-medium text-muted-foreground transition-all duration-150",
                "hover:border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-300",
                "active:bg-rose-500/10 active:scale-[0.98]",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
              )}
            >
              <svg
                className="h-3.5 w-3.5"
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

          <p className="text-center text-xs uppercase tracking-widest text-muted-foreground/50 font-medium">
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
  { label: "Consultas", href: "/consultas", icon: <Stethoscope className="w-5 h-5" /> },
  { label: "Más", href: "#more", icon: <MoreHorizontal className="w-5 h-5" /> },
];

// Items secundarios (accesibles desde "Más") — consistentes con sidebar "Inteligencia"
const SECONDARY_NAV_ITEMS: readonly { label: string; href: string; icon: ComponentType<LucideProps> }[] = [
  { label: "Estadísticas", href: "/estadisticas", icon: BarChart3 },
  { label: "UroBot", href: "/urobot", icon: Bot },
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
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                      "active:scale-95 active:bg-muted/50 min-h-[48px]",
                      isActive
                        ? "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                    {isActive && <span className="ml-auto text-teal-400">•</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation — Glass Premium */}
      <nav
        aria-label="Navegación inferior"
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg lg:hidden"
      >
        <div className="flex items-center justify-around px-1 py-1.5">
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
                    "active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-400",
                    isActive
                      ? "text-teal-400 dark:text-teal-300"
                      : "text-muted-foreground"
                  )}
                  aria-expanded={showMore}
                  aria-label="Más opciones"
                >
                  {showMore ? <X className="w-5 h-5" aria-hidden /> : item.icon}
                  <span className="text-xs font-medium">{showMore ? "Cerrar" : item.label}</span>
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
                  "relative flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-2 min-h-[52px] min-w-[60px] transition-all duration-150",
                  "active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-400",
                  isActive 
                    ? "text-teal-400 dark:text-teal-300 font-semibold" 
                    : "text-muted-foreground"
                )}
              >
                {isActive && (
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-teal-400" aria-hidden />
                )}
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
        {/* ✅ Safe area para iPhones con notch */}
        <div className="h-[env(safe-area-inset-bottom)] bg-background/90" />
      </nav>
    </>
  );
}

