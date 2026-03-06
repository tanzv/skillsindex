import type { ReactNode } from "react";
import { SkillDetailCopy } from "./PublicSkillDetailPage.copy";
import { SkillDetailViewModel } from "./PublicSkillDetailPage.helpers";

type FilePresetKey = "skill" | "readme" | "changelog";

interface PublicSkillDetailFileBrowserProps {
  activePreset: FilePresetKey;
  detailModel: SkillDetailViewModel;
  selectedFileIndex: number;
  selectedFileName: string;
  selectedFilePath: string;
  text: SkillDetailCopy;
  onCopyPath: () => void;
  onOpenSource: () => void;
}

type DocumentHeadingLevel = 1 | 2 | 3;

type DocumentBlock =
  | { type: "heading"; level: DocumentHeadingLevel; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "keyValue"; key: string; value: string }
  | { type: "divider" };

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

function resolveDocumentBlocks(rawContent: string): DocumentBlock[] {
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

function resolveEnrichedDocumentBlocks(
  blocks: DocumentBlock[],
  activePreset: FilePresetKey,
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

export default function PublicSkillDetailFileBrowser({
  activePreset,
  detailModel,
  selectedFileIndex,
  selectedFileName,
  selectedFilePath,
  text,
  onCopyPath,
  onOpenSource
}: PublicSkillDetailFileBrowserProps) {
  const selectedEntry = detailModel.fileEntries[selectedFileIndex] || detailModel.fileEntries[0];
  const filePathLabel = (text.filePathHint.split(":")[0] || "Path").trim();
  const resolvedFilePathHint = `${filePathLabel}: ${selectedFilePath}`;
  const previewContent = detailModel.presetPreviewContent[activePreset] || detailModel.fileCodePreview;
  const normalizedFileName = String(selectedEntry?.name || selectedFileName).toLowerCase();
  const activeSkillLanguage =
    normalizedFileName.endsWith(".sql") || detailModel.codePanelTone === "sql" ? "SQL" : detailModel.previewLanguage;
  const activeLanguage = activePreset === "skill" ? activeSkillLanguage : "Markdown";
  const isSQLPreview = activePreset === "skill" && (detailModel.codePanelTone === "sql" || activeLanguage === "SQL");
  const isDocumentPreview = !isSQLPreview;
  const rawDocumentBlocks = isDocumentPreview ? resolveDocumentBlocks(previewContent) : [];
  const documentBlocks = isDocumentPreview
    ? resolveEnrichedDocumentBlocks(rawDocumentBlocks, activePreset, detailModel.titleName, detailModel.summaryDescription)
    : [];

  return (
    <div className="skill-detail-left-col">
      <article id="skill-detail-file-content" className="skill-detail-card is-file-tree is-preview-only">
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
          <p className="skill-detail-file-state-hint">{resolvedFilePathHint}</p>
          <p className="skill-detail-file-state-meta">{`${text.fileSourceHint} · ${activeLanguage}`}</p>
        </div>

        <div className={`skill-detail-code-panel${isSQLPreview ? " is-sql" : ""}${isDocumentPreview ? " is-document" : ""}`}>
          {isDocumentPreview ? (
            <div className="skill-detail-code-content skill-detail-doc-content">{documentBlocks.map((block, index) => renderDocumentBlock(block, index))}</div>
          ) : (
            <pre className="skill-detail-code-content">{previewContent}</pre>
          )}
        </div>
      </article>
    </div>
  );
}
