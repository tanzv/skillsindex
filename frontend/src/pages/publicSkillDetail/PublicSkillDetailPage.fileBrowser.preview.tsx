import { type ReactNode } from "react";

import type { MarketplaceSkill } from "../../lib/api";
import type { SkillDetailCopy } from "./PublicSkillDetailPage.copy";
import type { SkillDetailPreviewPanelProps } from "./PublicSkillDetailPage.fileBrowser.contract";
import type { SkillDetailViewModel } from "./PublicSkillDetailPage.helpers";

type DocumentHeadingLevel = 1 | 2 | 3;

export type DocumentBlock =
  | { type: "heading"; level: DocumentHeadingLevel; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "keyValue"; key: string; value: string }
  | { type: "divider" };

interface DocumentMetaEntry {
  label: string;
  value: string;
}

interface ResolvePreviewPayloadOptions {
  activePreset: SkillDetailPreviewPanelProps["activePreset"];
  previewLanguage: string;
  codePanelTone: SkillDetailViewModel["codePanelTone"];
  selectedFileName: string;
  fallbackPreviewContent: string;
  liveFileContent: string;
  liveFileLanguage: string;
}

function normalizePreviewLine(rawLine: string): string {
  return String(rawLine || "").replace(/^\s*\d+\s+/, "").trimEnd();
}

function resolveHeadingLevel(line: string): DocumentHeadingLevel | null {
  if (/^###\s+/.test(line)) {
    return 3;
  }
  if (/^##\s+/.test(line)) {
    return 2;
  }
  if (/^#\s+/.test(line)) {
    return 1;
  }
  return null;
}

function resolveInlineCodeTokens(text: string): ReactNode[] {
  const segments = String(text || "").split(/(`[^`]+`)/g).filter(Boolean);
  return segments.map((segment, index) => {
    if (/^`[^`]+`$/.test(segment)) {
      return (
        <code key={`doc-code-${index}`} className="skill-detail-doc-inline-code">
          {segment.slice(1, -1)}
        </code>
      );
    }
    return <span key={`doc-text-${index}`}>{segment}</span>;
  });
}

export function resolveDocumentBlocks(rawContent: string): DocumentBlock[] {
  const blocks: DocumentBlock[] = [];
  const lines = String(rawContent || "").split(/\r?\n/);
  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];

  function flushParagraph(): void {
    if (paragraphBuffer.length === 0) {
      return;
    }
    blocks.push({ type: "paragraph", text: paragraphBuffer.join(" ") });
    paragraphBuffer = [];
  }

  function flushList(): void {
    if (listBuffer.length === 0) {
      return;
    }
    blocks.push({ type: "list", items: [...listBuffer] });
    listBuffer = [];
  }

  for (const rawLine of lines) {
    const normalizedLine = normalizePreviewLine(rawLine);
    const trimmedLine = normalizedLine.trim();

    if (!trimmedLine) {
      flushParagraph();
      flushList();
      continue;
    }

    if (/^---+$/.test(trimmedLine)) {
      flushParagraph();
      flushList();
      blocks.push({ type: "divider" });
      continue;
    }

    const headingLevel = resolveHeadingLevel(trimmedLine);
    if (headingLevel !== null) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        level: headingLevel,
        text: trimmedLine.slice(headingLevel + 1).trim()
      });
      continue;
    }

    if (/^[-*]\s+/.test(trimmedLine)) {
      flushParagraph();
      listBuffer.push(trimmedLine.replace(/^[-*]\s+/, "").trim());
      continue;
    }

    const keyValueMatch = trimmedLine.match(/^([A-Za-z][A-Za-z0-9 _/+.-]{1,48}):\s+(.+)$/);
    if (keyValueMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "keyValue",
        key: keyValueMatch[1],
        value: keyValueMatch[2]
      });
      continue;
    }

    paragraphBuffer.push(trimmedLine);
  }

  flushParagraph();
  flushList();

  if (blocks.length > 0) {
    return blocks;
  }

  const fallbackText = String(rawContent || "").trim();
  return fallbackText ? [{ type: "paragraph", text: fallbackText }] : [];
}

export function resolveEnrichedDocumentBlocks(
  blocks: DocumentBlock[],
  activePreset: SkillDetailPreviewPanelProps["activePreset"],
  titleName: string,
  summaryDescription: string
): DocumentBlock[] {
  if (activePreset !== "skill") {
    return blocks;
  }

  const hasHeading = blocks.some((block) => block.type === "heading");
  if (hasHeading) {
    return blocks;
  }

  return [
    { type: "heading", level: 1, text: titleName },
    { type: "paragraph", text: summaryDescription },
    { type: "divider" },
    ...blocks
  ];
}

function resolveDocumentMetaEntries({
  activeSkill,
  detailModel,
  text
}: {
  activeSkill: MarketplaceSkill | null;
  detailModel: SkillDetailViewModel;
  text: SkillDetailCopy;
}): DocumentMetaEntry[] {
  return [
    { label: text.repositoryLabel, value: detailModel.repositoryHostPath },
    { label: text.typeLabel, value: activeSkill?.source_type || "repository" },
    { label: text.updatedAtLabel, value: formatSkillDetailDateLabel(activeSkill?.updated_at) },
    { label: text.fileCountLabel, value: String(detailModel.fileEntries.length) }
  ];
}

function renderDocumentBlock(block: DocumentBlock, index: number): ReactNode {
  if (block.type === "divider") {
    return <hr key={`doc-divider-${index}`} className="skill-detail-doc-divider" />;
  }

  if (block.type === "heading") {
    const headingClassName = `skill-detail-doc-heading is-h${block.level}`;
    if (block.level === 1) {
      return (
        <h1 key={`doc-heading-${index}`} className={headingClassName}>
          {resolveInlineCodeTokens(block.text)}
        </h1>
      );
    }
    if (block.level === 2) {
      return (
        <h2 key={`doc-heading-${index}`} className={headingClassName}>
          {resolveInlineCodeTokens(block.text)}
        </h2>
      );
    }
    return (
      <h3 key={`doc-heading-${index}`} className={headingClassName}>
        {resolveInlineCodeTokens(block.text)}
      </h3>
    );
  }

  if (block.type === "list") {
    return (
      <ul key={`doc-list-${index}`} className="skill-detail-doc-list">
        {block.items.map((item, itemIndex) => (
          <li key={`doc-list-item-${index}-${itemIndex}`}>{resolveInlineCodeTokens(item)}</li>
        ))}
      </ul>
    );
  }

  if (block.type === "keyValue") {
    return (
      <p key={`doc-kv-${index}`} className="skill-detail-doc-kv">
        <span className="skill-detail-doc-kv-key">{`${block.key}:`}</span>
        <span className="skill-detail-doc-kv-value">{resolveInlineCodeTokens(block.value)}</span>
      </p>
    );
  }

  return (
    <p key={`doc-p-${index}`} className="skill-detail-doc-paragraph">
      {resolveInlineCodeTokens(block.text)}
    </p>
  );
}

export function formatSkillDetailDateLabel(rawValue: string | null | undefined): string {
  if (!rawValue) {
    return "N/A";
  }
  const parsed = new Date(rawValue);
  if (Number.isNaN(parsed.getTime())) {
    return String(rawValue);
  }
  return parsed.toLocaleString();
}

export function resolvePreviewPayload({
  activePreset,
  previewLanguage,
  codePanelTone,
  selectedFileName,
  fallbackPreviewContent,
  liveFileContent,
  liveFileLanguage
}: ResolvePreviewPayloadOptions): {
  previewContent: string;
  activeLanguage: string;
  isSQLPreview: boolean;
  isDocumentPreview: boolean;
} {
  const normalizedFileName = String(selectedFileName || "").toLowerCase();
  const activeSkillLanguage =
    normalizedFileName.endsWith(".sql") || codePanelTone === "sql" ? "SQL" : previewLanguage;
  const resolvedLanguage = String(liveFileLanguage || "").trim() || (activePreset === "skill" ? activeSkillLanguage : "Markdown");
  const previewContent = String(liveFileContent || "").trim() || fallbackPreviewContent;
  const isSQLPreview = resolvedLanguage === "SQL";

  return {
    previewContent,
    activeLanguage: resolvedLanguage,
    isSQLPreview,
    isDocumentPreview: !isSQLPreview
  };
}

export function SkillDetailPreviewPanel({
  activePreset,
  activeSkill,
  detailModel,
  selectedFileIndex,
  selectedFileContent,
  selectedFileLanguage,
  selectedFileName,
  selectedFilePath,
  text,
  onCopyPath,
  onOpenSource,
  panelClassName = ""
}: SkillDetailPreviewPanelProps) {
  const selectedEntry = detailModel.fileEntries[selectedFileIndex] || detailModel.fileEntries[0];
  const filePathLabel = (text.filePathHint.split(/[:：]/)[0] || "Path").trim();
  const resolvedFilePathHint = `${filePathLabel}: ${selectedFilePath}`;
  const resolvedPreviewPayload = resolvePreviewPayload({
    activePreset,
    previewLanguage: detailModel.previewLanguage,
    codePanelTone: detailModel.codePanelTone,
    selectedFileName: selectedEntry?.name || selectedFileName,
    fallbackPreviewContent: detailModel.presetPreviewContent[activePreset] || detailModel.fileCodePreview,
    liveFileContent: selectedFileContent,
    liveFileLanguage: selectedFileLanguage
  });
  const { previewContent, activeLanguage, isSQLPreview, isDocumentPreview } = resolvedPreviewPayload;
  const localizedLanguageMeta = `${text.metaLanguageLabel}: ${activeLanguage}`;
  const resolvedFileSourceMeta = `${text.fileSourceHint} · ${localizedLanguageMeta}`;
  const rawDocumentBlocks = isDocumentPreview ? resolveDocumentBlocks(previewContent) : [];
  const documentBlocks = isDocumentPreview
    ? resolveEnrichedDocumentBlocks(rawDocumentBlocks, activePreset, detailModel.titleName, detailModel.summaryDescription)
    : [];
  const documentMetaEntries = isDocumentPreview
    ? resolveDocumentMetaEntries({ activeSkill, detailModel, text })
    : [];
  const showDocumentSummary = activePreset === "skill" && Boolean(detailModel.summaryDescription);

  return (
    <article
      id="skill-detail-file-content"
      className={`skill-detail-card is-file-tree is-preview-only${panelClassName ? ` ${panelClassName}` : ""}`}
      role="region"
      aria-label={text.fileBrowserTitle}
    >
      <div className="skill-detail-file-head skill-detail-doc-toolbar">
        <div className="skill-detail-doc-toolbar-main">
          <span className="skill-detail-doc-file-icon" aria-hidden="true" />
          <span className="skill-detail-doc-file-name">{selectedEntry?.name || selectedFileName}</span>
          {selectedEntry?.size ? <span className="skill-detail-doc-file-size">{selectedEntry.size}</span> : null}
        </div>
        <div className="skill-detail-doc-toolbar-actions">
          <div className="skill-detail-file-info-actions">
            <button type="button" onClick={onOpenSource}>
              {text.openOriginal}
            </button>
            <button type="button" onClick={onCopyPath}>
              {text.copyPath}
            </button>
          </div>
        </div>
      </div>

      <div className="skill-detail-code-head is-document-head">
        <div className="skill-detail-doc-head-copy">
          <p className="skill-detail-file-state-hint">{resolvedFilePathHint}</p>
          <p className="skill-detail-file-state-meta">{resolvedFileSourceMeta}</p>
        </div>
        <div className="skill-detail-doc-head-badges" aria-label="Document preview metadata">
          <span className="skill-detail-file-state-badge">{activeLanguage}</span>
          {selectedEntry?.size ? <span className="skill-detail-file-state-badge">{selectedEntry.size}</span> : null}
        </div>
      </div>

      <div className={`skill-detail-code-panel${isSQLPreview ? " is-sql" : ""}${isDocumentPreview ? " is-document" : ""}`}>
        {isDocumentPreview ? (
          <div className="skill-detail-doc-reader-shell">
            <section className={`skill-detail-doc-reader-intro${showDocumentSummary ? "" : " is-compact"}`}>
              <p className="skill-detail-doc-reader-eyebrow">{selectedEntry?.name || selectedFileName}</p>
              {showDocumentSummary ? <p className="skill-detail-doc-reader-summary">{detailModel.summaryDescription}</p> : null}
              <div className="skill-detail-doc-meta-list">
                {documentMetaEntries.map((entry) => (
                  <div key={`${entry.label}-${entry.value}`} className="skill-detail-doc-meta-item">
                    <span className="skill-detail-doc-meta-label">{entry.label}</span>
                    <span className="skill-detail-doc-meta-value">{entry.value}</span>
                  </div>
                ))}
              </div>
            </section>
            <div className="skill-detail-code-content skill-detail-doc-content">{documentBlocks.map((block, index) => renderDocumentBlock(block, index))}</div>
          </div>
        ) : (
          <pre className="skill-detail-code-content">{previewContent}</pre>
        )}
      </div>
    </article>
  );
}
