package web

import (
	"errors"
	"net/http"
	"net/url"
	"strings"

	"skillsindex/internal/services"
)

func (a *App) showRegister(w http.ResponseWriter, r *http.Request) {
	page := resolveRegisterPageFromPath(r.URL.Path)
	if !a.registrationEnabled(r.Context()) {
		a.renderWithStatus(w, r, http.StatusForbidden, ViewData{
			Page:  resolveLoginPageFromPath(r.URL.Path),
			Title: "Registration Disabled",
			Error: "Account registration is currently disabled by administrator",
		})
		return
	}
	a.render(w, r, ViewData{Page: page, Title: "Create Account"})
}

func (a *App) handleRegister(w http.ResponseWriter, r *http.Request) {
	registerPage := resolveRegisterPageFromPath(r.URL.Path)
	if !a.registrationEnabled(r.Context()) {
		a.renderWithStatus(w, r, http.StatusForbidden, ViewData{
			Page:  resolveLoginPageFromPath(r.URL.Path),
			Title: "Registration Disabled",
			Error: "Account registration is currently disabled by administrator",
		})
		return
	}
	if err := r.ParseForm(); err != nil {
		a.renderWithStatus(w, r, http.StatusBadRequest, ViewData{Page: registerPage, Title: "Create Account", Error: "Invalid form payload"})
		return
	}
	user, err := a.authService.Register(r.Context(), r.FormValue("username"), r.FormValue("password"))
	if err != nil {
		a.renderWithStatus(w, r, http.StatusBadRequest, ViewData{Page: registerPage, Title: "Create Account", Error: err.Error()})
		return
	}
	if err := a.startUserSession(w, r, user.ID); err != nil {
		a.renderWithStatus(w, r, http.StatusInternalServerError, ViewData{Page: registerPage, Title: "Create Account", Error: "Failed to start session"})
		return
	}
	http.Redirect(w, r, "/admin?msg="+url.QueryEscape("Account created"), http.StatusSeeOther)
}

func (a *App) showLogin(w http.ResponseWriter, r *http.Request) {
	page := resolveLoginPageFromPath(r.URL.Path)
	a.render(w, r, ViewData{
		Page:    page,
		Title:   "Sign In",
		Message: strings.TrimSpace(r.URL.Query().Get("msg")),
		Error:   strings.TrimSpace(r.URL.Query().Get("err")),
	})
}

func (a *App) showPasswordResetRequest(w http.ResponseWriter, r *http.Request) {
	page := resolvePasswordResetRequestPageFromPath(r.URL.Path)
	a.render(w, r, ViewData{
		Page:    page,
		Title:   "Request Password Reset",
		Message: strings.TrimSpace(r.URL.Query().Get("msg")),
		Error:   strings.TrimSpace(r.URL.Query().Get("err")),
	})
}

func (a *App) handlePasswordResetRequest(w http.ResponseWriter, r *http.Request) {
	requestPage := resolvePasswordResetRequestPageFromPath(r.URL.Path)
	requestPath := passwordResetRequestPath(requestPage)
	if err := r.ParseForm(); err != nil {
		redirectPasswordResetPath(w, r, requestPath, "", "Invalid form payload")
		return
	}
	username := strings.TrimSpace(r.FormValue("username"))
	_, err := a.authService.RequestPasswordReset(r.Context(), username, clientIPFromRequest(r))
	switch {
	case err == nil:
	case errors.Is(err, services.ErrPasswordResetRateLimited):
	default:
		redirectPasswordResetPath(w, r, requestPath, "", "Failed to submit reset request")
		return
	}

	redirectPasswordResetPath(
		w,
		r,
		requestPath,
		"If the account exists, a reset link has been generated for delivery",
		"",
	)
}

func (a *App) showPasswordResetConfirm(w http.ResponseWriter, r *http.Request) {
	page := resolvePasswordResetConfirmPageFromPath(r.URL.Path)
	a.render(w, r, ViewData{
		Page:               page,
		Title:              "Reset Password",
		PasswordResetToken: strings.TrimSpace(r.URL.Query().Get("token")),
		Message:            strings.TrimSpace(r.URL.Query().Get("msg")),
		Error:              strings.TrimSpace(r.URL.Query().Get("err")),
	})
}

func (a *App) handlePasswordResetConfirm(w http.ResponseWriter, r *http.Request) {
	confirmPage := resolvePasswordResetConfirmPageFromPath(r.URL.Path)
	confirmPath := passwordResetConfirmPath(confirmPage)
	if err := r.ParseForm(); err != nil {
		redirectPasswordResetPath(w, r, confirmPath, "", "Invalid form payload")
		return
	}

	token := strings.TrimSpace(r.FormValue("token"))
	newPassword := strings.TrimSpace(r.FormValue("new_password"))
	user, err := a.authService.ConfirmPasswordReset(r.Context(), token, newPassword)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrPasswordResetTokenInvalid):
			redirectPasswordResetPath(w, r, confirmPath, "", "Reset token is invalid")
		case errors.Is(err, services.ErrPasswordResetTokenExpired):
			redirectPasswordResetPath(w, r, confirmPath, "", "Reset token has expired")
		case errors.Is(err, services.ErrPasswordResetTokenUsed):
			redirectPasswordResetPath(w, r, confirmPath, "", "Reset token was already used")
		default:
			redirectPasswordResetPath(w, r, confirmPath, "", err.Error())
		}
		return
	}

	if err := a.startUserSession(w, r, user.ID); err != nil {
		signInTarget := loginPath(confirmPage)
		http.Redirect(w, r, signInTarget+"?msg="+url.QueryEscape("Password reset succeeded, please sign in"), http.StatusSeeOther)
		return
	}

	http.Redirect(w, r, "/admin?msg="+url.QueryEscape("Password reset completed"), http.StatusSeeOther)
}

func (a *App) handleLogin(w http.ResponseWriter, r *http.Request) {
	loginPage := resolveLoginPageFromPath(r.URL.Path)
	if err := r.ParseForm(); err != nil {
		a.renderWithStatus(w, r, http.StatusBadRequest, ViewData{Page: loginPage, Title: "Sign In", Error: "Invalid form payload"})
		return
	}
	username := strings.TrimSpace(r.FormValue("username"))
	issuedIP := clientIPFromRequest(r)
	if a.loginThrottleState().limited(username, issuedIP) {
		a.renderWithStatus(w, r, http.StatusTooManyRequests, ViewData{
			Page:  loginPage,
			Title: "Sign In",
			Error: "Too many failed sign-in attempts. Try again later.",
		})
		return
	}

	user, err := a.authService.Authenticate(r.Context(), username, r.FormValue("password"))
	if err != nil {
		a.loginThrottleState().recordFailure(username, issuedIP)
		a.renderWithStatus(w, r, http.StatusUnauthorized, ViewData{Page: loginPage, Title: "Sign In", Error: "Invalid username or password"})
		return
	}
	a.loginThrottleState().recordSuccess(username, issuedIP)
	if err := a.startUserSession(w, r, user.ID); err != nil {
		a.renderWithStatus(w, r, http.StatusInternalServerError, ViewData{Page: loginPage, Title: "Sign In", Error: "Failed to start session"})
		return
	}
	if redirectTarget := normalizeLocalRedirectTarget(r.URL.Query().Get("redirect")); redirectTarget != "" {
		http.Redirect(w, r, redirectTarget, http.StatusSeeOther)
		return
	}
	http.Redirect(w, r, "/admin?msg="+url.QueryEscape("Signed in"), http.StatusSeeOther)
}

func (a *App) handleLogout(w http.ResponseWriter, r *http.Request) {
	if a.sessionService != nil && a.userSessionSvc != nil {
		userID, _, sessionID, ok := a.sessionService.GetSessionWithID(r)
		if ok && strings.TrimSpace(sessionID) != "" {
			_ = a.userSessionSvc.RevokeSession(r.Context(), userID, sessionID)
		}
	}
	if a.sessionService != nil {
		a.sessionService.ClearSession(w)
	}
	http.Redirect(w, r, "/?msg="+url.QueryEscape("Signed out"), http.StatusSeeOther)
}
