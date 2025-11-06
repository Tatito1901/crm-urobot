'use client';

import React from "react";

import { cn } from "@/app/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge as ShadcnBadge, type BadgeProps as ShadcnBadgeProps } from "@/app/components/ui/badge";

export function Badge({
  label,
  tone,
  variant = "default",
  className,
  ...props
}: { label: string; tone?: string } & ShadcnBadgeProps) {
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
}

export function StatCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
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
}

type DataTableHeader = { key: string; label: string; align?: "left" | "right" };

export function DataTable({
  headers,
  rows,
  empty,
  onRowClick,
}: {
  headers: DataTableHeader[];
  rows: (Record<string, React.ReactNode> & { id: string })[];
  empty: string;
  onRowClick?: (rowId: string) => void;
}) {
  const getAlignmentClasses = (align?: "left" | "right") => {
    switch (align) {
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  if (rows.length === 0) {
    return (
      <div className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-8 text-center text-white/40">
        {empty}
      </div>
    );
  }

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

      <div className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <button
            key={row.id}
            type="button"
            className={cn(
              "flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
              onRowClick ? "cursor-pointer hover:border-white/20 hover:bg-white/[0.08]" : "cursor-default"
            )}
            onClick={onRowClick ? () => onRowClick(row.id) : undefined}
            disabled={!onRowClick}
          >
            {headers.map((header) => (
              <div key={header.key} className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                  {header.label}
                </span>
                <div className="text-sm text-white/90">{row[header.key] ?? "—"}</div>
              </div>
            ))}
          </button>
        ))}
      </div>
    </div>
  );
}
