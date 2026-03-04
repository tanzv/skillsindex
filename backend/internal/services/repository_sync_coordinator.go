package services

import (
	"context"
	"fmt"
	"strings"
	"time"

	"skillsindex/internal/models"
)

// RepositorySyncSummary reports the result of a batch repository sync run.
type RepositorySyncSummary struct {
	Candidates int
	Synced     int
	Failed     int
	Errors     []string
}

// RepositorySyncCoordinator orchestrates repository sync operations for multiple skills.
type RepositorySyncCoordinator struct {
	skillService      *SkillService
	repositoryService *RepositorySyncService
}

// NewRepositorySyncCoordinator creates a coordinator for repository synchronization workflows.
func NewRepositorySyncCoordinator(
	skillService *SkillService,
	repositoryService *RepositorySyncService,
) *RepositorySyncCoordinator {
	return &RepositorySyncCoordinator{
		skillService:      skillService,
		repositoryService: repositoryService,
	}
}

// SyncBatch synchronizes repository-based skills matching the provided scope.
func (c *RepositorySyncCoordinator) SyncBatch(
	ctx context.Context,
	ownerID *uint,
	dueBefore *time.Time,
	limit int,
) (RepositorySyncSummary, error) {
	if c == nil || c.skillService == nil || c.repositoryService == nil {
		return RepositorySyncSummary{}, fmt.Errorf("repository sync coordinator is not initialized")
	}

	skills, err := c.skillService.ListRepositorySkillsForSync(ctx, ownerID, dueBefore, limit)
	if err != nil {
		return RepositorySyncSummary{}, err
	}

	summary := RepositorySyncSummary{
		Candidates: len(skills),
	}
	for _, skill := range skills {
		source := RepoSource{
			URL:    strings.TrimSpace(skill.SourceURL),
			Branch: strings.TrimSpace(skill.SourceBranch),
			Path:   strings.TrimSpace(skill.SourcePath),
		}
		meta, syncErr := c.repositoryService.CloneAndExtract(ctx, source)
		if syncErr != nil {
			summary.Failed++
			summary.Errors = appendSyncError(summary.Errors, skill.ID, syncErr.Error())
			continue
		}

		_, updateErr := c.skillService.UpdateSyncedSkill(ctx, SyncUpdateInput{
			SkillID:      skill.ID,
			OwnerID:      skill.OwnerID,
			SourceType:   models.SourceTypeRepository,
			SourceURL:    source.URL,
			SourceBranch: source.Branch,
			SourcePath:   source.Path,
			Meta:         meta,
		})
		if updateErr != nil {
			summary.Failed++
			summary.Errors = appendSyncError(summary.Errors, skill.ID, updateErr.Error())
			continue
		}
		summary.Synced++
	}

	return summary, nil
}

func appendSyncError(errors []string, skillID uint, raw string) []string {
	if len(errors) >= 10 {
		return errors
	}
	message := strings.TrimSpace(raw)
	if message == "" {
		message = "unknown error"
	}
	message = strings.Join(strings.Fields(message), " ")
	if len(message) > 220 {
		message = message[:217] + "..."
	}
	return append(errors, fmt.Sprintf("skill=%d %s", skillID, message))
}
