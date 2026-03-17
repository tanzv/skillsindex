package web

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"skillsindex/internal/services"
)

type apiAccountPasswordResetRequest struct {
	Username string `json:"username"`
}

type apiAccountPasswordResetConfirmRequest struct {
	Token       string `json:"token"`
	NewPassword string `json:"new_password"`
}

func (a *App) handleAPIAccountPasswordResetRequest(w http.ResponseWriter, r *http.Request) {
	if a.authService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{
			"error":   "service_unavailable",
			"message": a.apiMessage(r, "api.account.password_reset.auth_service_unavailable", "Authentication service unavailable"),
		})
		return
	}

	var input apiAccountPasswordResetRequest
	if err := decodeJSONOrForm(r, &input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"error":   "invalid_payload",
			"message": a.apiMessage(r, "api.account.password_reset.invalid_payload", "Invalid request payload"),
		})
		return
	}

	username := strings.TrimSpace(input.Username)
	token, err := a.authService.RequestPasswordReset(r.Context(), username, clientIPFromRequest(r))
	targetID := uint(0)
	if user, lookupErr := a.authService.GetUserByUsername(r.Context(), username); lookupErr == nil {
		targetID = user.ID
	}
	switch {
	case err == nil:
		reason := "request accepted without matching account"
		details := auditDetailsJSON(map[string]string{
			"username":     username,
			"token_issued": "false",
		})
		if token != "" {
			reason = "password reset token issued"
			details = auditDetailsJSON(map[string]string{
				"username":     username,
				"token_issued": "true",
			})
		}
		a.recordRequestAudit(r, nil, services.RecordAuditInput{
			Action:     "password_reset_request",
			TargetType: "password_reset",
			TargetID:   targetID,
			Result:     "accepted",
			Reason:     reason,
			Summary:    "Accepted password reset request",
			Details:    details,
		})
	case errors.Is(err, services.ErrPasswordResetRateLimited):
		a.recordRequestAudit(r, nil, services.RecordAuditInput{
			Action:     "password_reset_request",
			TargetType: "password_reset",
			TargetID:   targetID,
			Result:     "rate_limited",
			Reason:     "password reset request rate limited",
			Summary:    "Rejected password reset request",
			Details: auditDetailsJSON(map[string]string{
				"username": username,
			}),
		})
		writeJSON(w, http.StatusTooManyRequests, map[string]any{
			"error": "too_many_requests",
			"message": a.apiMessage(
				r,
				"api.account.password_reset.request_rate_limited",
				"Password reset requests are temporarily rate limited",
			),
		})
		return
	default:
		a.recordRequestAudit(r, nil, services.RecordAuditInput{
			Action:     "password_reset_request",
			TargetType: "password_reset",
			TargetID:   targetID,
			Result:     "error",
			Reason:     "password reset request failed",
			Summary:    "Failed password reset request",
			Details: auditDetailsJSON(map[string]string{
				"username": username,
			}),
		})
		writeJSON(w, http.StatusInternalServerError, map[string]any{
			"error": "password_reset_request_failed",
			"message": a.apiMessage(
				r,
				"api.account.password_reset.request_failed",
				"Failed to submit password reset request",
			),
		})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok": true,
		"message": a.apiMessage(
			r,
			"api.account.password_reset.request_accepted",
			"If the account exists, a reset link has been generated for delivery",
		),
	})
}

func (a *App) handleAPIAccountPasswordResetConfirm(w http.ResponseWriter, r *http.Request) {
	if a.authService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{
			"error":   "service_unavailable",
			"message": a.apiMessage(r, "api.account.password_reset.auth_service_unavailable", "Authentication service unavailable"),
		})
		return
	}
	if a.sessionService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{
			"error":   "service_unavailable",
			"message": a.apiMessage(r, "api.account.password_reset.session_service_unavailable", "Session service unavailable"),
		})
		return
	}

	var input apiAccountPasswordResetConfirmRequest
	if err := decodeJSONOrForm(r, &input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"error":   "invalid_payload",
			"message": a.apiMessage(r, "api.account.password_reset.invalid_payload", "Invalid request payload"),
		})
		return
	}

	user, err := a.authService.ConfirmPasswordReset(
		r.Context(),
		strings.TrimSpace(input.Token),
		strings.TrimSpace(input.NewPassword),
	)
	if err != nil {
		errorCode := "password_reset_confirm_failed"
		errorMessage := a.apiMessage(r, "api.account.password_reset.confirm_failed", "Failed to confirm password reset")
		reason := "password reset confirmation failed"
		switch {
		case errors.Is(err, services.ErrPasswordResetTokenInvalid):
			errorCode = "invalid_reset_token"
			errorMessage = a.apiMessage(r, "api.account.password_reset.invalid_token", "Password reset token is invalid")
			reason = "password reset token is invalid"
		case errors.Is(err, services.ErrPasswordResetTokenExpired):
			errorCode = "expired_reset_token"
			errorMessage = a.apiMessage(r, "api.account.password_reset.expired_token", "Password reset token is expired")
			reason = "password reset token is expired"
		case errors.Is(err, services.ErrPasswordResetTokenUsed):
			errorCode = "used_reset_token"
			errorMessage = a.apiMessage(r, "api.account.password_reset.used_token", "Password reset token was already used")
			reason = "password reset token was already used"
		}
		a.recordRequestAudit(r, nil, services.RecordAuditInput{
			Action:     "password_reset_confirm",
			TargetType: "password_reset",
			Result:     "rejected",
			Reason:     reason,
			Summary:    "Rejected password reset confirmation",
			Details: auditDetailsJSON(map[string]string{
				"token_present": strconv.FormatBool(strings.TrimSpace(input.Token) != ""),
			}),
		})
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"error":   errorCode,
			"message": errorMessage,
		})
		return
	}

	if err := a.startUserSession(w, r, user.ID); err != nil {
		a.recordRequestAudit(r, &user, services.RecordAuditInput{
			Action:     "password_reset_confirm",
			TargetType: "user",
			TargetID:   user.ID,
			Result:     "error",
			Reason:     "password reset completed but session start failed",
			Summary:    "Failed password reset confirmation",
			Details: auditDetailsJSON(map[string]string{
				"username":        user.Username,
				"session_started": "false",
			}),
		})
		writeJSON(w, http.StatusInternalServerError, map[string]any{
			"error": "session_start_failed",
			"message": a.apiMessage(
				r,
				"api.account.password_reset.session_start_failed",
				"Password reset succeeded but failed to start session",
			),
		})
		return
	}

	a.recordRequestAudit(r, &user, services.RecordAuditInput{
		Action:     "password_reset_confirm",
		TargetType: "user",
		TargetID:   user.ID,
		Result:     "success",
		Reason:     "password reset completed",
		Summary:    "Completed password reset confirmation",
		Details: auditDetailsJSON(map[string]string{
			"username":        user.Username,
			"session_started": "true",
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":      true,
		"message": a.apiMessage(r, "api.account.password_reset.confirm_completed", "Password reset completed"),
		"user":    buildAPIAuthUserResponse(user),
	})
}
