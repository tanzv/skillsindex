"use client";

import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/src/lib/utils";

interface PillRadioGroupContextValue {
  onValueChange?: (value: string) => void;
  value?: string;
}

const PillRadioGroupContext = React.createContext<PillRadioGroupContextValue | null>(null);

const pillRadioGroupVariants = cva("flex flex-wrap gap-2");

const pillRadioItemVariants = cva(
  "inline-flex min-h-9 items-center justify-center whitespace-nowrap rounded-full border border-[color:var(--ui-control-border)] bg-[color:var(--ui-control-bg)] px-3 text-sm font-medium text-[color:var(--ui-text-secondary)] transition-[background-color,border-color,color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-focus-ring)] disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-[color:var(--ui-accent)] data-[state=active]:bg-[color:var(--ui-accent-soft-bg)] data-[state=active]:text-[color:var(--ui-accent-soft-text)]"
);

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

export interface PillRadioGroupProps extends React.ComponentPropsWithoutRef<"div"> {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  value?: string;
}

const PillRadioGroup = React.forwardRef<HTMLDivElement, PillRadioGroupProps>(
  ({ className, defaultValue, onKeyDown, onValueChange, value, ...props }, ref) => {
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
      const nextIndex =
        event.key === "ArrowRight" || event.key === "ArrowDown"
          ? (fallbackIndex + 1) % items.length
          : (fallbackIndex - 1 + items.length) % items.length;
      const nextItem = items[nextIndex];

      nextItem?.focus();
      nextItem?.click();
    });

    return (
      <PillRadioGroupContext.Provider value={{ onValueChange: handleValueChange, value: resolvedValue }}>
        <div
          ref={ref}
          role="radiogroup"
          className={cn(pillRadioGroupVariants(), className)}
          onKeyDown={handleKeyDown}
          {...props}
        />
      </PillRadioGroupContext.Provider>
    );
  }
);
PillRadioGroup.displayName = "PillRadioGroup";

export interface PillRadioItemProps extends React.ComponentPropsWithoutRef<"button"> {
  activeValue?: string;
  onValueChange?: (value: string) => void;
  value: string;
}

const PillRadioItem = React.forwardRef<HTMLButtonElement, PillRadioItemProps>(
  ({ activeValue, className, onClick, onValueChange, type, value, ...props }, ref) => {
    const context = React.useContext(PillRadioGroupContext);
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
        data-state={isActive ? "active" : "inactive"}
        tabIndex={isActive ? 0 : -1}
        className={cn(pillRadioItemVariants(), className)}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
PillRadioItem.displayName = "PillRadioItem";

export { PillRadioGroup, PillRadioItem };
