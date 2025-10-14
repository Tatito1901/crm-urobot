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
            <p className="text-xs text-white/50">Urología avanzada · Ciudad de México</p>
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

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-5 text-xs text-white/60 shadow-inner">
          <p className="text-white/80">Asistente IA</p>
          <p className="mt-1 text-white/50">
            Orquestación con múltiples LLMs mediante n8n. Gestiona agenda, confirmaciones y respuestas clínicas.
          </p>
          <button className="mt-4 w-full rounded-xl border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-100 transition hover:border-blue-400/70">
            Abrir panel n8n
          </button>
        </div>
      </div>

      <div className="space-y-2 text-xs text-white/40">
        <p>Hoy · {today}</p>
        <p className="text-white/60">soporte@urobot.mx</p>
        <p>Agenda actualizada</p>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 left-0 right-0 z-30 flex items-center justify-between gap-1 border-t border-white/10 bg-[#050b18]/95 px-4 py-3 text-xs text-white/60 backdrop-blur lg:hidden">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1 text-center transition ${
            pathname === item.href ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
          }`}
        >
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
