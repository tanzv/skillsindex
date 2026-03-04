package web

import "net/http"

func (a *App) handleAPIAdminSyncRuns(w http.ResponseWriter, r *http.Request) {
	a.handleAPIAdminSyncJobs(w, r)
}

func (a *App) handleAPIAdminSyncRunDetail(w http.ResponseWriter, r *http.Request) {
	a.handleAPIAdminSyncJobDetail(w, r)
}
