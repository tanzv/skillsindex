package web

import (
	"time"

	"skillsindex/internal/models"
)

type apiSkillVersionRunSummary struct {
	ID             uint      `json:"id"`
	PolicyID       *uint     `json:"policy_id,omitempty"`
	JobID          *uint     `json:"job_id,omitempty"`
	Trigger        string    `json:"trigger"`
	TriggerType    string    `json:"trigger_type"`
	Scope          string    `json:"scope"`
	Status         string    `json:"status"`
	TargetSkillID  *uint     `json:"target_skill_id,omitempty"`
	OwnerUserID    *uint     `json:"owner_user_id,omitempty"`
	ActorUserID    *uint     `json:"actor_user_id,omitempty"`
	Attempt        int       `json:"attempt"`
	ErrorCode      string    `json:"error_code,omitempty"`
	ErrorMessage   string    `json:"error_message,omitempty"`
	ErrorSummary   string    `json:"error_summary,omitempty"`
	SourceRevision string    `json:"source_revision,omitempty"`
	StartedAt      time.Time `json:"started_at"`
	FinishedAt     time.Time `json:"finished_at"`
	DurationMs     int       `json:"duration_ms"`
}

type apiSkillVersionItem struct {
	ID               uint                       `json:"id"`
	SkillID          uint                       `json:"skill_id"`
	OwnerID          uint                       `json:"owner_id"`
	VersionNumber    int                        `json:"version_number"`
	Trigger          string                     `json:"trigger"`
	RunID            *uint                      `json:"run_id,omitempty"`
	ActorUserID      *uint                      `json:"actor_user_id,omitempty"`
	ActorUsername    string                     `json:"actor_username,omitempty"`
	ActorDisplayName string                     `json:"actor_display_name,omitempty"`
	Name             string                     `json:"name"`
	Description      string                     `json:"description"`
	Content          string                     `json:"content"`
	CategorySlug     string                     `json:"category_slug"`
	SubcategorySlug  string                     `json:"subcategory_slug"`
	Visibility       string                     `json:"visibility"`
	SourceType       string                     `json:"source_type"`
	SourceURL        string                     `json:"source_url,omitempty"`
	SourceBranch     string                     `json:"source_branch,omitempty"`
	SourcePath       string                     `json:"source_path,omitempty"`
	RepoURL          string                     `json:"repo_url,omitempty"`
	InstallCommand   string                     `json:"install_command,omitempty"`
	StarCount        int                        `json:"star_count"`
	QualityScore     float64                    `json:"quality_score"`
	Tags             []string                   `json:"tags"`
	ChangedFields    []string                   `json:"changed_fields"`
	BeforeDigest     string                     `json:"before_digest,omitempty"`
	AfterDigest      string                     `json:"after_digest,omitempty"`
	ChangeSummary    string                     `json:"change_summary,omitempty"`
	RiskLevel        string                     `json:"risk_level,omitempty"`
	ArchivedAt       *time.Time                 `json:"archived_at,omitempty"`
	ArchiveReason    string                     `json:"archive_reason,omitempty"`
	CapturedAt       time.Time                  `json:"captured_at"`
	Run              *apiSkillVersionRunSummary `json:"run,omitempty"`
}

func resultToAPISkillVersionItems(items []models.SkillVersion) []apiSkillVersionItem {
	result := make([]apiSkillVersionItem, 0, len(items))
	for _, item := range items {
		result = append(result, resultToAPISkillVersionItem(item))
	}
	return result
}

func resultToAPISkillVersionItem(item models.SkillVersion) apiSkillVersionItem {
	actorUsername := ""
	actorDisplayName := ""
	if item.ActorUser != nil {
		actorUsername = item.ActorUser.Username
		actorDisplayName = item.ActorUser.DisplayName
	}

	return apiSkillVersionItem{
		ID:               item.ID,
		SkillID:          item.SkillID,
		OwnerID:          item.OwnerID,
		VersionNumber:    item.VersionNumber,
		Trigger:          item.Trigger,
		RunID:            item.RunID,
		ActorUserID:      item.ActorUserID,
		ActorUsername:    actorUsername,
		ActorDisplayName: actorDisplayName,
		Name:             item.Name,
		Description:      item.Description,
		Content:          item.Content,
		CategorySlug:     item.CategorySlug,
		SubcategorySlug:  item.SubcategorySlug,
		Visibility:       string(item.Visibility),
		SourceType:       string(item.SourceType),
		SourceURL:        item.SourceURL,
		SourceBranch:     item.SourceBranch,
		SourcePath:       item.SourcePath,
		RepoURL:          item.RepoURL,
		InstallCommand:   item.InstallCommand,
		StarCount:        item.StarCount,
		QualityScore:     item.QualityScore,
		Tags:             parseStringArray(item.TagsJSON),
		ChangedFields:    parseStringArray(item.ChangedFieldsJSON),
		BeforeDigest:     item.BeforeDigest,
		AfterDigest:      item.AfterDigest,
		ChangeSummary:    item.ChangeSummary,
		RiskLevel:        item.RiskLevel,
		ArchivedAt:       item.ArchivedAt,
		ArchiveReason:    item.ArchiveReason,
		CapturedAt:       item.CapturedAt,
		Run:              resultToAPISkillVersionRunSummary(item.Run),
	}
}

func resultToAPISkillVersionRunSummary(run *models.SyncJobRun) *apiSkillVersionRunSummary {
	if run == nil {
		return nil
	}
	return &apiSkillVersionRunSummary{
		ID:             run.ID,
		PolicyID:       run.PolicyID,
		JobID:          run.JobID,
		Trigger:        run.Trigger,
		TriggerType:    run.TriggerType,
		Scope:          run.Scope,
		Status:         run.Status,
		TargetSkillID:  run.TargetSkillID,
		OwnerUserID:    run.OwnerUserID,
		ActorUserID:    run.ActorUserID,
		Attempt:        run.Attempt,
		ErrorCode:      run.ErrorCode,
		ErrorMessage:   run.ErrorMessage,
		ErrorSummary:   run.ErrorSummary,
		SourceRevision: run.SourceRevision,
		StartedAt:      run.StartedAt,
		FinishedAt:     run.FinishedAt,
		DurationMs:     run.DurationMs,
	}
}
