package web

import "skillsindex/internal/services"

type apiRuntimeDependencies struct {
	apiSpecRegistrySvc    *services.APISpecRegistryService
	apiPublishSvc         *services.APIPublishService
	apiPolicySvc          *services.APIPolicyService
	apiMockSvc            *services.APIMockService
	apiExportSvc          *services.APIExportService
	apiContractRuntimeSvc *services.APIContractRuntimeService
}

// APIDependencies groups API-management services for web-layer assembly.
type APIDependencies struct {
	APISpecRegistrySvc    *services.APISpecRegistryService
	APIPublishSvc         *services.APIPublishService
	APIPolicySvc          *services.APIPolicyService
	APIMockSvc            *services.APIMockService
	APIExportSvc          *services.APIExportService
	APIContractRuntimeSvc *services.APIContractRuntimeService
}

func (d APIDependencies) runtimeDependencies() apiRuntimeDependencies {
	return apiRuntimeDependencies{
		apiSpecRegistrySvc:    d.APISpecRegistrySvc,
		apiPublishSvc:         d.APIPublishSvc,
		apiPolicySvc:          d.APIPolicySvc,
		apiMockSvc:            d.APIMockSvc,
		apiExportSvc:          d.APIExportSvc,
		apiContractRuntimeSvc: d.APIContractRuntimeSvc,
	}
}
