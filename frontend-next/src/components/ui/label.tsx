"use client";

import * as React from "react";

import { cn } from "@/src/lib/utils";

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      data-slot="label"
      className={cn("text-sm font-medium leading-none text-[color:var(--ui-text-primary)]", className)}
      {...props}
    />
  );
});
Label.displayName = "Label";

export { Label };
