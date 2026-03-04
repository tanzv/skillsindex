import { SkillDetailCopy } from "./PublicSkillDetailPage.copy";
import { SkillDetailViewModel } from "./PublicSkillDetailPage.helpers";

type FilePresetKey = "skill" | "readme" | "changelog";

interface PublicSkillDetailFileBrowserProps {
  activePreset: FilePresetKey;
  detailModel: SkillDetailViewModel;
  selectedFileIndex: number;
  selectedFileName: string;
  selectedFilePath: string;
  selectedPresetLabel: string;
  text: SkillDetailCopy;
  onCopyPath: () => void;
  onOpenSource: () => void;
  onPresetSwitch: (preset: FilePresetKey) => void;
  onSelectFile: (index: number) => void;
}

export default function PublicSkillDetailFileBrowser({
  activePreset,
  detailModel,
  selectedFileIndex,
  selectedFileName,
  selectedFilePath,
  selectedPresetLabel,
  text,
  onCopyPath,
  onOpenSource,
  onPresetSwitch,
  onSelectFile
}: PublicSkillDetailFileBrowserProps) {
  const selectedEntry = detailModel.fileEntries[selectedFileIndex] || detailModel.fileEntries[0];
  const previewContent = detailModel.presetPreviewContent[activePreset] || detailModel.fileCodePreview;
  const normalizedFileName = String(selectedEntry?.name || selectedFileName).toLowerCase();
  const skillLanguageLabel = normalizedFileName.endsWith(".sql") || detailModel.codePanelTone === "sql" ? "SQL" : detailModel.previewLanguage;
  const languageLabel = activePreset === "skill" ? skillLanguageLabel : "Markdown";
  const isSQLPreview = activePreset === "skill" && (detailModel.codePanelTone === "sql" || languageLabel === "SQL");
  const selectedFileInfo = detailModel.fileInfo.replace(/SKILL\.md/g, selectedFileName);
  const filePathLabel = (text.filePathHint.split(":")[0] || "Path").trim();
  const resolvedFilePathHint = `${filePathLabel}: ${selectedFilePath}`;

  return (
    <div className="skill-detail-left-col">
      <article className="skill-detail-card is-summary">
        <div className="skill-detail-summary-head">
          <div className="skill-detail-summary-title-group">
            <p className="skill-detail-summary-title">{detailModel.titleName}</p>
            <p className="skill-detail-summary-subtitle">{detailModel.breadcrumb}</p>
          </div>
          <div className="skill-detail-summary-badges">
            <span className="skill-detail-chip is-light">{text.officialVerified}</span>
            <span className="skill-detail-chip is-warning">{text.riskFlag}</span>
          </div>
        </div>
        <p className="skill-detail-summary-description">{detailModel.summaryDescription}</p>
        <div className="skill-detail-summary-metrics">
          {detailModel.summaryMetrics.map((metric) => (
            <div className="skill-detail-summary-metric" key={metric.label}>
              <span className="skill-detail-summary-metric-label">{metric.label}</span>
              <span className="skill-detail-summary-metric-value">{metric.value}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="skill-detail-card is-quality">
        <div className="skill-detail-card-title">
          <span className="skill-detail-title-dot" />
          <span>{text.qualityHealth}</span>
        </div>
        <div className="skill-detail-quality-metrics">
          {detailModel.qualityMetrics.map((metric) => (
            <div className="skill-detail-quality-metric" key={metric.label}>
              <span className="skill-detail-quality-metric-label">{metric.label}</span>
              <span className="skill-detail-quality-metric-value">{metric.value}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="skill-detail-card is-file-tree">
        <div className="skill-detail-file-head">
          <div className="skill-detail-card-title">
            <span className="skill-detail-title-dot" />
            <span>{text.fileBrowserTitle}</span>
          </div>
          <span className="skill-detail-file-selected">{text.fileSelectedHint.replace("SKILL.md", selectedPresetLabel)}</span>
        </div>

        <div className="skill-detail-file-browser-row">
          <div className="skill-detail-file-list-panel">
            <span className="skill-detail-file-list-root">{`${detailModel.repositorySlug}/`}</span>
            {detailModel.fileEntries.map((entry, index) => (
              <button
                type="button"
                key={`${entry.name}-${entry.size}`}
                className={`skill-detail-file-row${index === selectedFileIndex ? " is-active" : ""}`}
                onClick={() => onSelectFile(index)}
              >
                <span>{entry.displayName || entry.name}</span>
                <span>{entry.size}</span>
              </button>
            ))}
            <span className="skill-detail-file-hint">{text.fileHint}</span>
          </div>

          <div className="skill-detail-file-info-panel">
            <h3 className="skill-detail-file-info-title">{text.fileInfoTitle}</h3>
            <p className="skill-detail-file-info-text">{selectedFileInfo}</p>
            <div className="skill-detail-file-info-actions">
              <button type="button" onClick={onOpenSource}>
                {text.openOriginal}
              </button>
              <button type="button" onClick={onCopyPath}>
                {text.copyPath}
              </button>
            </div>
            <span className="skill-detail-file-sync">{text.fileSynced}</span>
          </div>
        </div>

        <div className="skill-detail-code-head">
          <p className="skill-detail-file-state-hint">{resolvedFilePathHint}</p>
          <p className="skill-detail-file-state-meta">{`${text.fileSourceHint} · ${languageLabel}`}</p>
        </div>

        <div className="skill-detail-file-preset-row">
          <button type="button" className={`skill-detail-file-preset${activePreset === "skill" ? " is-active" : ""}`} onClick={() => onPresetSwitch("skill")}>
            SKILL.md
          </button>
          <button type="button" className={`skill-detail-file-preset${activePreset === "readme" ? " is-active" : ""}`} onClick={() => onPresetSwitch("readme")}>
            README.md
          </button>
          <button
            type="button"
            className={`skill-detail-file-preset${activePreset === "changelog" ? " is-active" : ""}`}
            onClick={() => onPresetSwitch("changelog")}
          >
            CHANGELOG.md
          </button>
        </div>

        <div className="skill-detail-file-state-row">
          <p className="skill-detail-file-state-hint">{text.presetHint}</p>
          <p className="skill-detail-file-state-meta">{text.fileSynced}</p>
          <span className="skill-detail-file-state-badge">{text.switchable}</span>
        </div>

        <div className={`skill-detail-code-panel${isSQLPreview ? " is-sql" : ""}`}>
          <pre className="skill-detail-code-content">{previewContent}</pre>
        </div>

        <div className="skill-detail-code-foot">
          <span>{text.filePrevNextHint}</span>
          <span>{text.fileDiffHint}</span>
        </div>
      </article>
    </div>
  );
}
