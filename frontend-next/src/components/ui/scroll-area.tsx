import { cn } from "@/src/lib/utils";

export function ScrollArea({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="scroll-area" className={cn("relative overflow-auto", className)} {...props} />;
}
