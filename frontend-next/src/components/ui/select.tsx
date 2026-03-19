import * as React from "react";

import { cn } from "@/src/lib/utils";

const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(({ className, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "h-10 w-full rounded-xl border border-[color:var(--ui-control-border)] bg-[color:var(--ui-control-bg)] px-3 text-sm text-[color:var(--ui-control-text)] outline-none focus-visible:border-[color:var(--ui-control-border-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--ui-focus-ring)]",
        className
      )}
      {...props}
    />
  );
});
Select.displayName = "Select";

export { Select };

