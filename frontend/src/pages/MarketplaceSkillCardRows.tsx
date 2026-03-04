import type { PrototypeCardEntry } from "./MarketplaceHomePage.helpers";

interface MarketplaceSkillCardRowsProps {
  rows: PrototypeCardEntry[][];
  keyPrefix: "latest-row" | "results-row";
  startRowIndex?: number;
  isResultsPage: boolean;
  newRowStartIndex: number | null;
  renderSkillCard: (card: PrototypeCardEntry, key: string) => JSX.Element;
}

export default function MarketplaceSkillCardRows({
  rows,
  keyPrefix,
  startRowIndex = 0,
  isResultsPage,
  newRowStartIndex,
  renderSkillCard
}: MarketplaceSkillCardRowsProps) {
  return (
    <>
      {rows.map((rowCards, localRowIndex) => {
        const rowIndex = startRowIndex + localRowIndex;
        const isNewRow = !isResultsPage && newRowStartIndex !== null && rowIndex >= newRowStartIndex;
        return (
          <div
            key={`${keyPrefix}-${rowIndex}`}
            className={`marketplace-results-row marketplace-latest-row row-${(rowIndex % 4) + 1}${isNewRow ? " is-new-row" : ""}`}
          >
            {rowCards.map((card, cardIndex) => renderSkillCard(card, `${keyPrefix}-${rowIndex + 1}-${card.title}-${cardIndex}`))}
          </div>
        );
      })}
    </>
  );
}
