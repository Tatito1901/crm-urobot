'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Leads", href: "/leads" },
  { label: "Pacientes", href: "/pacientes" },
  { label: "Consultas", href: "/consultas" },
  { label: "Confirmaciones", href: "/confirmaciones" },
  { label: "Métricas", href: "/metricas" },
] as const;

export function Sidebar() {
  const today = new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
  }).format(new Date());
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 flex-col justify-between border-r border-white/5 bg-white/[0.02] px-6 py-8 shadow-[0_0_50px_-25px_rgba(15,23,42,1)] lg:flex">
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-lg font-semibold text-blue-100">
            DM
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">CRM Clínico</p>
            <p className="text-base font-semibold text-white">Dr. Mario Martínez Thomas</p>
          </div>
        </div>

        <nav className="space-y-1 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center justify-between rounded-xl border px-3 py-2 transition ${
                pathname === item.href
                  ? "border-blue-500/40 bg-blue-500/15 text-white"
                  : "border-transparent text-white/60 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-white"
              }`}
            >
              <span>{item.label}</span>
              <span aria-hidden>→</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="space-y-2 text-xs text-white/40">
        <p>Hoy · {today}</p>
        <p>Agenda actualizada</p>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-1 border-t border-white/10 bg-[#050b18]/95 px-2 py-2 text-[10px] text-white/60 backdrop-blur safe-bottom lg:hidden">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={`flex flex-1 flex-col items-center gap-1 rounded-lg px-1.5 py-2 text-center transition ${
            pathname === item.href ? "bg-white/10 text-white font-medium" : "text-white/60 hover:text-white"
          }`}
        >
          <span className="leading-tight">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
