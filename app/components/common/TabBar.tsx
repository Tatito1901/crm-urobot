'use client';

import React from 'react';
import { tabs as tabTokens } from '@/app/lib/design-system';
import { cn } from '@/lib/utils';

/**
 * TabBar - Componente unificado de tabs para toda la plataforma.
 * Reemplaza las implementaciones dispersas en Dashboard, Urobot, etc.
 * 
 * Variantes:
 * - "simple": Tabs con underline (Dashboard)
 * - "icon": Tabs con icono y badge counter (Urobot, Estadísticas)
 */

// ==================== SIMPLE TABS ====================
interface SimpleTab {
  key: string;
  label: string;
}

interface SimpleTabBarProps {
  tabs: SimpleTab[];
  active: string;
  onChange: (key: string) => void;
  variant?: 'simple';
  flush?: boolean;
  className?: string;
}

// ==================== ICON TABS ====================
interface IconTab {
  key: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
  badgeColor?: string;
  accentColor?: string;
}

interface IconTabBarProps {
  tabs: IconTab[];
  active: string;
  onChange: (key: string) => void;
  variant: 'icon';
  flush?: boolean;
  className?: string;
}

type TabBarProps = SimpleTabBarProps | IconTabBarProps;

export function TabBar(props: TabBarProps) {
  const { active, onChange, flush = false, className } = props;
  const containerClass = flush ? tabTokens.containerFlush : tabTokens.container;

  if (props.variant === 'icon') {
    return (
      <div className={cn(containerClass, className)}>
        <div className={tabTokens.list}>
          {props.tabs.map((tab) => {
            const isActive = active === tab.key;
            const color = tab.accentColor || 'primary';
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onChange(tab.key)}
                className={cn(
                  tabTokens.tabWithIcon,
                  'min-h-[44px] no-select',
                  isActive
                    ? `border-${color}-500 text-${color}-400`
                    : tabTokens.tabIconInactive
                )}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden text-xs">{tab.label}</span>
                {tab.badge !== undefined && tab.badge !== 0 && (
                  <span className={
                    tab.badgeColor
                      ? `ml-1 px-1.5 py-0.5 text-xs rounded-full bg-${tab.badgeColor}-500/20 text-${tab.badgeColor}-400`
                      : tabTokens.tabBadge
                  }>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Simple variant (default)
  return (
    <div className={cn(containerClass, className)}>
      {(props.tabs as SimpleTab[]).map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              tabTokens.tab,
              isActive ? tabTokens.tabActive : tabTokens.tabInactive
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
