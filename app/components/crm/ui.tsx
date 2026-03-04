
import React, { memo } from "react";

import { cn } from "@/lib/utils";
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
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-0.5 text-xs",
    lg: "px-2.5 py-1 text-sm",
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
      <div className="hidden w-full overflow-x-auto rounded-xl border border-border bg-card sm:block scrollbar-hide min-w-0">
        <table className="min-w-full divide-y divide-border text-left text-sm text-foreground" role="grid">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground font-medium">
            <tr>
              {headers.map((header) => (
                <th key={header.key} scope="col" className={cn("px-4 py-3 font-medium", getAlignmentClasses(header.align))}>
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "hover:bg-muted/30 transition-colors outline-none",
                  onRowClick && "cursor-pointer focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500/50"
                )}
                onClick={onRowClick ? () => onRowClick(row.id) : undefined}
                onKeyDown={onRowClick ? (e) => { 
                  if (e.key === 'Enter' || e.key === ' ') { 
                    e.preventDefault(); 
                    onRowClick(row.id); 
                  }
                  // Navegación por teclado
                  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const current = e.currentTarget as HTMLElement;
                    const next = e.key === 'ArrowDown' ? current.nextElementSibling : current.previousElementSibling;
                    if (next instanceof HTMLElement) {
                      next.focus();
                    }
                  }
                } : undefined}
                onMouseEnter={onRowHover ? () => onRowHover(row.id) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                role="row"
                aria-selected={false}
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
      <div className="space-y-2 sm:hidden px-2 py-2 momentum-scroll">
        {rows.map((row, index) => {
          const primary = mobileConfig?.primary ? row[mobileConfig.primary] : null;
          const secondary = mobileConfig?.secondary ? row[mobileConfig.secondary] : null;
          const metadata = mobileConfig?.metadata ?? [];

          return (
            <div
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row.id) : undefined}
              onKeyDown={onRowClick ? (e) => { 
                if (e.key === 'Enter' || e.key === ' ') { 
                  e.preventDefault(); 
                  onRowClick(row.id); 
                }
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                  e.preventDefault();
                  const current = e.currentTarget;
                  const next = e.key === 'ArrowDown' ? current.nextElementSibling : current.previousElementSibling;
                  if (next instanceof HTMLElement) {
                    next.focus();
                  }
                }
              } : undefined}
              onMouseEnter={onRowHover ? () => onRowHover(row.id) : undefined}
              tabIndex={onRowClick ? index === 0 ? 0 : -1 : undefined}
              role={onRowClick ? "button" : undefined}
              className={cn(
                "rounded-xl border border-border bg-card px-3.5 py-3 flex flex-col gap-2 shadow-sm",
                onRowClick && "cursor-pointer active:scale-[0.98] active:bg-muted/40 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
              )}
            >
              {primary && <div className="text-sm font-semibold text-foreground leading-tight min-w-0">{primary}</div>}
              {secondary && <div className="text-xs text-muted-foreground min-w-0 -mt-0.5">{secondary}</div>}
              
              {metadata.length > 0 && (
                <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 pt-2 border-t border-border/40 text-xs">
                  {metadata.map((key) => (
                    <div key={key} className="flex items-center gap-1 shrink-0 text-foreground">
                      {row[key]}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
