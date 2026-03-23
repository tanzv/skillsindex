package web

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func TestAPISkillSyncRunsFiltersByPolicyJobStatusTriggerAndErrored(t *testing.T) {
	app, db, owner, _, _, skillA, skillB := setupSkillSyncRunsTestApp(t)
	ownerID := owner.ID
	targetSkillAID := skillA.ID
	targetSkillBID := skillB.ID

	policyOne := models.SyncPolicy{
		PolicyName:      "Skill A Policy One",
		TargetScope:     "skill:a",
		SourceType:      models.SyncPolicySourceRepository,
		CreatedByUserID: &ownerID,
		UpdatedByUserID: &ownerID,
	}
	policyTwo := models.SyncPolicy{
		PolicyName:      "Skill A Policy Two",
		TargetScope:     "skill:a-secondary",
		SourceType:      models.SyncPolicySourceRepository,
		CreatedByUserID: &ownerID,
		UpdatedByUserID: &ownerID,
	}
	if err := db.Create(&policyOne).Error; err != nil {
		t.Fatalf("failed to create policy one: %v", err)
	}
	if err := db.Create(&policyTwo).Error; err != nil {
		t.Fatalf("failed to create policy two: %v", err)
	}

	startedAt := time.Now().UTC().Add(-6 * time.Second)
	jobOne := models.AsyncJob{
		JobType:       models.AsyncJobTypeSyncRepository,
		Status:        models.AsyncJobStatusFailed,
		OwnerUserID:   &ownerID,
		ActorUserID:   &ownerID,
		TargetSkillID: &targetSkillAID,
		StartedAt:     &startedAt,
		FinishedAt:    &startedAt,
	}
	jobTwo := models.AsyncJob{
		JobType:       models.AsyncJobTypeSyncRepository,
		Status:        models.AsyncJobStatusSucceeded,
		OwnerUserID:   &ownerID,
		ActorUserID:   &ownerID,
		TargetSkillID: &targetSkillAID,
		StartedAt:     &startedAt,
		FinishedAt:    &startedAt,
	}
	if err := db.Create(&jobOne).Error; err != nil {
		t.Fatalf("failed to create job one: %v", err)
	}
	if err := db.Create(&jobTwo).Error; err != nil {
		t.Fatalf("failed to create job two: %v", err)
	}

	matchingRun, err := app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		PolicyID:      &policyOne.ID,
		JobID:         &jobOne.ID,
		Trigger:       "manual",
		TriggerType:   services.SyncRunTriggerTypeManual,
		Scope:         "owned",
		Status:        services.SyncRunStatusFailed,
		TargetSkillID: &targetSkillAID,
		OwnerUserID:   &ownerID,
		Candidates:    1,
		Failed:        1,
		ErrorSummary:  "manual failed",
		StartedAt:     startedAt,
		FinishedAt:    startedAt.Add(500 * time.Millisecond),
	})
	if err != nil {
		t.Fatalf("failed to create matching run: %v", err)
	}
	_, err = app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		PolicyID:      &policyOne.ID,
		JobID:         &jobOne.ID,
		Trigger:       "tick",
		TriggerType:   services.SyncRunTriggerTypeScheduled,
		Scope:         "owned",
		Status:        services.SyncRunStatusSucceeded,
		TargetSkillID: &targetSkillAID,
		OwnerUserID:   &ownerID,
		Candidates:    1,
		Synced:        1,
		StartedAt:     startedAt.Add(1 * time.Second),
		FinishedAt:    startedAt.Add(1500 * time.Millisecond),
	})
	if err != nil {
		t.Fatalf("failed to create non-matching trigger run: %v", err)
	}
	_, err = app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		PolicyID:      &policyTwo.ID,
		JobID:         &jobTwo.ID,
		Trigger:       "manual",
		TriggerType:   services.SyncRunTriggerTypeManual,
		Scope:         "owned",
		Status:        services.SyncRunStatusFailed,
		TargetSkillID: &targetSkillAID,
		OwnerUserID:   &ownerID,
		Candidates:    1,
		Failed:        1,
		ErrorSummary:  "different policy",
		StartedAt:     startedAt.Add(2 * time.Second),
		FinishedAt:    startedAt.Add(2500 * time.Millisecond),
	})
	if err != nil {
		t.Fatalf("failed to create non-matching policy run: %v", err)
	}
	_, err = app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		PolicyID:      &policyOne.ID,
		JobID:         &jobOne.ID,
		Trigger:       "manual",
		TriggerType:   services.SyncRunTriggerTypeManual,
		Scope:         "owned",
		Status:        services.SyncRunStatusFailed,
		TargetSkillID: &targetSkillBID,
		OwnerUserID:   &ownerID,
		Candidates:    1,
		Failed:        1,
		ErrorSummary:  "different target skill",
		StartedAt:     startedAt.Add(3 * time.Second),
		FinishedAt:    startedAt.Add(3500 * time.Millisecond),
	})
	if err != nil {
		t.Fatalf("failed to create non-matching target run: %v", err)
	}

	req := httptest.NewRequest(
		http.MethodGet,
		fmt.Sprintf(
			"/api/v1/skills/%d/sync-runs?policy_id=%d&job_id=%d&status=failed&trigger_type=manual&include_errored=true&limit=10",
			skillA.ID,
			policyOne.ID,
			jobOne.ID,
		),
		nil,
	)
	req = withCurrentUser(req, &owner)
	req = withURLParam(req, "skillID", strconv.FormatUint(uint64(skillA.ID), 10))
	recorder := httptest.NewRecorder()

	app.handleAPISkillSyncRuns(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	total, _ := payload["total"].(float64)
	if int(total) != 1 {
		t.Fatalf("unexpected total: got=%v want=1 payload=%#v", total, payload)
	}
	items, ok := payload["items"].([]any)
	if !ok || len(items) != 1 {
		t.Fatalf("unexpected items payload: %#v", payload)
	}
	item, ok := items[0].(map[string]any)
	if !ok {
		t.Fatalf("unexpected item payload: %#v", items[0])
	}
	itemID, _ := item["id"].(float64)
	if uint(itemID) != matchingRun.ID {
		t.Fatalf("unexpected run id: got=%v want=%d item=%#v", itemID, matchingRun.ID, item)
	}
}

func TestAPISkillSyncRunsRejectsInvalidTriggerType(t *testing.T) {
	app, _, owner, _, _, skillA, _ := setupSkillSyncRunsTestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/skills/1/sync-runs?trigger_type=invalid", nil)
	req = withCurrentUser(req, &owner)
	req = withURLParam(req, "skillID", strconv.FormatUint(uint64(skillA.ID), 10))
	recorder := httptest.NewRecorder()

	app.handleAPISkillSyncRuns(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_trigger_type" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
}
