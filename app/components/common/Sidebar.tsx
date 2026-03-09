'use client';

import { useEffect, useState, type ReactNode, type ComponentType } from "react";
import { useHasMounted } from "@/hooks/common/useHasMounted";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Target,
  MessageCircle,
  MoreHorizontal,
  BarChart3,
  Bot,
  Stethoscope,
  Clock,
  LogOut,
  Building2,
  type LucideProps,
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { cn } from "@/lib/utils";
import { TZ } from "@/lib/date-utils";
import { signOutAction } from "@/app/auth/actions";
import { BotKillSwitch, BotKillSwitchCompact } from "./BotKillSwitch";

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
  {
    title: "Configuración",
    items: [
      { label: "Sedes", href: "/sedes", icon: Building2 },
    ],
  },
];

const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);

const DATE_FORMATTER = new Intl.DateTimeFormat("es-MX", { timeZone: TZ, dateStyle: "long" });

export function Sidebar() {
  const pathname = usePathname();
  const [today, setToday] = useState<string>('');
  
  // Evitar hydration mismatch: solo formatear fecha en el cliente
  useEffect(() => {
    setToday(DATE_FORMATTER.format(new Date()));
  }, []);

  return (
    <>
      {/* Main Sidebar — Premium Dark */}
      <aside
        className="hidden lg:flex lg:h-screen lg:flex-col lg:border-r lg:border-border lg:w-60 xl:w-72 2xl:w-80 shrink-0 sticky top-0 transition-all duration-300 sidebar-mesh"
      >
        {/* Brand Header */}
        <header className="shrink-0 px-5 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/20 to-teal-600/10 border border-teal-500/20 shadow-[0_0_16px_-4px] shadow-teal-500/25">
              <Bot className="h-4.5 w-4.5 text-teal-400" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-bold text-sidebar-foreground font-jakarta tracking-tight leading-none">Urobot</p>
              <p className="text-[10px] text-muted-foreground/70 font-medium mt-0.5">CRM Clínico</p>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav aria-label="Secciones principales" className="flex-1 overflow-y-auto px-3 scrollbar-hide space-y-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="mb-1.5 px-3 text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-semibold">{section.title}</p>
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
                          "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium transition-all duration-200",
                          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400",
                          isActive
                            ? "bg-teal-500/[0.08] text-foreground"
                            : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-teal-400" aria-hidden />
                        )}
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors duration-200",
                            isActive ? "text-teal-400" : "text-muted-foreground/70 group-hover:text-foreground"
                          )}
                          aria-hidden
                        />
                        <span className="flex-1">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <footer className="shrink-0 px-3 pb-5 space-y-2.5">
          <BotKillSwitch />

          <div className="section-divider mx-2" />

          {/* Doctor profile + date */}
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500/15 to-cyan-500/10 border border-white/[0.06] shrink-0">
              <span className="text-xs font-bold text-teal-400 font-jakarta">FM</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate leading-tight">Dr. Fausto Medina</p>
              <p className="text-[10px] text-muted-foreground/60 truncate leading-tight mt-0.5" suppressHydrationWarning>{today}</p>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className={cn(
                  "p-1.5 rounded-lg text-muted-foreground/50 transition-all duration-150",
                  "hover:bg-rose-500/10 hover:text-rose-400",
                  "active:scale-[0.92]",
                  "focus-visible:outline-2 focus-visible:outline-rose-400"
                )}
                title="Cerrar sesión"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
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
  { label: "Sedes", href: "/sedes", icon: Clock },
];

export function BottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const mounted = useHasMounted();

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
      {/* Bottom Navigation — Glass Premium */}
      <nav
        aria-label="Navegación inferior"
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg lg:hidden"
      >
        <div className="flex items-center justify-around px-2 py-1.5">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const isMoreButton = item.href === "#more";
            const isActive = isMoreButton 
              ? (showMore || isSecondaryActive)
              : (pathname === item.href || pathname?.startsWith(`${item.href}/`));
            
            if (isMoreButton) {
              return (
                <Drawer open={showMore} onOpenChange={setShowMore} key={item.label}>
                  <DrawerTrigger asChild>
                    <button
                      className={cn(
                        "flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-2 min-h-[52px] min-w-[60px] transition-all duration-200 no-select",
                        "active:scale-[0.92] focus-visible:outline-2 focus-visible:outline-teal-400",
                        isActive
                          ? "text-teal-400"
                          : "text-muted-foreground"
                      )}
                      aria-expanded={showMore}
                      aria-label="Más opciones"
                    >
                      {item.icon}
                      <span className="text-[10px] font-medium">{item.label}</span>
                    </button>
                  </DrawerTrigger>
                  <DrawerContent className="bg-card border-border">
                    <div className="mx-auto w-full max-w-sm">
                      <DrawerHeader className="text-left pb-2">
                        <DrawerTitle className="text-foreground">Más opciones</DrawerTitle>
                        <DrawerDescription className="text-muted-foreground">Inteligencia y Configuración</DrawerDescription>
                      </DrawerHeader>
                      <div className="px-4 pb-6 grid grid-cols-2 gap-2.5">
                        {SECONDARY_NAV_ITEMS.map((secItem) => {
                          const isSecActive = pathname === secItem.href || pathname?.startsWith(`${secItem.href}/`);
                          const SecIcon = secItem.icon;
                          return (
                            <Link
                              key={secItem.label}
                              href={secItem.href}
                              onClick={() => setShowMore(false)}
                              className={cn(
                                "flex items-center gap-3 rounded-xl px-4 py-4 text-sm font-medium transition-colors min-h-[52px]",
                                "active:scale-95 border",
                                isSecActive
                                  ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                                  : "bg-muted/50 text-foreground hover:bg-muted border-border"
                              )}
                            >
                              <SecIcon className="h-5 w-5 shrink-0" />
                              <span>{secItem.label}</span>
                            </Link>
                          );
                        })}
                        <BotKillSwitchCompact />
                      </div>
                    </div>
                  </DrawerContent>
                </Drawer>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                prefetch={true}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-2 min-h-[52px] min-w-[60px] transition-all duration-200 no-select",
                  "active:scale-[0.92] focus-visible:outline-2 focus-visible:outline-teal-400",
                  isActive 
                    ? "text-teal-400 font-semibold" 
                    : "text-muted-foreground"
                )}
              >
                {isActive && (
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-teal-400 transition-all duration-300" aria-hidden />
                )}
                {item.icon}
                <span className="text-[10px] font-medium">{item.label}</span>
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

