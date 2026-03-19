import { cn } from "@/src/lib/utils";

export interface MarketplaceCompareFormOption {
  id: number;
  name: string;
}

interface MarketplaceCompareFormProps {
  action: string;
  items: MarketplaceCompareFormOption[];
  leftValue: string;
  rightValue: string;
  leftAriaLabel: string;
  rightAriaLabel: string;
  submitLabel: string;
  hiddenFields?: Array<{
    name: string;
    value: string;
  }>;
  className?: string;
  testId?: string;
}

export function MarketplaceCompareForm({
  action,
  items,
  leftValue,
  rightValue,
  leftAriaLabel,
  rightAriaLabel,
  submitLabel,
  hiddenFields = [],
  className,
  testId
}: MarketplaceCompareFormProps) {
  return (
    <form action={action} className={cn("marketplace-compare-form", className)} data-testid={testId}>
      {hiddenFields
        .filter((field) => String(field.value).trim().length > 0)
        .map((field) => (
          <input key={field.name} type="hidden" name={field.name} value={field.value} />
        ))}

      <select name="left" defaultValue={leftValue} aria-label={leftAriaLabel}>
        {items.map((item) => (
          <option key={`left-${item.id}`} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>

      <select name="right" defaultValue={rightValue} aria-label={rightAriaLabel}>
        {items.map((item) => (
          <option key={`right-${item.id}`} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>

      <button type="submit" className="marketplace-search-submit">
        {submitLabel}
      </button>
    </form>
  );
}
