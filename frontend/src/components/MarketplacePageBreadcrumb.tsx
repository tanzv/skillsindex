import { Breadcrumb } from "antd";
import type { ReactNode } from "react";

export interface MarketplacePageBreadcrumbItem {
  key: string;
  label: ReactNode;
  onClick?: () => void;
}

interface MarketplacePageBreadcrumbProps {
  items: MarketplacePageBreadcrumbItem[];
  ariaLabel?: string;
  separator?: ReactNode;
  className?: string;
  buttonClassName?: string;
  currentClassName?: string;
  testIdPrefix?: string;
}

export default function MarketplacePageBreadcrumb({
  items,
  ariaLabel = "Marketplace breadcrumb",
  separator = "/",
  className = "marketplace-page-breadcrumb",
  buttonClassName = "marketplace-page-breadcrumb-link",
  currentClassName = "marketplace-page-breadcrumb-current",
  testIdPrefix = "marketplace-breadcrumb"
}: MarketplacePageBreadcrumbProps) {
  return (
    <nav className={className} aria-label={ariaLabel}>
      <Breadcrumb
        separator={separator}
        items={items.map((item) => ({
          key: item.key,
          title: item.onClick ? (
            <button
              type="button"
              className={buttonClassName}
              data-testid={`${testIdPrefix}-${item.key}`}
              onClick={item.onClick}
            >
              {item.label}
            </button>
          ) : (
            <span className={currentClassName} data-testid={`${testIdPrefix}-${item.key}`}>
              {item.label}
            </span>
          )
        }))}
      />
    </nav>
  );
}
