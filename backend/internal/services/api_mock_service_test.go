package services

import (
	"context"
	"strings"
	"testing"
)

func setupPublishedAPIManagementServices(t *testing.T) (*APISpecRegistryService, *APIPublishService, *APIPolicyService, *APIContractRuntimeService, *APIMockService, *APIExportService) {
	t.Helper()

	db := setupAPISpecRegistryTestDB(t)
	storageDir := t.TempDir()
	registry := NewAPISpecRegistryService(db, storageDir)
	runtimeService := NewAPIContractRuntimeService(db)
	policyService := NewAPIPolicyService(db)
	policyService.SetRuntimeReloader(runtimeService)
	publisher := NewAPIPublishService(db)
	publisher.SetRuntimeReloader(runtimeService)
	mockService := NewAPIMockService(db, runtimeService)
	exportService := NewAPIExportService(db, storageDir)

	spec := seedDraftSpec(t, registry, "skillsindex-api")
	if _, err := publisher.Publish(context.Background(), PublishAPISpecInput{
		SpecID:      spec.ID,
		ActorUserID: 9,
	}); err != nil {
		t.Fatalf("failed to publish spec: %v", err)
	}

	return registry, publisher, policyService, runtimeService, mockService, exportService
}

func TestAPIMockServiceResolveCurrentMockUsesProfileOverride(t *testing.T) {
	_, _, policyService, _, mockService, _ := setupPublishedAPIManagementServices(t)

	if _, err := policyService.UpsertCurrentOperationPolicy(context.Background(), UpsertCurrentAPIOperationPolicyInput{
		OperationID:    "getCurrentPublishedSpec",
		AuthMode:       "session",
		RequiredRoles:  []string{"super_admin"},
		RequiredScopes: []string{},
		Enabled:        true,
		MockEnabled:    true,
		ExportEnabled:  true,
		ActorUserID:    9,
	}); err != nil {
		t.Fatalf("failed to seed mock-enabled policy: %v", err)
	}

	profile, err := mockService.UpsertCurrentProfile(context.Background(), UpsertCurrentAPIMockProfileInput{
		Name:        "default",
		Mode:        "inline",
		IsDefault:   true,
		ActorUserID: 9,
	})
	if err != nil {
		t.Fatalf("failed to create mock profile: %v", err)
	}

	if _, err := mockService.UpsertProfileOverride(context.Background(), UpsertAPIMockOverrideInput{
		ProfileID:      profile.ID,
		OperationID:    "getCurrentPublishedSpec",
		StatusCode:     202,
		ContentType:    "application/json",
		BodyPayload:    `{"mocked":true}`,
		HeadersPayload: `{"x-mock":"enabled"}`,
		LatencyMS:      25,
		ActorUserID:    9,
	}); err != nil {
		t.Fatalf("failed to create mock override: %v", err)
	}

	result, err := mockService.ResolveCurrentMock(context.Background(), ResolveCurrentAPIMockInput{
		ProfileName: "default",
		Method:      "GET",
		Path:        "/api/v1/admin/api-management/specs/current",
	})
	if err != nil {
		t.Fatalf("expected mock resolve to succeed: %v", err)
	}
	if result.OperationID != "getCurrentPublishedSpec" {
		t.Fatalf("unexpected mock operation id: %s", result.OperationID)
	}
	if result.StatusCode != 202 {
		t.Fatalf("unexpected mock status code: %d", result.StatusCode)
	}
	if result.ContentType != "application/json" {
		t.Fatalf("unexpected mock content type: %s", result.ContentType)
	}
	if result.Headers["x-mock"] != "enabled" {
		t.Fatalf("expected mock header override")
	}
	bodyMap, ok := result.Body.(map[string]any)
	if !ok || bodyMap["mocked"] != true {
		t.Fatalf("expected decoded mock body override")
	}
}

func TestAPIExportServiceCreateCurrentExportPersistsArtifacts(t *testing.T) {
	_, _, _, _, _, exportService := setupPublishedAPIManagementServices(t)

	rawResult, err := exportService.CreateCurrentExport(context.Background(), CreateAPIExportInput{
		ExportType:  "raw-published",
		Format:      "json",
		Target:      "admin-download",
		ActorUserID: 9,
	})
	if err != nil {
		t.Fatalf("expected raw export to succeed: %v", err)
	}
	if rawResult.Record.ID == 0 {
		t.Fatalf("expected persisted raw export record id")
	}
	if len(rawResult.ArtifactRaw) == 0 {
		t.Fatalf("expected raw export artifact bytes")
	}

	publicResult, err := exportService.CreateCurrentExport(context.Background(), CreateAPIExportInput{
		ExportType:  "public-subset",
		Format:      "yaml",
		Target:      "partner-download",
		ActorUserID: 9,
	})
	if err != nil {
		t.Fatalf("expected public subset export to succeed: %v", err)
	}
	if publicResult.Record.ID == 0 {
		t.Fatalf("expected persisted public export record id")
	}
	if contains := string(publicResult.ArtifactRaw); contains == "" {
		t.Fatalf("expected public export artifact bytes")
	}
	if strings.Contains(string(publicResult.ArtifactRaw), "/api/v1/admin/api-management") {
		t.Fatalf("expected internal admin paths to be removed from public subset export")
	}

	items, err := exportService.ListCurrentExports(context.Background())
	if err != nil {
		t.Fatalf("expected export list to succeed: %v", err)
	}
	if len(items) != 2 {
		t.Fatalf("unexpected export record count: %d", len(items))
	}
}
