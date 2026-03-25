import type { ComponentProps } from "react";

import { cn } from "@/src/lib/utils";

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="skeleton" aria-hidden="true" className={cn("animate-pulse rounded-md bg-[color:var(--ui-card-muted-bg)]", className)} {...props} />;
}
