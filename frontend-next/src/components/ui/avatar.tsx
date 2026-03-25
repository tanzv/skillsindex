"use client";

import * as React from "react";

import { cn } from "@/src/lib/utils";

const Avatar = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      data-slot="avatar"
      className={cn("relative inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    />
  );
});
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(({ className, ...props }, ref) => {
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} alt={props.alt ?? ""} data-slot="avatar-image" className={cn("h-full w-full object-cover", className)} {...props} />;
});
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      data-slot="avatar-fallback"
      className={cn("inline-flex h-full w-full items-center justify-center rounded-full bg-[color:var(--ui-card-muted-bg)] text-[color:var(--ui-text-secondary)]", className)}
      {...props}
    />
  );
});
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarFallback, AvatarImage };
