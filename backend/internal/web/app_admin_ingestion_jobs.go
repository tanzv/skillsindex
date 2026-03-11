package web

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"mime/multipart"
	"net/http"
	"strconv"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func buildAdminIngestionJobPayloadDigest(jobType models.AsyncJobType, parts ...string) string {
	normalizedParts := make([]string, 0, len(parts)+1)
	normalizedParts = append(normalizedParts, strings.ToLower(strings.TrimSpace(string(jobType))))
	for _, part := range parts {
		normalizedParts = append(normalizedParts, strings.Join(strings.Fields(strings.TrimSpace(part)), " "))
	}
	sum := sha256.Sum256([]byte(strings.Join(normalizedParts, "\n")))
	return fmt.Sprintf("%s:%s", strings.ToLower(strings.TrimSpace(string(jobType))), hex.EncodeToString(sum[:]))
}

func adminIngestionAsyncJobErrorCode(jobType models.AsyncJobType) string {
	switch jobType {
	case models.AsyncJobTypeImportManual:
		return "import_manual_failed"
	case models.AsyncJobTypeImportUpload:
		return "import_upload_failed"
	case models.AsyncJobTypeImportRepository:
		return "import_repository_failed"
	case models.AsyncJobTypeImportSkillMP:
		return "import_skillmp_failed"
	default:
		return "import_failed"
	}
}

func (a *App) runAdminIngestionWithAsyncJob(
	ctx context.Context,
	user *models.User,
	jobType models.AsyncJobType,
	payloadDigest string,
	operation func() (adminIngestionMutationResult, error),
) (adminIngestionMutationResult, error) {
	if user == nil {
		return adminIngestionMutationResult{}, newAdminIngestionOperationError(http.StatusUnauthorized, "Unauthorized")
	}
	if a.asyncJobSvc == nil {
		return operation()
	}

	startedAt := time.Now().UTC()
	created, deduped, err := a.asyncJobSvc.CreateOrGetActive(ctx, services.CreateAsyncJobInput{
		JobType:       jobType,
		OwnerUserID:   &user.ID,
		ActorUserID:   &user.ID,
		MaxAttempts:   3,
		PayloadDigest: payloadDigest,
	}, startedAt)
	if err != nil {
		return adminIngestionMutationResult{}, newAdminIngestionOperationError(http.StatusServiceUnavailable, "Async job service unavailable")
	}
	if deduped {
		return adminIngestionMutationResult{}, newAdminIngestionOperationError(http.StatusConflict, "An identical import job is already running")
	}
	if _, err := a.asyncJobSvc.Start(ctx, created.ID, startedAt); err != nil && !errors.Is(err, services.ErrAsyncJobInvalidTransition) {
		return adminIngestionMutationResult{}, newAdminIngestionOperationError(http.StatusServiceUnavailable, "Async job start failed")
	}

	result, opErr := operation()
	finishedAt := time.Now().UTC()
	if opErr != nil {
		_, _ = a.asyncJobSvc.MarkFailed(
			ctx,
			created.ID,
			adminIngestionAsyncJobErrorCode(jobType),
			adminIngestionOperationMessage(opErr, "Import failed"),
			finishedAt,
		)
		return adminIngestionMutationResult{}, opErr
	}

	_, _ = a.asyncJobSvc.MarkSucceeded(ctx, created.ID, finishedAt)
	return result, nil
}

func (a *App) submitManualIngestion(
	ctx context.Context,
	user *models.User,
	input adminManualIngestionInput,
) (adminIngestionMutationResult, error) {
	payloadDigest := buildAdminIngestionJobPayloadDigest(
		models.AsyncJobTypeImportManual,
		strconv.FormatUint(uint64(user.ID), 10),
		input.Name,
		input.Description,
		input.Content,
		input.Tags,
		input.Visibility,
		input.InstallCommand,
		input.Category,
		input.Subcategory,
		strconv.Itoa(input.StarCount),
		fmt.Sprintf("%.3f", input.QualityScore),
	)
	return a.runAdminIngestionWithAsyncJob(ctx, user, models.AsyncJobTypeImportManual, payloadDigest, func() (adminIngestionMutationResult, error) {
		return a.createManualSkillFromIngestion(ctx, user, input)
	})
}

func (a *App) submitRepositoryIngestion(
	ctx context.Context,
	user *models.User,
	input adminRepositoryIngestionInput,
) (adminIngestionMutationResult, error) {
	payloadDigest := buildAdminIngestionJobPayloadDigest(
		models.AsyncJobTypeImportRepository,
		strconv.FormatUint(uint64(user.ID), 10),
		input.RepoURL,
		input.RepoBranch,
		input.RepoPath,
		input.Tags,
		input.Visibility,
		input.InstallCommand,
		input.Category,
		input.Subcategory,
		fmt.Sprintf("%.3f", input.QualityScore),
	)
	return a.runAdminIngestionWithAsyncJob(ctx, user, models.AsyncJobTypeImportRepository, payloadDigest, func() (adminIngestionMutationResult, error) {
		return a.createRepositorySkillFromIngestion(ctx, user, input)
	})
}

func (a *App) submitUploadIngestion(
	ctx context.Context,
	user *models.User,
	input adminUploadIngestionInput,
	archive multipart.File,
	header *multipart.FileHeader,
) (adminIngestionMutationResult, error) {
	filename := ""
	fileSize := int64(0)
	if header != nil {
		filename = header.Filename
		fileSize = header.Size
	}
	payloadDigest := buildAdminIngestionJobPayloadDigest(
		models.AsyncJobTypeImportUpload,
		strconv.FormatUint(uint64(user.ID), 10),
		filename,
		strconv.FormatInt(fileSize, 10),
		input.Tags,
		input.Visibility,
		input.InstallCommand,
		input.Category,
		input.Subcategory,
		fmt.Sprintf("%.3f", input.QualityScore),
	)
	return a.runAdminIngestionWithAsyncJob(ctx, user, models.AsyncJobTypeImportUpload, payloadDigest, func() (adminIngestionMutationResult, error) {
		return a.createUploadSkillFromIngestion(ctx, user, input, archive, header)
	})
}

func (a *App) submitSkillMPIngestion(
	ctx context.Context,
	user *models.User,
	input adminSkillMPIngestionInput,
) (adminIngestionMutationResult, error) {
	payloadDigest := buildAdminIngestionJobPayloadDigest(
		models.AsyncJobTypeImportSkillMP,
		strconv.FormatUint(uint64(user.ID), 10),
		input.SkillMPURL,
		input.SkillMPID,
		input.Tags,
		input.Visibility,
		input.InstallCommand,
		input.Category,
		input.Subcategory,
		fmt.Sprintf("%.3f", input.QualityScore),
	)
	return a.runAdminIngestionWithAsyncJob(ctx, user, models.AsyncJobTypeImportSkillMP, payloadDigest, func() (adminIngestionMutationResult, error) {
		return a.createSkillMPSkillFromIngestion(ctx, user, input)
	})
}
