"use client";

import * as React from "react";

import { cn } from "@/src/lib/utils";

interface RadioGroupContextValue {
  onValueChange?: (value: string) => void;
  value?: string;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

function composeEventHandlers<EventType extends { defaultPrevented: boolean }>(
  theirHandler: ((event: EventType) => void) | undefined,
  ourHandler: (event: EventType) => void
) {
  return (event: EventType) => {
    theirHandler?.(event);

    if (!event.defaultPrevented) {
      ourHandler(event);
    }
  };
}

function getEnabledItems(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLButtonElement>('[role="radio"]:not([disabled])'));
}

export interface RadioGroupProps extends React.ComponentPropsWithoutRef<"div"> {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  value?: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(({ className, defaultValue, onKeyDown, onValueChange, value, ...props }, ref) => {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const resolvedValue = value ?? uncontrolledValue;

  const handleValueChange = React.useCallback(
    (nextValue: string) => {
      if (value === undefined) {
        setUncontrolledValue(nextValue);
      }

      onValueChange?.(nextValue);
    },
    [onValueChange, value]
  );

  const handleKeyDown = composeEventHandlers<React.KeyboardEvent<HTMLDivElement>>(onKeyDown, (event) => {
    const items = getEnabledItems(event.currentTarget);

    if (items.length === 0) {
      return;
    }

    const currentIndex = items.findIndex((item) => item === document.activeElement);

    if (event.key === "Home") {
      event.preventDefault();
      items[0]?.focus();
      items[0]?.click();
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      items[items.length - 1]?.focus();
      items[items.length - 1]?.click();
      return;
    }

    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) {
      return;
    }

    event.preventDefault();

    const fallbackIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex = event.key === "ArrowRight" || event.key === "ArrowDown"
      ? (fallbackIndex + 1) % items.length
      : (fallbackIndex - 1 + items.length) % items.length;

    items[nextIndex]?.focus();
    items[nextIndex]?.click();
  });

  return (
    <RadioGroupContext.Provider value={{ onValueChange: handleValueChange, value: resolvedValue }}>
      <div ref={ref} role="radiogroup" data-slot="radio-group" className={cn("grid gap-2", className)} onKeyDown={handleKeyDown} {...props} />
    </RadioGroupContext.Provider>
  );
});
RadioGroup.displayName = "RadioGroup";

export interface RadioGroupItemProps extends React.ComponentPropsWithoutRef<"button"> {
  activeValue?: string;
  onValueChange?: (value: string) => void;
  value: string;
}

const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ activeValue, className, onClick, onValueChange, type, value, children, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext);
    const resolvedValue = context?.value ?? activeValue;
    const handleValueChange = context?.onValueChange ?? onValueChange;
    const isActive = resolvedValue === value;

    const handleClick = composeEventHandlers<React.MouseEvent<HTMLButtonElement>>(onClick, () => {
      handleValueChange?.(value);
    });

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        role="radio"
        aria-checked={isActive}
        data-slot="radio-group-item"
        data-state={isActive ? "checked" : "unchecked"}
        tabIndex={isActive ? 0 : -1}
        className={cn(
          "inline-flex min-h-10 items-center gap-3 rounded-xl border border-[color:var(--ui-control-border)] bg-[color:var(--ui-control-bg)] px-3 py-2 text-sm text-[color:var(--ui-text-primary)] transition-[background-color,border-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-focus-ring)] data-[state=checked]:border-[color:var(--ui-accent)] data-[state=checked]:bg-[color:var(--ui-accent-soft-bg)] data-[state=checked]:text-[color:var(--ui-accent-soft-text)]",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <span className={cn("inline-flex h-4 w-4 rounded-full border border-[color:var(--ui-control-border-strong)]", isActive && "border-[color:var(--ui-accent)] bg-[color:var(--ui-accent)]")}> 
          <span className={cn("m-auto h-2 w-2 rounded-full bg-[color:var(--ui-card-bg)]", !isActive && "hidden")} />
        </span>
        <span>{children}</span>
      </button>
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
