"use client";

import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/src/lib/utils";

type TabsOrientation = "horizontal" | "vertical";

interface TabsContextValue {
  onValueChange?: (value: string) => void;
  orientation: TabsOrientation;
  value?: string;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

const tabsListVariants = cva("inline-flex items-center gap-2", {
  variants: {
    orientation: {
      horizontal: "flex-row flex-wrap",
      vertical: "flex-col items-stretch"
    }
  },
  defaultVariants: {
    orientation: "horizontal"
  }
});

const tabsTriggerVariants = cva(
  "inline-flex min-h-9 items-center justify-center whitespace-nowrap rounded-full border border-[color:var(--ui-control-border)] bg-[color:var(--ui-control-bg)] px-3 text-sm font-medium text-[color:var(--ui-text-secondary)] transition-[background-color,border-color,color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-focus-ring)] disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-[color:var(--ui-accent)] data-[state=active]:bg-[color:var(--ui-accent-soft-bg)] data-[state=active]:text-[color:var(--ui-accent-soft-text)]"
);

const tabsContentVariants = cva("outline-none");

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

function getEnabledTabButtons(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'));
}

export interface TabsProps extends React.ComponentPropsWithoutRef<"div"> {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: TabsOrientation;
  value?: string;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, defaultValue, onValueChange, orientation = "horizontal", value, ...props }, ref) => {
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

    return (
      <TabsContext.Provider value={{ onValueChange: handleValueChange, orientation, value: resolvedValue }}>
        <div ref={ref} className={cn("grid gap-4", className)} data-orientation={orientation} {...props} />
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = "Tabs";

export interface TabsListProps extends React.ComponentPropsWithoutRef<"div"> {
  orientation?: TabsOrientation;
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, onKeyDown, orientation, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    const resolvedOrientation = orientation ?? context?.orientation ?? "horizontal";

    const handleKeyDown = composeEventHandlers<React.KeyboardEvent<HTMLDivElement>>(onKeyDown, (event) => {
      const tabs = getEnabledTabButtons(event.currentTarget);

      if (tabs.length === 0) {
        return;
      }

      const currentIndex = tabs.findIndex((tab) => tab === document.activeElement);

      if (event.key === "Home") {
        event.preventDefault();
        tabs[0]?.focus();
        tabs[0]?.click();
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        tabs[tabs.length - 1]?.focus();
        tabs[tabs.length - 1]?.click();
        return;
      }

      const isNextKey =
        (resolvedOrientation === "horizontal" && event.key === "ArrowRight") ||
        (resolvedOrientation === "vertical" && event.key === "ArrowDown");
      const isPreviousKey =
        (resolvedOrientation === "horizontal" && event.key === "ArrowLeft") ||
        (resolvedOrientation === "vertical" && event.key === "ArrowUp");

      if (!isNextKey && !isPreviousKey) {
        return;
      }

      event.preventDefault();

      const fallbackIndex = currentIndex === -1 ? 0 : currentIndex;
      const nextIndex = isNextKey
        ? (fallbackIndex + 1) % tabs.length
        : (fallbackIndex - 1 + tabs.length) % tabs.length;
      const nextTab = tabs[nextIndex];

      nextTab?.focus();
      nextTab?.click();
    });

    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation={resolvedOrientation}
        className={cn(tabsListVariants({ orientation: resolvedOrientation }), className)}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  }
);
TabsList.displayName = "TabsList";

export interface TabsTriggerProps extends React.ComponentPropsWithoutRef<"button"> {
  activeValue?: string;
  controlsId?: string;
  onValueChange?: (value: string) => void;
  triggerId?: string;
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ activeValue, className, controlsId, onClick, onValueChange, triggerId, type, value, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    const resolvedValue = context?.value ?? activeValue;
    const handleValueChange = context?.onValueChange ?? onValueChange;
    const isActive = resolvedValue === value;

    const handleClick = composeEventHandlers<React.MouseEvent<HTMLButtonElement>>(onClick, () => {
      handleValueChange?.(value);
    });

    return (
      <button
        ref={ref}
        id={triggerId}
        type={type ?? "button"}
        role="tab"
        data-state={isActive ? "active" : "inactive"}
        aria-selected={isActive}
        aria-controls={controlsId}
        tabIndex={isActive ? 0 : -1}
        className={cn(tabsTriggerVariants(), className)}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

export interface TabsContentProps extends React.ComponentPropsWithoutRef<"div"> {
  activeValue?: string;
  forceMount?: boolean;
  labelledBy?: string;
  panelId?: string;
  value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ activeValue, children, className, forceMount = false, hidden, labelledBy, panelId, value, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    const resolvedValue = context?.value ?? activeValue;
    const isActive = resolvedValue === value;

    if (!isActive && !forceMount) {
      return null;
    }

    return (
      <div
        ref={ref}
        id={panelId}
        role="tabpanel"
        data-state={isActive ? "active" : "inactive"}
        aria-labelledby={labelledBy}
        hidden={hidden ?? !isActive}
        className={cn(tabsContentVariants(), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsContent, TabsList, TabsTrigger };
