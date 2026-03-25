package web

import (
	"context"
	"time"

	"skillsindex/internal/services"
)

type syncRuntimeDependencies struct {
	asyncJobSvc         *services.AsyncJobService
	syncJobSvc          *services.SyncJobService
	syncGovernanceSvc   *services.SyncGovernanceService
	repositoryService   *services.RepositorySyncService
	repoSyncBatchRunner func(context.Context, *uint, *time.Time, int) (services.RepositorySyncSummary, error)
	syncPolicyService   *services.RepositorySyncPolicyService
	syncPolicyRecordSvc *services.SyncPolicyService
}

// SyncDependencies groups sync-domain services for web-layer assembly.
type SyncDependencies struct {
	AsyncJobService           *services.AsyncJobService
	SyncJobService            *services.SyncJobService
	SyncGovernanceService     *services.SyncGovernanceService
	RepositoryService         *services.RepositorySyncService
	RepositorySyncCoordinator *services.RepositorySyncCoordinator
	SyncPolicyService         *services.RepositorySyncPolicyService
	SyncPolicyRecordSvc       *services.SyncPolicyService
}

func (d SyncDependencies) runtimeDependencies() syncRuntimeDependencies {
	var repoSyncBatchRunner func(context.Context, *uint, *time.Time, int) (services.RepositorySyncSummary, error)
	if d.RepositorySyncCoordinator != nil {
		repoSyncBatchRunner = d.RepositorySyncCoordinator.SyncBatch
	}

	return syncRuntimeDependencies{
		asyncJobSvc:         d.AsyncJobService,
		syncJobSvc:          d.SyncJobService,
		syncGovernanceSvc:   d.SyncGovernanceService,
		repositoryService:   d.RepositoryService,
		repoSyncBatchRunner: repoSyncBatchRunner,
		syncPolicyService:   d.SyncPolicyService,
		syncPolicyRecordSvc: d.SyncPolicyRecordSvc,
	}
}
