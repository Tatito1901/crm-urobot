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
  Activity 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { 
    title: 'Dashboard', 
    href: '/estadisticas', 
    icon: LayoutDashboard,
  },
  { 
    title: 'Leads', 
    href: '/estadisticas/leads', 
    icon: Users,
  },
  { 
    title: 'Embudo', 
    href: '/estadisticas/funnel', 
    icon: Filter,
  },
  { 
    title: 'Canales', 
    href: '/estadisticas/canales', 
    icon: Share2,
  },
  { 
    title: 'Mensajería', 
    href: '/estadisticas/mensajeria', 
    icon: MessageSquare,
  },
  { 
    title: 'Performance', 
    href: '/estadisticas/performance', 
    icon: Activity,
  },
  { 
    title: 'Tiempo Real', 
    href: '/estadisticas/realtime', 
    icon: Zap,
  },
];

export function StatisticsTabs() {
  const pathname = usePathname();

  return (
    <div className="border-b border-border bg-background sticky top-0 z-20">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group inline-flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-all whitespace-nowrap",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.title}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
