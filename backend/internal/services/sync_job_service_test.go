package services

import (
	"context"
	"errors"
	"testing"
	"time"

	"skillsindex/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupSyncJobServiceTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open db: %v", err)
	}
	if err := db.AutoMigrate(&models.User{}, &models.SyncPolicy{}, &models.AsyncJob{}, &models.SyncJobRun{}); err != nil {
		t.Fatalf("failed to migrate sync job models: %v", err)
	}
	return db
}

func TestSyncJobServiceRecordRunPersistsTargetSkillID(t *testing.T) {
	db := setupSyncJobServiceTestDB(t)
	svc := NewSyncJobService(db)

	user := models.User{Username: "sync-admin", PasswordHash: "hash", Role: models.RoleAdmin}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	startedAt := time.Now().UTC().Add(-3 * time.Second)
	finishedAt := time.Now().UTC()
	targetSkillID := uint(42)
	_, err := svc.RecordRun(context.Background(), RecordSyncRunInput{
		Trigger:       "manual",
		Scope:         "all",
		ActorUserID:   &user.ID,
		TargetSkillID: &targetSkillID,
		Candidates:    8,
		Synced:        6,
		Failed:        2,
		StartedAt:     startedAt,
		FinishedAt:    finishedAt,
		ErrorSummary:  "skill=3 clone failed",
	})
	if err != nil {
		t.Fatalf("failed to record run: %v", err)
	}

	items, err := svc.ListRuns(context.Background(), ListSyncRunsInput{Limit: 10})
	if err != nil {
		t.Fatalf("failed to list sync runs: %v", err)
	}
	if len(items) != 1 {
		t.Fatalf("unexpected sync run count: got=%d want=1", len(items))
	}
	if items[0].Status != "partial" {
		t.Fatalf("unexpected sync run status: got=%s want=partial", items[0].Status)
	}
	if items[0].DurationMs <= 0 {
		t.Fatalf("expected positive duration")
	}
	if items[0].TargetSkillID == nil {
		t.Fatalf("expected target skill id to be persisted")
	}
	if *items[0].TargetSkillID != targetSkillID {
		t.Fatalf("unexpected target skill id: got=%d want=%d", *items[0].TargetSkillID, targetSkillID)
	}
}

func TestSyncJobServiceRecordRunFailsWhenOnlyErrorSummaryExists(t *testing.T) {
	db := setupSyncJobServiceTestDB(t)
	svc := NewSyncJobService(db)

	recorded, err := svc.RecordRun(context.Background(), RecordSyncRunInput{
		Trigger:      "manual",
		Scope:        "single",
		Candidates:   1,
		Synced:       0,
		Failed:       0,
		ErrorSummary: "repository clone failed",
		StartedAt:    time.Now().UTC().Add(-2 * time.Second),
		FinishedAt:   time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to record run: %v", err)
	}
	if recorded.Status != SyncRunStatusFailed {
		t.Fatalf("unexpected sync run status: got=%s want=%s", recorded.Status, SyncRunStatusFailed)
	}
}

func TestSyncJobServiceListRunsFiltersByTargetSkillID(t *testing.T) {
	db := setupSyncJobServiceTestDB(t)
	svc := NewSyncJobService(db)

	user := models.User{Username: "sync-filter", PasswordHash: "hash", Role: models.RoleAdmin}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	skillIDOne := uint(101)
	skillIDTwo := uint(202)

	_, err := svc.RecordRun(context.Background(), RecordSyncRunInput{
		Trigger:       "manual",
		Scope:         "all",
		OwnerUserID:   &user.ID,
		TargetSkillID: &skillIDOne,
		Candidates:    3,
		Synced:        3,
		StartedAt:     time.Now().UTC().Add(-5 * time.Second),
		FinishedAt:    time.Now().UTC().Add(-4 * time.Second),
	})
	if err != nil {
		t.Fatalf("failed to record first run: %v", err)
	}

	_, err = svc.RecordRun(context.Background(), RecordSyncRunInput{
		Trigger:       "manual",
		Scope:         "all",
		OwnerUserID:   &user.ID,
		TargetSkillID: &skillIDTwo,
		Candidates:    2,
		Synced:        2,
		StartedAt:     time.Now().UTC().Add(-3 * time.Second),
		FinishedAt:    time.Now().UTC().Add(-2 * time.Second),
	})
	if err != nil {
		t.Fatalf("failed to record second run: %v", err)
	}

	_, err = svc.RecordRun(context.Background(), RecordSyncRunInput{
		Trigger:     "manual",
		Scope:       "all",
		OwnerUserID: &user.ID,
		Candidates:  1,
		Synced:      1,
		StartedAt:   time.Now().UTC().Add(-1 * time.Second),
		FinishedAt:  time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to record run without target skill: %v", err)
	}

	filteredItems, err := svc.ListRuns(context.Background(), ListSyncRunsInput{
		OwnerUserID:   &user.ID,
		TargetSkillID: &skillIDTwo,
		Limit:         10,
	})
	if err != nil {
		t.Fatalf("failed to list filtered runs: %v", err)
	}
	if len(filteredItems) != 1 {
		t.Fatalf("unexpected filtered count: got=%d want=1", len(filteredItems))
	}
	if filteredItems[0].TargetSkillID == nil || *filteredItems[0].TargetSkillID != skillIDTwo {
		t.Fatalf("unexpected target skill in filtered result")
	}

	zero := uint(0)
	unfilteredItems, err := svc.ListRuns(context.Background(), ListSyncRunsInput{
		OwnerUserID:   &user.ID,
		TargetSkillID: &zero,
		Limit:         10,
	})
	if err != nil {
		t.Fatalf("failed to list unfiltered runs: %v", err)
	}
	if len(unfilteredItems) != 3 {
		t.Fatalf("unexpected unfiltered count: got=%d want=3", len(unfilteredItems))
	}
}

func TestSyncJobServiceGetRunByID(t *testing.T) {
	db := setupSyncJobServiceTestDB(t)
	svc := NewSyncJobService(db)

	recorded, err := svc.RecordRun(context.Background(), RecordSyncRunInput{
		Trigger:      "scheduler",
		Scope:        "all",
		Candidates:   5,
		Synced:       5,
		Failed:       0,
		StartedAt:    time.Now().UTC().Add(-2 * time.Second),
		FinishedAt:   time.Now().UTC(),
		ErrorSummary: "",
	})
	if err != nil {
		t.Fatalf("failed to record run: %v", err)
	}

	item, err := svc.GetRunByID(context.Background(), recorded.ID)
	if err != nil {
		t.Fatalf("failed to get run by id: %v", err)
	}
	if item.ID != recorded.ID {
		t.Fatalf("unexpected run id: got=%d want=%d", item.ID, recorded.ID)
	}

	_, err = svc.GetRunByID(context.Background(), recorded.ID+999)
	if !errors.Is(err, ErrSyncRunNotFound) {
		t.Fatalf("expected ErrSyncRunNotFound, got: %v", err)
	}
}

func TestSyncJobServiceRecordRunPersistsUnifiedFields(t *testing.T) {
	db := setupSyncJobServiceTestDB(t)
	svc := NewSyncJobService(db)

	owner := models.User{Username: "sync-owner", PasswordHash: "hash", Role: models.RoleMember}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}
	policy := models.SyncPolicy{
		PolicyName:      "Repository scheduled",
		TargetScope:     "source:repository",
		SourceType:      models.SyncPolicySourceRepository,
		IntervalMinutes: 30,
		Timezone:        "UTC",
		Enabled:         true,
	}
	if err := db.Create(&policy).Error; err != nil {
		t.Fatalf("failed to create policy: %v", err)
	}
	job := models.AsyncJob{
		JobType:     models.AsyncJobTypeSyncRepository,
		Status:      models.AsyncJobStatusPending,
		OwnerUserID: &owner.ID,
		Attempt:     1,
		MaxAttempts: 3,
	}
	if err := db.Create(&job).Error; err != nil {
		t.Fatalf("failed to create job: %v", err)
	}

	run, err := svc.RecordRun(context.Background(), RecordSyncRunInput{
		PolicyID:       &policy.ID,
		JobID:          &job.ID,
		Trigger:        "scheduled",
		TriggerType:    "scheduled",
		Scope:          "source:repository",
		Status:         "failed",
		OwnerUserID:    &owner.ID,
		Attempt:        2,
		ErrorCode:      "clone_failed",
		ErrorMessage:   "repository clone timeout",
		ErrorSummary:   "repository clone timeout",
		SourceRevision: "abc123",
		StartedAt:      time.Now().UTC().Add(-2 * time.Second),
		FinishedAt:     time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to record unified run: %v", err)
	}
	if run.PolicyID == nil || *run.PolicyID != policy.ID {
		t.Fatalf("expected policy id to be persisted")
	}
	if run.JobID == nil || *run.JobID != job.ID {
		t.Fatalf("expected job id to be persisted")
	}
	if run.TriggerType != "scheduled" {
		t.Fatalf("unexpected trigger type: %s", run.TriggerType)
	}
	if run.Attempt != 2 {
		t.Fatalf("unexpected attempt: %d", run.Attempt)
	}
	if run.ErrorCode != "clone_failed" {
		t.Fatalf("unexpected error code: %s", run.ErrorCode)
	}
	if run.SourceRevision != "abc123" {
		t.Fatalf("unexpected source revision: %s", run.SourceRevision)
	}
}

func TestSyncJobServiceStartAndFinalizeRunLifecycle(t *testing.T) {
	db := setupSyncJobServiceTestDB(t)
	svc := NewSyncJobService(db)

	startedAt := time.Now().UTC().Add(-4 * time.Second)
	run, err := svc.StartRun(context.Background(), StartSyncRunInput{
		Trigger:   "tick",
		Scope:     "all",
		Attempt:   1,
		StartedAt: startedAt,
	})
	if err != nil {
		t.Fatalf("failed to start run: %v", err)
	}
	if run.Status != SyncRunStatusRunning {
		t.Fatalf("unexpected started run status: %s", run.Status)
	}
	if run.TriggerType != SyncRunTriggerTypeScheduled {
		t.Fatalf("unexpected trigger type: %s", run.TriggerType)
	}

	finished, err := svc.FinalizeRun(context.Background(), run.ID, FinishSyncRunInput{
		Candidates:   3,
		Synced:       2,
		Failed:       1,
		FinishedAt:   startedAt.Add(4 * time.Second),
		ErrorSummary: "one skill failed",
	})
	if err != nil {
		t.Fatalf("failed to finalize run: %v", err)
	}
	if finished.Status != SyncRunStatusPartial {
		t.Fatalf("unexpected finalized status: %s", finished.Status)
	}
	if finished.DurationMs <= 0 {
		t.Fatalf("expected positive duration")
	}
}
