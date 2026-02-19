/**
 * ============================================================
 * EMPTY STATE — Componente unificado para estados vacíos
 * ============================================================
 * Reemplaza los múltiples empty states inline dispersos en:
 * - leads/page.tsx
 * - consultas/page.tsx
 * - conversaciones/components/ConversationsSidebar.tsx
 * - dashboard/DashboardClient.tsx
 */

import { type ElementType, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /** Lucide icon component */
  icon?: ElementType;
  /** Custom icon node (overrides icon prop) */
  iconNode?: ReactNode;
  /** Main title text */
  title: string;
  /** Description text */
  description?: string;
  /** Action button or custom content */
  action?: ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional className */
  className?: string;
}

export function EmptyState({
  icon: Icon,
  iconNode,
  title,
  description,
  action,
  size = 'md',
  className,
}: EmptyStateProps) {
  const sizeConfig = {
    sm: {
      wrapper: 'py-6',
      iconBox: 'h-10 w-10 rounded-lg',
      iconSize: 'h-5 w-5',
      title: 'text-xs',
      desc: 'text-xs',
    },
    md: {
      wrapper: 'py-12',
      iconBox: 'h-16 w-16 sm:h-20 sm:w-20 rounded-2xl',
      iconSize: 'h-7 w-7 sm:h-9 sm:w-9',
      title: 'text-sm',
      desc: 'text-xs sm:text-sm',
    },
    lg: {
      wrapper: 'py-16 sm:py-20',
      iconBox: 'h-20 w-20 sm:h-24 sm:w-24 rounded-2xl',
      iconSize: 'h-9 w-9 sm:h-11 sm:w-11',
      title: 'text-base sm:text-lg',
      desc: 'text-sm',
    },
  };

  const s = sizeConfig[size];

  return (
    <div className={cn('flex flex-col items-center justify-center text-center space-y-3', s.wrapper, className)}>
      {(Icon || iconNode) && (
        <div className={cn(s.iconBox, 'bg-primary/10 flex items-center justify-center ring-1 ring-primary/10')}>
          {iconNode || (Icon && <Icon className={cn(s.iconSize, 'text-primary/60')} />)}
        </div>
      )}
      <p className={cn(s.title, 'font-medium text-muted-foreground')}>{title}</p>
      {description && (
        <p className={cn(s.desc, 'text-muted-foreground/70 max-w-xs')}>{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
