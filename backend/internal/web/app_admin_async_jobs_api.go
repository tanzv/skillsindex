package web

import (
	"time"

	"skillsindex/internal/models"
)

type apiAdminAsyncJobItem struct {
	ID               uint       `json:"id"`
	JobType          string     `json:"job_type"`
	Status           string     `json:"status"`
	OwnerUserID      *uint      `json:"owner_user_id"`
	ActorUserID      *uint      `json:"actor_user_id"`
	CanceledByUserID *uint      `json:"canceled_by_user_id"`
	TargetSkillID    *uint      `json:"target_skill_id"`
	SyncRunID        *uint      `json:"sync_run_id,omitempty"`
	Attempt          int        `json:"attempt"`
	MaxAttempts      int        `json:"max_attempts"`
	StartedAt        *time.Time `json:"started_at"`
	FinishedAt       *time.Time `json:"finished_at"`
	ErrorCode        string     `json:"error_code"`
	ErrorMessage     string     `json:"error_message"`
	PayloadDigest    string     `json:"payload_digest"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

func resultToAPIAdminAsyncJobItems(items []models.AsyncJob) []apiAdminAsyncJobItem {
	result := make([]apiAdminAsyncJobItem, 0, len(items))
	for _, item := range items {
		result = append(result, resultToAPIAdminAsyncJobItem(item))
	}
	return result
}

func resultToAPIAdminAsyncJobItem(item models.AsyncJob) apiAdminAsyncJobItem {
	return apiAdminAsyncJobItem{
		ID:               item.ID,
		JobType:          string(item.JobType),
		Status:           string(item.Status),
		OwnerUserID:      item.OwnerUserID,
		ActorUserID:      item.ActorUserID,
		CanceledByUserID: item.CanceledByUserID,
		TargetSkillID:    item.TargetSkillID,
		SyncRunID:        item.SyncRunID,
		Attempt:          item.Attempt,
		MaxAttempts:      item.MaxAttempts,
		StartedAt:        item.StartedAt,
		FinishedAt:       item.FinishedAt,
		ErrorCode:        item.ErrorCode,
		ErrorMessage:     item.ErrorMessage,
		PayloadDigest:    item.PayloadDigest,
		CreatedAt:        item.CreatedAt,
		UpdatedAt:        item.UpdatedAt,
	}
}
