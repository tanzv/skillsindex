import * as React from "react";

import { cn } from "@/src/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-xl border border-[color:var(--ui-control-border)] bg-[color:var(--ui-control-bg)] px-3 py-2 text-sm text-[color:var(--ui-control-text)] shadow-sm outline-none ring-offset-0 placeholder:text-[color:var(--ui-control-placeholder)] focus-visible:border-[color:var(--ui-control-border-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--ui-focus-ring)]",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
