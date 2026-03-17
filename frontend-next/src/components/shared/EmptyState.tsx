interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-[color:var(--ui-border)] bg-[color:var(--ui-card-muted-bg)] p-8 text-center">
      <h3 className="text-lg font-semibold text-[color:var(--ui-text-primary)]">{title}</h3>
      <p className="mt-2 text-sm text-[color:var(--ui-text-secondary)]">{description}</p>
    </div>
  );
}
