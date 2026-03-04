package services

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"
)

const defaultSessionCookieName = "skillsindex_session"

// SessionService signs and validates lightweight cookie sessions.
type SessionService struct {
	secret     []byte
	cookieName string
	ttl        time.Duration
	secure     bool
}

// SessionIssue contains issued session metadata.
type SessionIssue struct {
	UserID    uint
	SessionID string
	IssuedAt  time.Time
	ExpiresAt time.Time
}

// NewSessionService creates a session service with a static shared secret.
func NewSessionService(secret string, secure bool) *SessionService {
	if strings.TrimSpace(secret) == "" {
		secret = "change-me-in-production"
	}
	return &SessionService{
		secret:     []byte(secret),
		cookieName: defaultSessionCookieName,
		ttl:        24 * time.Hour,
		secure:     secure,
	}
}

// SetLogin writes an authenticated session cookie.
func (s *SessionService) SetLogin(w http.ResponseWriter, userID uint) error {
	_, err := s.SetLoginWithMeta(w, userID)
	return err
}

// SetLoginWithMeta writes authenticated session cookie and returns issued session metadata.
func (s *SessionService) SetLoginWithMeta(w http.ResponseWriter, userID uint) (SessionIssue, error) {
	issuedAt := time.Now().UTC()
	expiresAt := issuedAt.Add(s.ttl)
	sessionID, err := generateSessionID()
	if err != nil {
		return SessionIssue{}, fmt.Errorf("failed to generate session id: %w", err)
	}

	payload := fmt.Sprintf("%d:%d:%d:%s", userID, expiresAt.Unix(), issuedAt.Unix(), sessionID)
	signature := s.sign(payload)
	token := base64.RawURLEncoding.EncodeToString([]byte(payload + ":" + signature))

	http.SetCookie(w, &http.Cookie{
		Name:     s.cookieName,
		Value:    token,
		Path:     "/",
		Expires:  expiresAt,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   s.secure,
	})

	return SessionIssue{
		UserID:    userID,
		SessionID: sessionID,
		IssuedAt:  issuedAt,
		ExpiresAt: expiresAt,
	}, nil
}

// ClearSession removes the current session cookie.
func (s *SessionService) ClearSession(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     s.cookieName,
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   s.secure,
	})
}

// GetUserID reads and validates a session cookie and returns the user id.
func (s *SessionService) GetUserID(r *http.Request) (uint, bool) {
	userID, _, ok := s.GetSession(r)
	return userID, ok
}

// GetSession validates session cookie and returns user id and issued-at timestamp.
func (s *SessionService) GetSession(r *http.Request) (uint, time.Time, bool) {
	userID, issuedAt, _, ok := s.GetSessionWithID(r)
	return userID, issuedAt, ok
}

// GetSessionWithID validates session cookie and returns user id, issued-at timestamp, and session id.
func (s *SessionService) GetSessionWithID(r *http.Request) (uint, time.Time, string, bool) {
	cookie, err := r.Cookie(s.cookieName)
	if err != nil || strings.TrimSpace(cookie.Value) == "" {
		return 0, time.Time{}, "", false
	}

	decoded, err := base64.RawURLEncoding.DecodeString(cookie.Value)
	if err != nil {
		return 0, time.Time{}, "", false
	}
	parts := strings.Split(string(decoded), ":")
	if len(parts) != 3 && len(parts) != 4 && len(parts) != 5 {
		return 0, time.Time{}, "", false
	}

	var payload string
	var signature string
	var issuedAt int64
	sessionID := ""
	switch len(parts) {
	case 5:
		payload = parts[0] + ":" + parts[1] + ":" + parts[2] + ":" + parts[3]
		signature = parts[4]
		issuedAt, err = strconv.ParseInt(parts[2], 10, 64)
		if err != nil {
			return 0, time.Time{}, "", false
		}
		sessionID = strings.TrimSpace(parts[3])
		if sessionID == "" {
			return 0, time.Time{}, "", false
		}
	case 4:
		payload = parts[0] + ":" + parts[1] + ":" + parts[2]
		signature = parts[3]
		issuedAt, err = strconv.ParseInt(parts[2], 10, 64)
		if err != nil {
			return 0, time.Time{}, "", false
		}
	default:
		payload = parts[0] + ":" + parts[1]
		signature = parts[2]
		issuedAt = 0
	}
	if !hmac.Equal([]byte(signature), []byte(s.sign(payload))) {
		return 0, time.Time{}, "", false
	}

	userID64, err := strconv.ParseUint(parts[0], 10, 64)
	if err != nil {
		return 0, time.Time{}, "", false
	}
	expiresAt, err := strconv.ParseInt(parts[1], 10, 64)
	if err != nil {
		return 0, time.Time{}, "", false
	}
	if time.Now().UTC().Unix() > expiresAt {
		return 0, time.Time{}, "", false
	}

	issuedAtTime := time.Unix(issuedAt, 0).UTC()
	if issuedAt <= 0 {
		issuedAtTime = time.Unix(0, 0).UTC()
	}
	return uint(userID64), issuedAtTime, sessionID, true
}

// SessionTTL returns cookie lifetime for authenticated session.
func (s *SessionService) SessionTTL() time.Duration {
	return s.ttl
}

func (s *SessionService) sign(payload string) string {
	mac := hmac.New(sha256.New, s.secret)
	mac.Write([]byte(payload))
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}

func generateSessionID() (string, error) {
	buf := make([]byte, 18)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buf), nil
}
