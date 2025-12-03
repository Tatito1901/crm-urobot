'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export const KPICard = React.memo(function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'text-foreground',
}: KPICardProps) {
  return (
    <Card className="bg-card border-border hover:border-border/80 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground font-medium truncate">{title}</p>
            <p className={`text-xl sm:text-2xl font-bold ${color} tabular-nums`}>{value}</p>
            {subtitle && (
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          <div className={`p-2 sm:p-3 rounded-xl bg-muted/50 ${color} shrink-0`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

KPICard.displayName = 'KPICard';
