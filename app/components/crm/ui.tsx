
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

export const Badge = memo(function Badge({
  label,
  tone,
  variant = "default",
  className,
  ...props
}: { label: string; tone?: string } & React.ComponentProps<typeof ShadcnBadge>) {
  return (
    <ShadcnBadge
      variant={variant}
      className={cn(
        "capitalize tracking-[0.12em] text-xs font-medium text-white/80",
        tone,
        className
      )}
      {...props}
    >
      {label}
    </ShadcnBadge>
  );
});

export const StatCard = memo(function StatCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <Card className="bg-white/[0.03]">
      <CardHeader className="space-y-3 pb-2">
        <CardDescription className="text-[0.68rem] uppercase tracking-[0.28em] text-white/50">
          {title}
        </CardDescription>
        <CardTitle className="text-2xl font-semibold text-white sm:text-3xl">{value}</CardTitle>
      </CardHeader>
      {hint && (
        <CardContent className="pt-0">
          <p className="text-xs text-white/50">{hint}</p>
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
        <p className="text-sm text-slate-400">{empty}</p>
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
      <div className="hidden w-full overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02] md:block">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm text-white/80">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-white/40">
            <tr>
              {headers.map((header) => (
                <th key={header.key} scope="col" className={cn("px-3 py-3", getAlignmentClasses(header.align))}>
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "transition hover:bg-white/[0.04]",
                  onRowClick && "cursor-pointer"
                )}
                onClick={onRowClick ? () => onRowClick(row.id) : undefined}
                onMouseEnter={onRowHover ? () => onRowHover(row.id) : undefined}
              >
                {headers.map((header) => (
                  <td key={header.key} className={cn("px-3 py-3 align-top", getAlignmentClasses(header.align))}>
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
                "rounded-xl border border-white/10 bg-gradient-to-r from-white/[0.03] to-transparent p-4 transition-all duration-200 active:scale-[0.98] min-h-[80px] flex flex-col justify-center",
                onRowClick && "cursor-pointer active:bg-white/10 active:border-blue-400/30"
              )}
            >
              <div className="mb-3">
                {primary && <div className="text-base font-semibold text-white leading-tight">{primary}</div>}
                {secondary && <div className="mt-1.5 text-sm text-white/70">{secondary}</div>}
              </div>
              {metadata.length > 0 && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {metadata.map((key) => (
                    <div key={key} className="flex flex-col gap-0.5">
                      <span className="text-white/40 text-[10px] uppercase tracking-wide">{headers.find((h) => h.key === key)?.label}</span>
                      <span className="text-white/90 font-medium">{row[key]}</span>
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
