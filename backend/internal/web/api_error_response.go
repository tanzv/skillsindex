package web

import (
	"net/http"
	"strings"
)

type apiErrorResponse struct {
	Error     string `json:"error"`
	Message   string `json:"message,omitempty"`
	RequestID string `json:"request_id,omitempty"`
}

func writeAPIError(w http.ResponseWriter, r *http.Request, status int, code string, message string) {
	payload := apiErrorResponse{
		Error:   strings.TrimSpace(code),
		Message: strings.TrimSpace(message),
	}
	if requestID := requestIDFromRequest(r); requestID != "" {
		payload.RequestID = requestID
	}
	writeJSON(w, status, payload)
}

func writeAPIErrorFromError(w http.ResponseWriter, r *http.Request, status int, code string, err error, fallbackMessage string) {
	message := strings.TrimSpace(fallbackMessage)
	if err != nil {
		if errMessage := strings.TrimSpace(err.Error()); errMessage != "" {
			message = errMessage
		}
	}
	writeAPIError(w, r, status, code, message)
}
