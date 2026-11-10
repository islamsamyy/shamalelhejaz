import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006948] disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[#006948] text-white hover:bg-[#004d34] shadow-md shadow-[#006948]/20",
        sovereign:
          "bg-gradient-to-r from-[#006948] to-[#004d34] text-white hover:opacity-95 shadow-lg shadow-[#006948]/25 border border-[#00855d]/30",
        gold:
          "bg-gradient-to-r from-[#c5a059] to-[#9a7b38] text-slate-950 font-bold hover:brightness-105 shadow-md shadow-[#c5a059]/30",
        secondary:
          "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200",
        outline:
          "border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 hover:border-slate-300",
        ghost:
          "hover:bg-slate-100 hover:text-slate-900 text-slate-600",
        destructive:
          "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
        dark:
          "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-xl px-7 text-base font-bold",
        icon: "h-10 w-10 p-0 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

