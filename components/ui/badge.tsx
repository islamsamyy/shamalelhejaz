import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-50 text-emerald-800 border border-emerald-200/80",
        sovereign:
          "bg-[#006948]/10 text-[#006948] border border-[#006948]/25 font-bold",
        gold:
          "bg-[#c5a059]/15 text-[#9a7b38] border border-[#c5a059]/30 font-bold",
        secondary:
          "bg-slate-100 text-slate-700 border border-slate-200",
        destructive:
          "bg-rose-50 text-rose-700 border border-rose-200",
        outline:
          "text-slate-700 border border-slate-200 bg-white",
        dark:
          "bg-slate-900 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

