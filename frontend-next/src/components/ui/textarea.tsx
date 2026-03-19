import * as React from "react";

import { cn } from "@/src/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-28 w-full rounded-xl border border-[color:var(--ui-control-border)] bg-[color:var(--ui-control-bg)] px-3 py-2 text-sm text-[color:var(--ui-control-text)] shadow-sm outline-none ring-offset-0 placeholder:text-[color:var(--ui-control-placeholder)] focus-visible:border-[color:var(--ui-control-border-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--ui-focus-ring)]",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
