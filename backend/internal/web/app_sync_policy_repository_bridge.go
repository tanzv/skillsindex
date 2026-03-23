package web

import (
	"context"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) syncRepositoryMirrorSettings(ctx context.Context, item models.SyncPolicy) error {
	if a == nil || a.syncPolicyService == nil {
		return nil
	}
	if item.SourceType != models.SyncPolicySourceRepository || item.TargetScope != services.RepositorySyncPolicyMirrorTargetScope {
		return nil
	}

	input := services.UpdateRepositorySyncPolicyInput{
		Enabled: &item.Enabled,
	}
	if item.IntervalMinutes > 0 {
		interval := time.Duration(item.IntervalMinutes) * time.Minute
		input.Interval = &interval
	}
	if item.TimeoutMinutes > 0 {
		timeout := time.Duration(item.TimeoutMinutes) * time.Minute
		input.Timeout = &timeout
	}
	if item.BatchSize > 0 {
		batchSize := item.BatchSize
		input.BatchSize = &batchSize
	}
	_, err := a.syncPolicyService.Update(ctx, input)
	return err
}
