import * as React from "react";

import { cn } from "@/app/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline";
}

const badgeVariants: Record<Required<BadgeProps>["variant"], string> = {
  default:
    "inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white/80",
  outline:
    "inline-flex items-center rounded-full border border-white/20 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white/60",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span ref={ref} className={cn(badgeVariants[variant], className)} {...props} />
    );
  }
);

Badge.displayName = "Badge";
