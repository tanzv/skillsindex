interface MarketplaceHomeResultsEmptyStateProps {
  title: string;
  hint: string;
}

export default function MarketplaceHomeResultsEmptyState({ title, hint }: MarketplaceHomeResultsEmptyStateProps) {
  return (
    <article className="marketplace-results-empty-state" data-testid="marketplace-results-empty-state" role="status" aria-live="polite">
      <h3>{title}</h3>
      <p>{hint}</p>
    </article>
  );
}
