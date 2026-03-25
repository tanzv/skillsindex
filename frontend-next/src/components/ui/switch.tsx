"use client";

import * as React from "react";

import { cn } from "@/src/lib/utils";

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked = false, className, disabled, onCheckedChange, onClick, type, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        role="switch"
        aria-checked={checked}
        data-slot="switch"
        data-state={checked ? "checked" : "unchecked"}
        disabled={disabled}
        className={cn(
          "inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent bg-[color:var(--ui-control-border)] p-0.5 transition-[background-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-focus-ring)] disabled:pointer-events-none disabled:opacity-50 data-[state=checked]:bg-[color:var(--ui-accent)]",
          className
        )}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented && !disabled) {
            onCheckedChange?.(!checked);
          }
        }}
        {...props}
      >
        <span
          data-slot="switch-thumb"
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-[color:var(--ui-card-bg)] shadow-sm transition-transform duration-150",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
