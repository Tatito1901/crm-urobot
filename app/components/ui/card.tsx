import * as React from "react";

import { cn } from "@/app/lib/utils";

export type CardProps = React.ComponentPropsWithoutRef<"div">;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-white/20 bg-white/[0.04] shadow-inner shadow-black/40",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export type CardHeaderProps = React.ComponentPropsWithoutRef<"div">;

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2 p-5", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export type CardTitleProps = React.ComponentPropsWithoutRef<"h3">;

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-sm font-semibold text-white", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

export type CardDescriptionProps = React.ComponentPropsWithoutRef<"p">;

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-xs text-white/60", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

export type CardContentProps = React.ComponentPropsWithoutRef<"div">;

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";
