import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/src/lib/utils";

export function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" className={cn(className)} {...props} />;
}

export function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return <ol data-slot="breadcrumb-list" className={cn("flex flex-wrap items-center gap-1.5 break-words text-sm text-[color:var(--ui-text-secondary)]", className)} {...props} />;
}

export function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="breadcrumb-item" className={cn("inline-flex items-center gap-1.5", className)} {...props} />;
}

export function BreadcrumbLink({ asChild, className, ...props }: React.ComponentProps<typeof Link> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : Link;
  return <Comp data-slot="breadcrumb-link" className={cn("transition-colors hover:text-[color:var(--ui-text-primary)]", className)} {...props} />;
}

export function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return <span aria-current="page" data-slot="breadcrumb-page" className={cn("font-medium text-[color:var(--ui-text-primary)]", className)} {...props} />;
}

export function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<"li">) {
  return (
    <li aria-hidden="true" data-slot="breadcrumb-separator" className={cn("text-[color:var(--ui-text-secondary)]", className)} {...props}>
      {children ?? <ChevronRight className="h-4 w-4" />}
    </li>
  );
}

export function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span aria-hidden="true" data-slot="breadcrumb-ellipsis" className={cn("inline-flex h-9 w-9 items-center justify-center", className)} {...props}>
      ...
    </span>
  );
}
