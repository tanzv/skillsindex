package web

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) handleRepositorySyncBatch(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectDashboard(w, r, "", "Invalid form payload")
		return
	}

	limit := parsePositiveInt(r.FormValue("limit"), 50)
	var ownerID *uint
	scope := strings.ToLower(strings.TrimSpace(r.FormValue("scope")))
	if !user.CanViewAllSkills() || strings.EqualFold(scope, "owned") {
		ownerID = &user.ID
	}
	if scope == "" {
		if ownerID != nil {
			scope = "owned"
		} else {
			scope = "all"
		}
	}

	startedAt := time.Now().UTC()
	batchRunner := a.repositorySyncBatchRunner()
	if batchRunner == nil {
		redirectDashboard(w, r, "", "Repository sync runner unavailable")
		return
	}

	var execution services.SyncGovernanceExecution
	legacyAsyncJobID := uint(0)
	if a.syncGovernanceSvc != nil {
		startedExecution, startErr := a.syncGovernanceSvc.Start(r.Context(), services.StartSyncGovernanceInput{
			JobType:       models.AsyncJobTypeSyncRepository,
			Trigger:       "manual",
			TriggerType:   services.SyncRunTriggerTypeManual,
			Scope:         scope,
			OwnerUserID:   ownerID,
			ActorUserID:   &user.ID,
			MaxAttempts:   3,
			PayloadDigest: fmt.Sprintf("manual:sync_repository:%s:%d", scope, limit),
			StartedAt:     startedAt,
		})
		if startErr != nil {
			redirectDashboard(w, r, "", "Failed to start repository sync job")
			return
		}
		if startedExecution.Deduped {
			redirectDashboard(w, r, "", "A matching repository sync job is already running")
			return
		}
		execution = startedExecution
	} else if a.asyncJobSvc != nil {
		created, _, createErr := a.asyncJobSvc.CreateOrGetActive(r.Context(), services.CreateAsyncJobInput{
			JobType:       models.AsyncJobTypeSyncRepository,
			OwnerUserID:   ownerID,
			ActorUserID:   &user.ID,
			MaxAttempts:   3,
			PayloadDigest: fmt.Sprintf("manual:sync_repository:%s:%d", scope, limit),
		}, startedAt)
		if createErr == nil {
			legacyAsyncJobID = created.ID
			if _, startErr := a.asyncJobSvc.Start(r.Context(), legacyAsyncJobID, startedAt); startErr != nil && !errors.Is(startErr, services.ErrAsyncJobInvalidTransition) {
				legacyAsyncJobID = 0
			}
		}
	}

	summary, err := batchRunner(r.Context(), ownerID, nil, limit)
	finishedAt := time.Now().UTC()
	a.completeRepositorySyncBatchGovernance(r, execution, legacyAsyncJobID, ownerID, user.ID, scope, summary, startedAt, finishedAt, err)
	if err != nil {
		redirectDashboard(w, r, "", "Repository sync batch failed: "+err.Error())
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "repository_sync_batch",
		TargetType: "repository",
		TargetID:   0,
		Summary:    "Executed manual repository sync batch",
		Details: auditDetailsJSON(map[string]string{
			"scope":      scope,
			"candidates": strconv.Itoa(summary.Candidates),
			"synced":     strconv.Itoa(summary.Synced),
			"failed":     strconv.Itoa(summary.Failed),
		}),
	})

	message := fmt.Sprintf(
		"Repository sync finished: candidates=%d synced=%d failed=%d",
		summary.Candidates,
		summary.Synced,
		summary.Failed,
	)
	if summary.Failed > 0 && len(summary.Errors) > 0 {
		redirectDashboard(w, r, message, summary.Errors[0])
		return
	}
	redirectDashboard(w, r, message, "")
}

func (a *App) repositorySyncBatchRunner() func(
	context.Context,
	*uint,
	*time.Time,
	int,
) (services.RepositorySyncSummary, error) {
	if a == nil {
		return nil
	}
	if a.repoSyncBatchRunner != nil {
		return a.repoSyncBatchRunner
	}
	return nil
}
