package services

import (
	"context"
	"errors"
	"fmt"
	"os"
	"sort"
	"strings"
	"sync"
	"time"

	"skillsindex/internal/models"

	"github.com/getkin/kin-openapi/openapi3"
	"gorm.io/gorm"
)

// RuntimeOperationMatch returns the current published spec, operation metadata, and effective runtime policy.
type RuntimeOperationMatch struct {
	Spec      models.APISpec             `json:"spec"`
	Operation models.APIOperation        `json:"operation"`
	Policy    ResolvedAPIOperationPolicy `json:"policy"`
	LoadedAt  time.Time                  `json:"loaded_at"`
}

type apiContractRuntimeSnapshot struct {
	spec           models.APISpec
	document       *openapi3.T
	operationsByID map[string]models.APIOperation
	routesByMethod map[string][]apiContractRuntimeRoute
	policiesByID   map[string]ResolvedAPIOperationPolicy
	loadedAt       time.Time
}

type apiContractRuntimeRoute struct {
	pattern     string
	specificity int
	operationID string
}

// APIContractRuntimeService keeps an in-memory registry for the current published OpenAPI contract.
type APIContractRuntimeService struct {
	db *gorm.DB

	mutex    sync.RWMutex
	snapshot *apiContractRuntimeSnapshot
}

// NewAPIContractRuntimeService constructs a runtime contract registry service.
func NewAPIContractRuntimeService(db *gorm.DB) *APIContractRuntimeService {
	return &APIContractRuntimeService{db: db}
}

// Reload rebuilds the in-memory runtime registry from the current published OpenAPI spec.
func (s *APIContractRuntimeService) Reload(ctx context.Context) error {
	if s == nil || s.db == nil {
		return fmt.Errorf("api contract runtime service is not configured")
	}

	spec, err := getCurrentPublishedSpecRecord(ctx, s.db)
	if err != nil {
		s.clearSnapshot()
		return err
	}

	document, err := loadOpenAPIDocumentFromBundle(spec.BundlePath)
	if err != nil {
		return err
	}

	var operations []models.APIOperation
	if err := s.db.WithContext(ctx).
		Where("spec_id = ?", spec.ID).
		Find(&operations).Error; err != nil {
		return fmt.Errorf("failed to load api operations for runtime registry: %w", err)
	}

	var storedPolicies []models.APIOperationPolicy
	if err := s.db.WithContext(ctx).
		Where("spec_id = ?", spec.ID).
		Find(&storedPolicies).Error; err != nil {
		return fmt.Errorf("failed to load api operation policies for runtime registry: %w", err)
	}

	policiesByStoredID := make(map[string]*models.APIOperationPolicy, len(storedPolicies))
	for index := range storedPolicies {
		policy := storedPolicies[index]
		policiesByStoredID[policy.OperationID] = &policy
	}

	snapshot := &apiContractRuntimeSnapshot{
		spec:           spec,
		document:       document,
		operationsByID: make(map[string]models.APIOperation, len(operations)),
		routesByMethod: make(map[string][]apiContractRuntimeRoute),
		policiesByID:   make(map[string]ResolvedAPIOperationPolicy, len(operations)),
		loadedAt:       time.Now().UTC(),
	}
	for _, operation := range operations {
		snapshot.operationsByID[operation.OperationID] = operation
		snapshot.policiesByID[operation.OperationID] = resolveAPIOperationPolicy(operation, policiesByStoredID[operation.OperationID])
		methodKey := strings.ToUpper(strings.TrimSpace(operation.Method))
		snapshot.routesByMethod[methodKey] = append(snapshot.routesByMethod[methodKey], apiContractRuntimeRoute{
			pattern:     operation.Path,
			specificity: openAPIPathSpecificity(operation.Path),
			operationID: operation.OperationID,
		})
	}
	for method := range snapshot.routesByMethod {
		sort.SliceStable(snapshot.routesByMethod[method], func(left int, right int) bool {
			return snapshot.routesByMethod[method][left].specificity > snapshot.routesByMethod[method][right].specificity
		})
	}

	s.mutex.Lock()
	s.snapshot = snapshot
	s.mutex.Unlock()
	return nil
}

// MatchRequest resolves one published OpenAPI operation for the provided method and request path.
func (s *APIContractRuntimeService) MatchRequest(method string, requestPath string) (RuntimeOperationMatch, bool) {
	if s == nil {
		return RuntimeOperationMatch{}, false
	}

	s.mutex.RLock()
	snapshot := s.snapshot
	s.mutex.RUnlock()
	if snapshot == nil {
		return RuntimeOperationMatch{}, false
	}

	methodKey := strings.ToUpper(strings.TrimSpace(method))
	path := normalizeRuntimeRequestPath(requestPath)
	for _, route := range snapshot.routesByMethod[methodKey] {
		if !matchOpenAPIPathPattern(route.pattern, path) {
			continue
		}
		operation, ok := snapshot.operationsByID[route.operationID]
		if !ok {
			continue
		}
		policy := snapshot.policiesByID[route.operationID]
		return RuntimeOperationMatch{
			Spec:      snapshot.spec,
			Operation: operation,
			Policy:    policy,
			LoadedAt:  snapshot.loadedAt,
		}, true
	}

	return RuntimeOperationMatch{}, false
}

func (s *APIContractRuntimeService) clearSnapshot() {
	if s == nil {
		return
	}
	s.mutex.Lock()
	s.snapshot = nil
	s.mutex.Unlock()
}

func loadOpenAPIDocumentFromBundle(bundlePath string) (*openapi3.T, error) {
	raw, err := os.ReadFile(bundlePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read published openapi bundle: %w", err)
	}

	loader := openapi3.NewLoader()
	document, err := loader.LoadFromData(raw)
	if err != nil {
		return nil, fmt.Errorf("failed to decode published openapi bundle: %w", err)
	}
	if err := document.Validate(loader.Context); err != nil {
		return nil, fmt.Errorf("failed to validate published openapi bundle: %w", err)
	}
	return document, nil
}

func normalizeRuntimeRequestPath(path string) string {
	clean := strings.TrimSpace(path)
	if clean == "" {
		return "/"
	}
	if queryIndex := strings.Index(clean, "?"); queryIndex >= 0 {
		clean = clean[:queryIndex]
	}
	if clean == "" {
		return "/"
	}
	if !strings.HasPrefix(clean, "/") {
		clean = "/" + clean
	}
	if len(clean) > 1 {
		clean = strings.TrimRight(clean, "/")
	}
	if clean == "" {
		return "/"
	}
	return clean
}

func openAPIPathSpecificity(pattern string) int {
	score := 0
	for _, segment := range splitOpenAPIPathSegments(pattern) {
		if !strings.HasPrefix(segment, "{") || !strings.HasSuffix(segment, "}") {
			score++
		}
	}
	return score
}

func matchOpenAPIPathPattern(pattern string, actual string) bool {
	patternSegments := splitOpenAPIPathSegments(pattern)
	actualSegments := splitOpenAPIPathSegments(actual)
	if len(patternSegments) != len(actualSegments) {
		return false
	}

	for index := range patternSegments {
		patternSegment := patternSegments[index]
		if strings.HasPrefix(patternSegment, "{") && strings.HasSuffix(patternSegment, "}") {
			if strings.TrimSpace(actualSegments[index]) == "" {
				return false
			}
			continue
		}
		if patternSegment != actualSegments[index] {
			return false
		}
	}
	return true
}

func splitOpenAPIPathSegments(value string) []string {
	clean := normalizeRuntimeRequestPath(value)
	if clean == "/" {
		return nil
	}
	return strings.Split(strings.Trim(clean, "/"), "/")
}

