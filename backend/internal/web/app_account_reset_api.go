package web

import (
	"errors"
	"net/http"
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

	_, err := a.authService.RequestPasswordReset(r.Context(), strings.TrimSpace(input.Username), clientIPFromRequest(r))
	switch {
	case err == nil:
	case errors.Is(err, services.ErrPasswordResetRateLimited):
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
		switch {
		case errors.Is(err, services.ErrPasswordResetTokenInvalid):
			writeJSON(w, http.StatusBadRequest, map[string]any{
				"error":   "invalid_reset_token",
				"message": a.apiMessage(r, "api.account.password_reset.invalid_token", "Password reset token is invalid"),
			})
		case errors.Is(err, services.ErrPasswordResetTokenExpired):
			writeJSON(w, http.StatusBadRequest, map[string]any{
				"error":   "expired_reset_token",
				"message": a.apiMessage(r, "api.account.password_reset.expired_token", "Password reset token is expired"),
			})
		case errors.Is(err, services.ErrPasswordResetTokenUsed):
			writeJSON(w, http.StatusBadRequest, map[string]any{
				"error":   "used_reset_token",
				"message": a.apiMessage(r, "api.account.password_reset.used_token", "Password reset token was already used"),
			})
		default:
			writeJSON(w, http.StatusBadRequest, map[string]any{
				"error":   "password_reset_confirm_failed",
				"message": a.apiMessage(r, "api.account.password_reset.confirm_failed", "Failed to confirm password reset"),
			})
		}
		return
	}

	if err := a.startUserSession(w, r, user.ID); err != nil {
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

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":      true,
		"message": a.apiMessage(r, "api.account.password_reset.confirm_completed", "Password reset completed"),
		"user":    buildAPIAuthUserResponse(user),
	})
}
