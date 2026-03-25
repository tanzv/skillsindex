"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";

import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger
} from "@/src/components/ui/dialog";
import { cn } from "@/src/lib/utils";

const Sheet = Dialog;
const SheetTrigger = DialogTrigger;
const SheetClose = DialogClose;
const SheetPortal = DialogPortal;

const sheetVariants = cva(
  "fixed z-[90] flex h-full flex-col gap-4 border border-[color:var(--ui-border)] bg-[color:var(--ui-card-bg)] text-[color:var(--ui-text-primary)] shadow-[var(--ui-card-shadow)] outline-none",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b",
        bottom: "inset-x-0 bottom-0 border-t",
        left: "inset-y-0 left-0 w-full max-w-[48rem] border-r rounded-r-[24px]",
        right: "inset-y-0 right-0 w-full max-w-[48rem] border-l rounded-l-[24px]"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  hideClose?: boolean;
  overlayClassName?: string;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ children, className, hideClose = false, overlayClassName, side = "right", ...props }, ref) => {
  return (
    <>
      <DialogOverlay className={overlayClassName} />
      <DialogPrimitive.Content
        ref={ref}
        data-slot="sheet-content"
        data-side={side}
        aria-modal="true"
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {children}
        {hideClose ? null : (
          <SheetClose className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--ui-control-border)] bg-[color:var(--ui-control-bg)] text-[color:var(--ui-text-secondary)] transition-[background-color,border-color,color,transform] duration-150 hover:border-[color:var(--ui-control-border-strong)] hover:bg-[color:var(--ui-control-bg-subtle)] hover:text-[color:var(--ui-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-focus-ring)] active:scale-[0.98]">
            <span className="sr-only">Close</span>
          </SheetClose>
        )}
      </DialogPrimitive.Content>
    </>
  );
});
SheetContent.displayName = DialogPrimitive.Content.displayName;

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("flex flex-col gap-2", className)} {...props} />;
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-footer" className={cn("mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof DialogTitle>) {
  return <DialogTitle data-slot="sheet-title" className={cn(className)} {...props} />;
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof DialogDescription>) {
  return <DialogDescription data-slot="sheet-description" className={cn(className)} {...props} />;
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPortal,
  SheetTitle,
  SheetTrigger
};
