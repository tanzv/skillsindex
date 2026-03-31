package web

import "net/http"

func (a *App) handleCreateManual(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	input, err := readAdminManualIngestionInput(r)
	if err != nil {
		redirectDashboard(w, r, "", "Invalid form payload")
		return
	}
	result, err := a.submitManualIngestion(r.Context(), user, input)
	if err != nil {
		redirectDashboard(w, r, "", adminIngestionOperationMessage(err, "Failed to create manual skill"))
		return
	}

	redirectDashboard(w, r, result.message, "")
}

func (a *App) handleUpload(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	input, archive, header, err := readAdminUploadIngestionInput(r)
	if err != nil {
		redirectDashboard(w, r, "", adminIngestionOperationMessage(err, "Failed to parse upload form"))
		return
	}
	defer archive.Close()

	result, err := a.submitUploadIngestion(r.Context(), user, input, archive, header)
	if err != nil {
		redirectDashboard(w, r, "", adminIngestionOperationMessage(err, "Failed to create skill from archive"))
		return
	}

	redirectDashboard(w, r, result.message, "")
}

func (a *App) handleRepositoryCreate(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	input, err := readAdminRepositoryIngestionInput(r)
	if err != nil {
		redirectDashboard(w, r, "", "Invalid form payload")
		return
	}
	result, err := a.submitRepositoryIngestion(r.Context(), user, input)
	if err != nil {
		redirectDashboard(w, r, "", adminIngestionOperationMessage(err, "Failed to store repository skill"))
		return
	}
	redirectDashboard(w, r, result.message, "")
}

func (a *App) handleSkillMPCreate(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	input, err := readAdminSkillMPIngestionInput(r)
	if err != nil {
		redirectDashboard(w, r, "", "Invalid form payload")
		return
	}
	result, err := a.submitSkillMPIngestion(r.Context(), user, input)
	if err != nil {
		redirectDashboard(w, r, "", adminIngestionOperationMessage(err, "Failed to store SkillMP skill"))
		return
	}
	redirectDashboard(w, r, result.message, "")
}
