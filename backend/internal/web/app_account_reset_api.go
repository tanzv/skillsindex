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
			"message": "Authentication service unavailable",
		})
		return
	}

	var input apiAccountPasswordResetRequest
	if err := decodeJSONOrForm(r, &input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"error":   "invalid_payload",
			"message": err.Error(),
		})
		return
	}

	_, err := a.authService.RequestPasswordReset(r.Context(), strings.TrimSpace(input.Username), clientIPFromRequest(r))
	switch {
	case err == nil:
	case errors.Is(err, services.ErrPasswordResetRateLimited):
		writeJSON(w, http.StatusTooManyRequests, map[string]any{
			"error":   "too_many_requests",
			"message": "Password reset requests are temporarily rate limited",
		})
		return
	default:
		writeJSON(w, http.StatusInternalServerError, map[string]any{
			"error":   "password_reset_request_failed",
			"message": "Failed to submit password reset request",
		})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":      true,
		"message": "If the account exists, a reset link has been generated for delivery",
	})
}

func (a *App) handleAPIAccountPasswordResetConfirm(w http.ResponseWriter, r *http.Request) {
	if a.authService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{
			"error":   "service_unavailable",
			"message": "Authentication service unavailable",
		})
		return
	}
	if a.sessionService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{
			"error":   "service_unavailable",
			"message": "Session service unavailable",
		})
		return
	}

	var input apiAccountPasswordResetConfirmRequest
	if err := decodeJSONOrForm(r, &input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"error":   "invalid_payload",
			"message": err.Error(),
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
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_reset_token"})
		case errors.Is(err, services.ErrPasswordResetTokenExpired):
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": "expired_reset_token"})
		case errors.Is(err, services.ErrPasswordResetTokenUsed):
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": "used_reset_token"})
		default:
			writeJSON(w, http.StatusBadRequest, map[string]any{
				"error":   "password_reset_confirm_failed",
				"message": err.Error(),
			})
		}
		return
	}

	if err := a.startUserSession(w, r, user.ID); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{
			"error":   "session_start_failed",
			"message": "Password reset succeeded but failed to start session",
		})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":      true,
		"message": "Password reset completed",
		"user":    buildAPIAuthUserResponse(user),
	})
}
