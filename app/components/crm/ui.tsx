
import React, { memo } from "react";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge as ShadcnBadge } from "@/components/ui/badge";

/**
 * Badge consistente para toda la plataforma
 * Usa STATE_COLORS de crm-data.ts para colores
 */
export const Badge = memo(function Badge({
  label,
  tone,
  size = "md",
  variant = "default",
  className,
  ...props
}: { 
  label: string; 
  tone?: string;
  size?: "sm" | "md" | "lg";
} & React.ComponentProps<typeof ShadcnBadge>) {
  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[10px]",
    md: "px-2 py-0.5 text-[11px]",
    lg: "px-2.5 py-1 text-xs",
  };

  return (
    <ShadcnBadge
      variant={variant}
      className={cn(
        "capitalize font-medium rounded-md whitespace-nowrap",
        sizeClasses[size],
        tone,
        className
      )}
      {...props}
    >
      {label}
    </ShadcnBadge>
  );
});

/**
 * StatCard consistente para métricas
 * Tipografía estandarizada
 */
export const StatCard = memo(function StatCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="space-y-1.5 pb-2">
        <CardDescription className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
          {title}
        </CardDescription>
        <CardTitle className="text-xl font-semibold text-foreground tabular-nums">{value}</CardTitle>
      </CardHeader>
      {hint && (
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">{hint}</p>
        </CardContent>
      )}
    </Card>
  );
});

type DataTableHeader = { key: string; label: React.ReactNode; align?: "left" | "right" };

/**
 * ✅ QUICK WIN #4: Configuración mobile optimizada
 * Define qué campos mostrar en cards mobile para mejor UX
 */
type MobileCardConfig = {
  /** Campo principal (ej: nombre) - mostrado como título */
  primary: string;
  /** Campo secundario opcional (ej: teléfono) - mostrado como subtítulo */
  secondary?: string;
  /** Campos de metadata (ej: estado, fecha) - mostrados como chips */
  metadata?: string[];
};

export function DataTable({
  headers,
  rows,
  empty,
  onRowClick,
  onRowHover,
  mobileConfig,
}: {
  headers: DataTableHeader[];
  rows: (Record<string, React.ReactNode> & { id: string })[];
  empty: string;
  onRowClick?: (rowId: string) => void;
  onRowHover?: (rowId: string) => void;
  /** ✅ NUEVO: Configuración para vista mobile optimizada */
  mobileConfig?: MobileCardConfig;
}) {
  // ✅ OPTIMIZACIÓN: Prevenir layout shift
  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-center py-12">
        <p className="text-sm text-muted-foreground">{empty}</p>
      </div>
    );
  }

  const getAlignmentClasses = (align?: "left" | "right") => {
    switch (align) {
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  return (
    <div className="space-y-4">
      <div className="hidden w-full overflow-x-auto rounded-xl border border-border/50 bg-card md:block">
        <table className="min-w-full divide-y divide-border/50 text-left text-sm text-foreground">
          <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            <tr>
              {headers.map((header) => (
                <th key={header.key} scope="col" className={cn("px-4 py-3 font-medium", getAlignmentClasses(header.align))}>
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "hover:bg-muted/30 transition-colors",
                  onRowClick && "cursor-pointer"
                )}
                onClick={onRowClick ? () => onRowClick(row.id) : undefined}
                onMouseEnter={onRowHover ? () => onRowHover(row.id) : undefined}
              >
                {headers.map((header) => (
                  <td key={header.key} className={cn("px-4 py-3 align-middle", getAlignmentClasses(header.align))}>
                    {row[header.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: Card-based layout optimizado */}
      <div className="space-y-3 md:hidden">
        {rows.map((row) => {
          const primary = mobileConfig?.primary ? row[mobileConfig.primary] : null;
          const secondary = mobileConfig?.secondary ? row[mobileConfig.secondary] : null;
          const metadata = mobileConfig?.metadata ?? [];

          return (
            <div
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row.id) : undefined}
              onMouseEnter={onRowHover ? () => onRowHover(row.id) : undefined}
              className={cn(
                "rounded-2xl border border-border/50 bg-card p-4 min-h-[80px] flex flex-col justify-center shadow-sm",
                onRowClick && "cursor-pointer active:scale-[0.99] transition-transform"
              )}
            >
              <div className="flex justify-between items-start gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  {primary && <div className="text-base font-semibold text-foreground leading-tight">{primary}</div>}
                  {secondary && <div className="mt-1 text-sm text-muted-foreground">{secondary}</div>}
                </div>
              </div>
              
              {metadata.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border/30 grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                  {metadata.map((key) => {
                    const headerLabel = headers.find(h => h.key === key)?.label;
                    return (
                      <div key={key} className="flex flex-col gap-1">
                        {headerLabel && typeof headerLabel === 'string' && (
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
                            {headerLabel}
                          </span>
                        )}
                        <div className="text-foreground">{row[key]}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
