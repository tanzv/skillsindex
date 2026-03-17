import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/src/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-focus-ring)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-[color:var(--ui-accent)] bg-[color:var(--ui-accent)] text-[color:var(--ui-accent-foreground)] hover:brightness-105",
        outline:
          "border-[color:var(--ui-control-border)] bg-[color:var(--ui-control-bg)] text-[color:var(--ui-text-primary)] hover:border-[color:var(--ui-control-border-strong)] hover:bg-[color:var(--ui-control-bg-subtle)]",
        ghost:
          "border-transparent bg-transparent text-[color:var(--ui-text-secondary)] hover:bg-[color:var(--ui-control-bg-subtle)] hover:text-[color:var(--ui-text-primary)]",
        soft:
          "border-[color:var(--ui-accent-soft-bg)] bg-[color:var(--ui-accent-soft-bg)] text-[color:var(--ui-accent-soft-text)] hover:brightness-110"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 px-5 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
