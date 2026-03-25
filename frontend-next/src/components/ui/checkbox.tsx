"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/src/lib/utils";

export interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean | "indeterminate";
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked = false, className, disabled, onCheckedChange, onClick, type, ...props }, ref) => {
    const checkedState = checked === "indeterminate" ? "mixed" : checked ? "true" : "false";
    const dataState = checked === "indeterminate" ? "indeterminate" : checked ? "checked" : "unchecked";

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        role="checkbox"
        aria-checked={checkedState}
        data-slot="checkbox"
        data-state={dataState}
        disabled={disabled}
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-[6px] border border-[color:var(--ui-control-border)] bg-[color:var(--ui-control-bg)] text-[color:var(--ui-accent-foreground)] transition-[background-color,border-color,color,transform] duration-150 hover:border-[color:var(--ui-control-border-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-focus-ring)] disabled:pointer-events-none disabled:opacity-50 data-[state=checked]:border-[color:var(--ui-accent)] data-[state=checked]:bg-[color:var(--ui-accent)] data-[state=indeterminate]:border-[color:var(--ui-accent)] data-[state=indeterminate]:bg-[color:var(--ui-accent)]",
          className
        )}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented && !disabled) {
            onCheckedChange?.(!(checked === true));
          }
        }}
        {...props}
      >
        {checked === false ? null : checked === "indeterminate" ? <span className="h-0.5 w-2.5 rounded-full bg-current" /> : <Check className="h-3.5 w-3.5" aria-hidden="true" />}
      </button>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
