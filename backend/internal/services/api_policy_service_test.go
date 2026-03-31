package services

import (
	"context"
	"testing"

	"skillsindex/internal/models"
)

func setupPublishedAPIRuntimeServices(t *testing.T) (*APISpecRegistryService, *APIPublishService, *APIPolicyService, *APIContractRuntimeService, models.APISpec) {
	t.Helper()

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

	return registry, publisher, policyService, runtimeService, spec
}

func TestAPIPolicyServiceListCurrentOperationsIncludesResolvedPolicies(t *testing.T) {
	_, _, policyService, _, _ := setupPublishedAPIRuntimeServices(t)

	items, err := policyService.ListCurrentOperations(context.Background())
	if err != nil {
		t.Fatalf("expected list current operations to succeed: %v", err)
	}
	if len(items) < 8 {
		t.Fatalf("expected current operations, got=%d", len(items))
	}

	byID := make(map[string]APIOperationPolicySnapshot, len(items))
	for _, item := range items {
		byID[item.Operation.OperationID] = item
	}

	currentSpec, ok := byID["getCurrentPublishedSpec"]
	if !ok {
		t.Fatalf("expected current published spec operation in list")
	}
	if currentSpec.Resolved.AuthMode != models.APIAuthModeSession {
		t.Fatalf("expected admin operation to default to session auth, got=%s", currentSpec.Resolved.AuthMode)
	}
	if !currentSpec.Resolved.Enabled {
		t.Fatalf("expected admin operation to be enabled by default")
	}
}

func TestAPIPolicyServiceUpsertCurrentOperationPolicyPersistsAndReloadsRuntime(t *testing.T) {
	_, _, policyService, runtimeService, _ := setupPublishedAPIRuntimeServices(t)

	result, err := policyService.UpsertCurrentOperationPolicy(context.Background(), UpsertCurrentAPIOperationPolicyInput{
		OperationID:    "getCurrentPublishedSpec",
		AuthMode:       models.APIAuthModeSession,
		RequiredRoles:  []string{string(models.RoleSuperAdmin)},
		RequiredScopes: []string{},
		Enabled:        false,
		MockEnabled:    true,
		ExportEnabled:  true,
		ActorUserID:    9,
	})
	if err != nil {
		t.Fatalf("expected upsert current operation policy to succeed: %v", err)
	}
	if result.Policy == nil {
		t.Fatalf("expected persisted policy")
	}
	if result.Resolved.Enabled {
		t.Fatalf("expected resolved policy to apply disabled flag")
	}
	if len(result.Resolved.RequiredRoles) != 1 || result.Resolved.RequiredRoles[0] != string(models.RoleSuperAdmin) {
		t.Fatalf("expected required roles to persist")
	}

	match, ok := runtimeService.MatchRequest("GET", "/api/v1/admin/api-management/specs/current")
	if !ok {
		t.Fatalf("expected runtime matcher to resolve current published spec operation")
	}
	if match.Policy.Enabled {
		t.Fatalf("expected runtime policy reload to reflect disabled operation")
	}
	if len(match.Policy.RequiredRoles) != 1 || match.Policy.RequiredRoles[0] != string(models.RoleSuperAdmin) {
		t.Fatalf("expected runtime policy reload to reflect required roles")
	}
}
