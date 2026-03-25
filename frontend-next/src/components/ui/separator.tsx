"use client";

import * as React from "react";

import { cn } from "@/src/lib/utils";

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  decorative?: boolean;
  orientation?: "horizontal" | "vertical";
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, decorative = true, orientation = "horizontal", ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="separator"
        role={decorative ? "separator" : "none"}
        aria-orientation={orientation}
        className={cn(
          "shrink-0 bg-[color:var(--ui-border)]",
          orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
          className
        )}
        {...props}
      />
    );
  }
);
Separator.displayName = "Separator";

export { Separator };
