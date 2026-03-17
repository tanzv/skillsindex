import AppTopbarBase, { type AppTopbarBaseProps } from "../../components/AppTopbarBase";
import { marketplaceTopbarClassNames } from "../../components/appTopbarClassNames";

export type MarketplaceTopbarBaseProps = Omit<AppTopbarBaseProps, "classNames">;

export default function MarketplaceTopbarBase(props: MarketplaceTopbarBaseProps) {
  return <AppTopbarBase {...props} classNames={marketplaceTopbarClassNames} />;
}
