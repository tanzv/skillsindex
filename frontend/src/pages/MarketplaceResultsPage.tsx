import { KeyboardEvent, useLayoutEffect, useMemo, useRef } from "react";
import { MarketplaceSkill } from "../lib/api";
import { AppLocale } from "../lib/i18n";
import { MarketplaceFilterForm } from "./MarketplaceHomePage.helpers";

interface HomeChipFilter {
  id: string;
  label: string;
  queryTags: string;
}

interface ModalResultItem {
  skillID: number;
  title: string;
  meta: string;
  action: string;
}

interface MarketplaceResultsPageProps {
  locale: AppLocale;
  form: MarketplaceFilterForm;
  resultItems: MarketplaceSkill[];
  resultTotal: number;
  hotFilters: HomeChipFilter[];
  isLightTheme: boolean;
  onFilterFieldChange: (field: keyof MarketplaceFilterForm, value: string) => void;
  onSearchSubmit: () => void;
  onSearchInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onHotFilterApply: (filter: HomeChipFilter) => void;
  onResultOpen: (skillID: number) => void;
  onClose: () => void;
}

function formatSkillUpdatedAt(rawValue: string): string {
  const parsedDate = new Date(rawValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return "N/A";
  }
  return parsedDate.toISOString().slice(0, 10);
}

function mapSkillToModalItem(skill: MarketplaceSkill): ModalResultItem {
  const tagText = skill.tags.length > 0 ? skill.tags.slice(0, 2).join(" / ") : "general";
  const scoreText = Number.isFinite(skill.quality_score) ? skill.quality_score.toFixed(1) : "N/A";
  const updatedText = formatSkillUpdatedAt(skill.updated_at);
  return {
    skillID: skill.id,
    title: skill.name,
    meta: `Tags: ${tagText} · Score ${scoreText} · Updated ${updatedText}`,
    action: "View details · Add to queue"
  };
}

function buildResultsModalItems(skills: MarketplaceSkill[]): ModalResultItem[] {
  return skills.slice(0, 4).map((item) => mapSkillToModalItem(item));
}

function buildQuickFilterLabels(filters: HomeChipFilter[]): string[] {
  const fallbackLabels = ["Automation Testing", "Sync Orchestration", "Permission Management"];
  return fallbackLabels.map((defaultLabel, index) => filters[index]?.label || defaultLabel);
}

export default function MarketplaceResultsPage({
  form,
  resultItems,
  resultTotal,
  hotFilters,
  isLightTheme,
  onFilterFieldChange,
  onSearchSubmit,
  onSearchInputKeyDown,
  onHotFilterApply,
  onResultOpen,
  onClose
}: MarketplaceResultsPageProps) {
  const overlayRootRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLElement | null>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);

  const modalItems = useMemo(() => buildResultsModalItems(resultItems), [resultItems]);
  const quickFilterBindings = useMemo(() => hotFilters.slice(0, 3), [hotFilters]);
  const quickFilterLabels = useMemo(() => buildQuickFilterLabels(quickFilterBindings), [quickFilterBindings]);
  const activeQuickFilterIndex = useMemo(() => {
    const normalizedTagQuery = String(form.tags || "").trim().toLowerCase();
    if (!normalizedTagQuery) {
      return -1;
    }
    return quickFilterBindings.findIndex((filter) => String(filter.queryTags || "").trim().toLowerCase() === normalizedTagQuery);
  }, [form.tags, quickFilterBindings]);

  const shownCount = modalItems.length;
  const totalMatchedCount = Math.max(resultTotal, resultItems.length);
  const resultsTitle = "Search Center · Modal Mode";
  const closeLabel = "Esc Close";
  const modalQueryPlaceholder = "Enter keyword, e.g. playwright regression";
  const semanticPlaceholder = "Semantic: find high-rating reusable";
  const filterLabel = "Filter";
  const searchLabel = "Search";
  const shortcutHint = "Shortcut: Ctrl/Cmd + K open, Enter run, Esc close";
  const footerLeft = `${totalMatchedCount} results total, showing first ${shownCount}`;
  const footerRight = "Tab switch filters · Enter search";
  const statMatched = `Matched ${totalMatchedCount}`;
  const statLatency = "Avg latency 120ms";

  function getFocusableModalElements(): HTMLElement[] {
    if (!modalRef.current) {
      return [];
    }
    return Array.from(
      modalRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])"
      )
    ).filter((item) => {
      if (item.getAttribute("aria-hidden") === "true") {
        return false;
      }
      return item.offsetParent !== null || item === document.activeElement;
    });
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = getFocusableModalElements();
    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    const currentFocusedElement = document.activeElement as HTMLElement | null;
    const isFocusInsideModal = currentFocusedElement ? focusableElements.includes(currentFocusedElement) : false;

    if (event.shiftKey) {
      if (!isFocusInsideModal || currentFocusedElement === firstFocusableElement) {
        event.preventDefault();
        lastFocusableElement.focus();
      }
      return;
    }

    if (!isFocusInsideModal || currentFocusedElement === lastFocusableElement) {
      event.preventDefault();
      firstFocusableElement.focus();
    }
  }

  useLayoutEffect(() => {
    previousFocusedElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    window.requestAnimationFrame(() => {
      const [firstFocusableElement] = getFocusableModalElements();
      if (firstFocusableElement) {
        firstFocusableElement.focus({ preventScroll: true });
        return;
      }
      overlayRootRef.current?.focus({ preventScroll: true });
    });
    return () => {
      previousFocusedElementRef.current?.focus({ preventScroll: true });
    };
  }, []);

  return (
    <div
      ref={overlayRootRef}
      className={`marketplace-results-overlay ${isLightTheme ? "is-light-theme" : "is-dark-theme"}`}
      data-testid="marketplace-results-overlay"
      tabIndex={-1}
      onKeyDownCapture={handleDialogKeyDown}
    >
      <button
        type="button"
        className="marketplace-results-floating-mask"
        data-testid="marketplace-results-floating-mask"
        aria-label="Close results backdrop"
        onClick={onClose}
      />

      <div className="marketplace-results-overlay-layout">
        <div className="marketplace-results-floating-container" data-testid="marketplace-results-floating-container">
          <section
            ref={modalRef}
            className="marketplace-results-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Search modal"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="marketplace-results-modal-header">
              <h2>{resultsTitle}</h2>
              <button
                type="button"
                className="marketplace-results-close marketplace-results-floating-close"
                data-testid="marketplace-results-floating-close"
                aria-label="Close results panel"
                onClick={onClose}
              >
                {closeLabel}
              </button>
            </header>

            <section className="marketplace-results-modal-search-row">
              <label className="marketplace-results-modal-input is-query">
                <input
                  aria-label="Modal keyword query"
                  type="text"
                  value={form.q}
                  placeholder={modalQueryPlaceholder}
                  onChange={(event) => onFilterFieldChange("q", event.target.value)}
                  onKeyDown={onSearchInputKeyDown}
                />
              </label>
              <label className="marketplace-results-modal-input is-semantic">
                <input
                  aria-label="Modal semantic query"
                  type="text"
                  value={form.tags}
                  placeholder={semanticPlaceholder}
                  onChange={(event) => onFilterFieldChange("tags", event.target.value)}
                  onKeyDown={onSearchInputKeyDown}
                />
              </label>
              <button type="button" className="marketplace-results-modal-filter" onClick={onSearchSubmit}>
                {filterLabel}
              </button>
              <button type="button" className="marketplace-results-modal-search" onClick={onSearchSubmit}>
                {searchLabel}
              </button>
            </section>

            <section className="marketplace-results-modal-quick-filters marketplace-results-entry-chips">
              {quickFilterLabels.map((label, index) => (
                <button
                  key={`modal-quick-${index}-${label}`}
                  type="button"
                  className={index === activeQuickFilterIndex ? "is-active" : ""}
                  onClick={() => {
                    const targetFilter = quickFilterBindings[index];
                    if (targetFilter) {
                      onHotFilterApply(targetFilter);
                    }
                  }}
                >
                  {label}
                </button>
              ))}
            </section>

            <p className="marketplace-results-modal-shortcut">{shortcutHint}</p>

            <section className="marketplace-results-modal-list">
              {modalItems.length === 0 ? (
                <article className="marketplace-results-modal-card">
                  <h3>No matching skills</h3>
                  <p>Try adjusting keyword or semantic filters.</p>
                </article>
              ) : (
                modalItems.map((item) => (
                  <article key={item.skillID} className="marketplace-results-modal-card">
                    <h3>{item.title}</h3>
                    <p>{item.meta}</p>
                    <button type="button" onClick={() => onResultOpen(item.skillID)}>
                      {item.action}
                    </button>
                  </article>
                ))
              )}
            </section>

            <footer className="marketplace-results-modal-footer">
              <span>{footerLeft}</span>
              <span>{footerRight}</span>
            </footer>

            <div className="marketplace-results-modal-stats">
              <span className="is-strong">{statMatched}</span>
              <span>{statLatency}</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
