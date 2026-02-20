'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Filter, 
  Share2, 
  MessageSquare, 
  Stethoscope,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { 
    title: 'Dashboard', 
    href: '/estadisticas', 
    icon: LayoutDashboard,
  },
  { 
    title: 'Impacto', 
    href: '/estadisticas/impacto', 
    icon: TrendingUp,
  },
  { 
    title: 'Clínico', 
    href: '/estadisticas/clinico', 
    icon: Stethoscope,
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
];

export function StatisticsTabs() {
  const pathname = usePathname();

  return (
    <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="px-3 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group inline-flex items-center gap-1.5 sm:gap-2 border-b-2 px-2.5 sm:px-3 py-3 sm:py-3.5 text-xs sm:text-sm font-medium transition-all whitespace-nowrap rounded-t-md",
                  isActive
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.title}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
