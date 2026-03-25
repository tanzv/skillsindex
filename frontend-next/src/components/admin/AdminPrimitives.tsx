import type { ReactNode } from "react";

import { ErrorState } from "@/src/components/shared/ErrorState";
import { PageHeader } from "@/src/components/shared/PageHeader";
import { Label } from "@/src/components/ui/label";
import { Switch } from "@/src/components/ui/switch";
import { cn } from "@/src/lib/utils";

import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";

export interface AdminMetricItem {
  label: string;
  value: string;
}

export function AdminPageScaffold({
  title,
  description,
  eyebrow = "Admin",
  actions,
  metrics,
  error,
  message,
  children
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  metrics?: AdminMetricItem[];
  error?: string;
  message?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={eyebrow} title={title} description={description} actions={actions} />
      {metrics?.length ? <AdminMetricGrid metrics={metrics} /> : null}
      {error ? <ErrorState description={error} /> : null}
      {message ? <AdminMessageBanner message={message} /> : null}
      {children}
    </div>
  );
}

export function AdminMetricGrid({
  metrics,
  className,
  columnsClassName = "grid gap-4 md:grid-cols-2 xl:grid-cols-4"
}: {
  metrics: AdminMetricItem[];
  className?: string;
  columnsClassName?: string;
}) {
  return (
    <div className={cn(columnsClassName, className)}>
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <CardHeader className="gap-2 p-5">
            <CardDescription className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--ui-text-muted)]">
              {metric.label}
            </CardDescription>
            <CardTitle className="text-base">{metric.value}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

export function AdminSectionCard({
  title,
  description,
  actions,
  children,
  className,
  contentClassName
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        {actions ? (
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle>{title}</CardTitle>
              {description ? <CardDescription>{description}</CardDescription> : null}
            </div>
            {actions}
          </div>
        ) : (
          <>
            <CardTitle>{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </>
        )}
      </CardHeader>
      <div className={cn("space-y-4 p-6 pt-0", contentClassName)}>{children}</div>
    </Card>
  );
}

export function AdminFilterBar({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={cn("grid gap-3", className)} {...props}>
      {children}
    </div>
  );
}

export function AdminSelectableRecordCard({
  selected,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  selected: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl border p-4 text-left transition-colors",
        selected
          ? "border-[color:var(--ui-info-border)] bg-[color:var(--ui-info-bg)]"
          : "border-[color:var(--ui-border)] bg-[color:var(--ui-card-bg)] hover:border-[color:var(--ui-border-strong)] hover:bg-[color:var(--ui-card-muted-bg)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AdminMetaChipList({
  items,
  tone = "muted",
  className
}: {
  items: string[];
  tone?: "muted" | "control";
  className?: string;
}) {
  const chipClassName =
    tone === "control"
      ? "rounded-full bg-[color:var(--ui-control-bg)] px-2.5 py-1 text-xs text-[color:var(--ui-text-secondary)]"
      : "rounded-full bg-[color:var(--ui-card-muted-bg)] px-2.5 py-1 text-xs text-[color:var(--ui-text-secondary)]";

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item) => (
        <span key={`${tone}-${item}`} className={chipClassName}>
          {item}
        </span>
      ))}
    </div>
  );
}

export function AdminToggleField({
  label,
  checked,
  onChange,
  ariaLabel,
  className
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-muted-bg)] px-4 py-3 text-sm text-[color:var(--ui-text-secondary)]",
        className
      )}
    >
      <Switch checked={checked} aria-label={ariaLabel || label} onCheckedChange={onChange} />
      <Label className="cursor-pointer text-sm font-medium text-[color:var(--ui-text-secondary)]">{label}</Label>
    </div>
  );
}

export function AdminMessageBanner({
  message,
  tone = "info"
}: {
  message: string;
  tone?: "info" | "danger" | "success";
}) {
  const toneClassName =
    tone === "danger"
      ? "border-[color:var(--ui-danger-border)] bg-[color:var(--ui-danger-bg)] text-[color:var(--ui-danger-text)]"
      : tone === "success"
        ? "border-[color:var(--ui-success-border)] bg-[color:var(--ui-success-bg)] text-[color:var(--ui-success-text)]"
        : "border-[color:var(--ui-info-border)] bg-[color:var(--ui-info-bg)] text-[color:var(--ui-info-text)]";

  return <div className={cn("rounded-2xl border px-4 py-3 text-sm", toneClassName)}>{message}</div>;
}

export function AdminEmptyBlock({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-[color:var(--ui-border)] bg-[color:var(--ui-card-muted-bg)] p-6 text-sm text-[color:var(--ui-text-secondary)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function AdminRecordCard({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-bg)] p-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AdminInsetBlock({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-[color:var(--ui-card-muted-bg)] px-4 py-3 text-sm text-[color:var(--ui-text-secondary)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
