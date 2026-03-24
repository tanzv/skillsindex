package services

import (
	"context"
	"testing"

	"skillsindex/internal/models"
)

func TestAPIContractRuntimeServiceMatchRequestSupportsPathParameters(t *testing.T) {
	db := setupAPISpecRegistryTestDB(t)
	registry := NewAPISpecRegistryService(db, t.TempDir())
	runtimeService := NewAPIContractRuntimeService(db)
	policyService := NewAPIPolicyService(db)
	policyService.SetRuntimeReloader(runtimeService)
	publisher := NewAPIPublishService(db)
	publisher.SetRuntimeReloader(runtimeService)

	spec := seedDraftSpec(t, registry, "skillsindex-api")
	if _, err := publisher.Publish(context.Background(), PublishAPISpecInput{
		SpecID:      spec.ID,
		ActorUserID: 9,
	}); err != nil {
		t.Fatalf("failed to publish spec: %v", err)
	}

	if _, err := policyService.UpsertCurrentOperationPolicy(context.Background(), UpsertCurrentAPIOperationPolicyInput{
		OperationID:    "upsertCurrentAPIOperationPolicy",
		AuthMode:       string(models.APIAuthModeSession),
		RequiredRoles:  []string{string(models.RoleSuperAdmin)},
		RequiredScopes: []string{},
		Enabled:        true,
		MockEnabled:    false,
		ExportEnabled:  true,
		ActorUserID:    9,
	}); err != nil {
		t.Fatalf("failed to upsert policy: %v", err)
	}

	match, ok := runtimeService.MatchRequest("POST", "/api/v1/admin/api-management/operations/getCurrentPublishedSpec/policy")
	if !ok {
		t.Fatalf("expected runtime matcher to resolve templated path")
	}
	if match.Operation.OperationID != "upsertCurrentAPIOperationPolicy" {
		t.Fatalf("unexpected operation match: %s", match.Operation.OperationID)
	}
	if match.Policy.AuthMode != models.APIAuthModeSession {
		t.Fatalf("expected runtime policy auth mode to reload from storage, got=%s", match.Policy.AuthMode)
	}
}
