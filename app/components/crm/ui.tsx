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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";

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
        <CardTitle className="text-3xl font-semibold text-white">{value}</CardTitle>
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
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-lg shadow-black/30">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead
                key={header.key}
                className={cn(header.align === "right" ? "text-right" : "text-left")}
              >
                {header.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={headers.length} className="px-4 py-10 text-center text-white/40">
                {empty}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow
                key={row.id}
                onClick={() => onRowClick?.(row.id)}
                className={cn(
                  onRowClick ? "cursor-pointer hover:bg-white/[0.05]" : "",
                  index % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
                )}
              >
                {headers.map((header) => (
                  <TableCell
                    key={header.key}
                    className={cn("text-white/80", header.align === "right" ? "text-right" : "text-left")}
                  >
                    {row[header.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
