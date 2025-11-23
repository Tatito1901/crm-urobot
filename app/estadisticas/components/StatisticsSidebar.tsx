'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Filter, 
  Share2, 
  MessageSquare, 
  Zap, 
  Activity,
  ChevronRight
} from 'lucide-react';

const menuItems = [
  { 
    title: 'Dashboard', 
    href: '/estadisticas', 
    icon: LayoutDashboard,
    description: 'Visión general'
  },
  { 
    title: 'Leads', 
    href: '/estadisticas/leads', 
    icon: Users,
    description: 'Gestión y volumen'
  },
  { 
    title: 'Embudo', 
    href: '/estadisticas/funnel', 
    icon: Filter,
    description: 'Conversión por etapa'
  },
  { 
    title: 'Canales', 
    href: '/estadisticas/canales', 
    icon: Share2,
    description: 'Fuentes de tráfico'
  },
  { 
    title: 'Mensajería', 
    href: '/estadisticas/mensajeria', 
    icon: MessageSquare,
    description: 'Rendimiento del bot'
  },
  { 
    title: 'Performance', 
    href: '/estadisticas/performance', 
    icon: Activity,
    description: 'Operativo y sedes'
  },
  { 
    title: 'Tiempo Real', 
    href: '/estadisticas/realtime', 
    icon: Zap,
    description: 'Monitor en vivo'
  },
];

export function StatisticsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-64 bg-white dark:bg-[#0f1623] border-r border-slate-200 dark:border-blue-900/20 flex flex-col h-full">
      <div className="p-6 border-b border-slate-200 dark:border-blue-900/20">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Analítica</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Centro de inteligencia</p>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 shadow-sm border border-blue-100 dark:border-blue-500/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                }
              `}
            >
              <div className={`
                p-1.5 rounded-md transition-colors
                ${isActive 
                  ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:text-blue-500 dark:group-hover:text-blue-400'
                }
              `}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className={`text-[10px] truncate ${isActive ? 'text-blue-400 dark:text-blue-300/60' : 'text-slate-400 dark:text-slate-500'}`}>
                  {item.description}
                </p>
              </div>

              {isActive && <ChevronRight className="w-3 h-3 text-blue-500 dark:text-blue-400 opacity-100" />}
            </Link>
          );
        })}
      </nav>

      {/* Mini Footer del Sidebar */}
      <div className="p-4 border-t border-slate-200 dark:border-blue-900/20 bg-slate-50 dark:bg-[#0a0f18]">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-3 text-white shadow-lg">
          <p className="text-xs font-bold mb-1">¿Necesitas ayuda?</p>
          <p className="text-[10px] opacity-90 mb-2">Contacta a soporte para reportes personalizados.</p>
          <button className="w-full py-1 bg-white/20 hover:bg-white/30 rounded text-[10px] font-medium transition-colors">
            Contactar Soporte
          </button>
        </div>
      </div>
    </aside>
  );
}
