interface ErrorStateProps {
  title?: string;
  description: string;
}

export function ErrorState({ title = "Request failed", description }: ErrorStateProps) {
  return (
    <div className="rounded-3xl border border-[color:var(--ui-danger-border)] bg-[color:var(--ui-danger-bg)] p-6">
      <h3 className="text-base font-semibold text-[color:var(--ui-danger-text)]">{title}</h3>
      <p className="mt-2 text-sm text-[color:var(--ui-danger-text)]">{description}</p>
    </div>
  );
}
