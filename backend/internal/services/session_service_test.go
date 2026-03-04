package services

import (
	"net/http/httptest"
	"testing"
)

func TestSessionServiceRoundTrip(t *testing.T) {
	svc := NewSessionService("test-secret", false)
	w := httptest.NewRecorder()

	if err := svc.SetLogin(w, 42); err != nil {
		t.Fatalf("set login failed: %v", err)
	}
	resp := w.Result()
	if len(resp.Cookies()) == 0 {
		t.Fatalf("expected cookie to be set")
	}

	req := httptest.NewRequest("GET", "/", nil)
	req.AddCookie(resp.Cookies()[0])
	userID, ok := svc.GetUserID(req)
	if !ok {
		t.Fatalf("expected valid session cookie")
	}
	if userID != 42 {
		t.Fatalf("unexpected user id: got=%d want=42", userID)
	}
}

func TestSessionServiceRejectsTamperedCookie(t *testing.T) {
	svc := NewSessionService("test-secret", false)
	w := httptest.NewRecorder()

	if err := svc.SetLogin(w, 42); err != nil {
		t.Fatalf("set login failed: %v", err)
	}
	cookie := w.Result().Cookies()[0]
	if len(cookie.Value) < 2 {
		t.Fatalf("unexpected cookie length")
	}
	cookie.Value = cookie.Value[:len(cookie.Value)-1] + "x"

	req := httptest.NewRequest("GET", "/", nil)
	req.AddCookie(cookie)
	if _, ok := svc.GetUserID(req); ok {
		t.Fatalf("expected tampered cookie to be rejected")
	}
}

func TestSessionServiceSecureCookieOption(t *testing.T) {
	svc := NewSessionService("test-secret", true)
	w := httptest.NewRecorder()
	if err := svc.SetLogin(w, 9); err != nil {
		t.Fatalf("set login failed: %v", err)
	}

	resp := w.Result()
	if len(resp.Cookies()) == 0 {
		t.Fatalf("expected cookie to be set")
	}
	if !resp.Cookies()[0].Secure {
		t.Fatalf("expected session cookie to be secure")
	}

	clearRecorder := httptest.NewRecorder()
	svc.ClearSession(clearRecorder)
	clearResp := clearRecorder.Result()
	if len(clearResp.Cookies()) == 0 {
		t.Fatalf("expected clear cookie to be set")
	}
	if !clearResp.Cookies()[0].Secure {
		t.Fatalf("expected cleared session cookie to keep secure flag")
	}
}

func TestSessionServiceReturnsSessionIDForNewCookie(t *testing.T) {
	svc := NewSessionService("test-secret", false)
	w := httptest.NewRecorder()
	meta, err := svc.SetLoginWithMeta(w, 19)
	if err != nil {
		t.Fatalf("set login with meta failed: %v", err)
	}
	if meta.SessionID == "" {
		t.Fatalf("expected session id in issued metadata")
	}

	req := httptest.NewRequest("GET", "/", nil)
	req.AddCookie(w.Result().Cookies()[0])

	userID, _, sessionID, ok := svc.GetSessionWithID(req)
	if !ok {
		t.Fatalf("expected valid session")
	}
	if userID != 19 {
		t.Fatalf("unexpected user id: got=%d want=19", userID)
	}
	if sessionID == "" {
		t.Fatalf("expected non-empty session id in cookie parser")
	}
}
