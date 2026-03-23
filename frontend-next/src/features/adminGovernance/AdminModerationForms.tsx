import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";

import type { ModerationCaseItem } from "./moderationModel";

export interface CreateModerationDraft {
  reporterUserId: string;
  targetType: string;
  skillId: string;
  commentId: string;
  reasonCode: string;
  reasonDetail: string;
}

export interface ResolveModerationDraft {
  action: string;
  resolutionNote: string;
  rejectionNote: string;
}

export function CreateModerationCaseForm({
  createDraft,
  busyAction,
  onCreateDraftChange,
  onCreateCase
}: {
  createDraft: CreateModerationDraft;
  busyAction: string;
  onCreateDraftChange: (patch: Partial<CreateModerationDraft>) => void;
  onCreateCase: () => void;
}) {
  const { messages } = useProtectedI18n();
  const moderationMessages = messages.adminModeration;

  return (
    <div className="space-y-3">
      <Input
        aria-label={moderationMessages.reporterUserIdLabel}
        value={createDraft.reporterUserId}
        placeholder={moderationMessages.reporterUserIdPlaceholder}
        onChange={(event) => onCreateDraftChange({ reporterUserId: event.target.value })}
      />
      <Select
        aria-label={moderationMessages.targetTypeLabel}
        value={createDraft.targetType}
        onChange={(event) => onCreateDraftChange({ targetType: event.target.value })}
      >
        <option value="skill">{moderationMessages.targetTypeSkill}</option>
        <option value="comment">{moderationMessages.targetTypeComment}</option>
      </Select>
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          aria-label={moderationMessages.skillIdLabel}
          value={createDraft.skillId}
          placeholder={moderationMessages.skillIdPlaceholder}
          onChange={(event) => onCreateDraftChange({ skillId: event.target.value })}
        />
        <Input
          aria-label={moderationMessages.commentIdLabel}
          value={createDraft.commentId}
          placeholder={moderationMessages.commentIdPlaceholder}
          onChange={(event) => onCreateDraftChange({ commentId: event.target.value })}
        />
      </div>
      <Input
        aria-label={moderationMessages.reasonCodeLabel}
        value={createDraft.reasonCode}
        placeholder={moderationMessages.reasonCodePlaceholder}
        onChange={(event) => onCreateDraftChange({ reasonCode: event.target.value })}
      />
      <Textarea
        aria-label={moderationMessages.reasonDetailLabel}
        className="min-h-24"
        value={createDraft.reasonDetail}
        placeholder={moderationMessages.reasonDetailPlaceholder}
        onChange={(event) => onCreateDraftChange({ reasonDetail: event.target.value })}
      />
      <Button onClick={onCreateCase} disabled={Boolean(busyAction)}>
        {busyAction === "create-case" ? moderationMessages.creatingAction : moderationMessages.createAction}
      </Button>
    </div>
  );
}

export function ModerationDispositionForm({
  resolveDraft,
  busyAction,
  selectedCase,
  onResolveDraftChange,
  onResolveCase,
  onRejectCase
}: {
  resolveDraft: ResolveModerationDraft;
  busyAction: string;
  selectedCase: ModerationCaseItem | null;
  onResolveDraftChange: (patch: Partial<ResolveModerationDraft>) => void;
  onResolveCase: () => void;
  onRejectCase: () => void;
}) {
  const { messages } = useProtectedI18n();
  const moderationMessages = messages.adminModeration;

  return (
    <div className="space-y-3">
      <Select
        aria-label={moderationMessages.resolutionActionLabel}
        value={resolveDraft.action}
        onChange={(event) => onResolveDraftChange({ action: event.target.value })}
      >
        <option value="flagged">{moderationMessages.resolutionActionFlagged}</option>
        <option value="hidden">{moderationMessages.resolutionActionHidden}</option>
        <option value="deleted">{moderationMessages.resolutionActionDeleted}</option>
      </Select>
      <Textarea
        aria-label={moderationMessages.resolutionNoteLabel}
        className="min-h-24"
        value={resolveDraft.resolutionNote}
        placeholder={moderationMessages.resolutionNotePlaceholder}
        onChange={(event) => onResolveDraftChange({ resolutionNote: event.target.value })}
      />
      <Textarea
        aria-label={moderationMessages.rejectionNoteLabel}
        className="min-h-24"
        value={resolveDraft.rejectionNote}
        placeholder={moderationMessages.rejectionNotePlaceholder}
        onChange={(event) => onResolveDraftChange({ rejectionNote: event.target.value })}
      />
      <div className="flex flex-wrap gap-3">
        <Button onClick={onResolveCase} disabled={Boolean(busyAction) || !selectedCase}>
          {busyAction === "resolve-case" ? moderationMessages.resolvingAction : moderationMessages.resolveAction}
        </Button>
        <Button variant="outline" onClick={onRejectCase} disabled={Boolean(busyAction) || !selectedCase}>
          {busyAction === "reject-case" ? moderationMessages.rejectingAction : moderationMessages.rejectAction}
        </Button>
      </div>
    </div>
  );
}
