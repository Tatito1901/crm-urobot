/**
 * ============================================================
 * SEDE BADGE - Badge profesional de sedes
 * ============================================================
 * Badges con colores distintivos por sede
 */

import React from 'react';
import { Building2, MapPin } from 'lucide-react';

type Sede = 'POLANCO' | 'SATELITE';

interface SedeBadgeProps {
  sede: Sede;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const sedeConfig = {
  POLANCO: {
    color: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    label: 'Polanco',
    icon: Building2,
  },
  SATELITE: {
    color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    label: 'Satélite',
    icon: MapPin,
  },
};

const sizeConfig = {
  sm: 'text-[10px] px-1.5 py-0.5 gap-1',
  md: 'text-xs px-2 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1.5 gap-2',
};

export const SedeBadge: React.FC<SedeBadgeProps> = ({ 
  sede, 
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const config = sedeConfig[sede] || sedeConfig.POLANCO;
  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${config.color}
        ${sizeConfig[size]}
        transition-colors
        ${className}
      `}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      <span>{config.label}</span>
    </span>
  );
};
