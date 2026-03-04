package services

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestDingTalkBuildAuthURL(t *testing.T) {
	svc := NewDingTalkService(DingTalkConfig{
		ClientID:     "client-id-1",
		ClientSecret: "client-secret-1",
		RedirectURL:  "http://localhost:8080/auth/dingtalk/callback",
		Scope:        "openid",
		AuthBaseURL:  "https://login.dingtalk.com/oauth2/auth",
		APIBaseURL:   "https://api.dingtalk.com",
		HTTPTimeout:  5 * time.Second,
		Prompt:       "consent",
	})

	authURL, err := svc.BuildAuthURL("state-123")
	if err != nil {
		t.Fatalf("build auth url failed: %v", err)
	}
	if !strings.Contains(authURL, "client_id=client-id-1") {
		t.Fatalf("missing client_id in auth url: %s", authURL)
	}
	if !strings.Contains(authURL, "response_type=code") {
		t.Fatalf("missing response_type in auth url: %s", authURL)
	}
	if !strings.Contains(authURL, "scope=openid") {
		t.Fatalf("missing scope in auth url: %s", authURL)
	}
	if !strings.Contains(authURL, "state=state-123") {
		t.Fatalf("missing state in auth url: %s", authURL)
	}
}

func TestDingTalkExchangeAndFetchUser(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/v1.0/oauth2/userAccessToken":
			if r.Method != http.MethodPost {
				t.Fatalf("unexpected method for token endpoint: %s", r.Method)
			}
			_ = json.NewEncoder(w).Encode(map[string]any{
				"accessToken":          "access-token-1",
				"refreshToken":         "refresh-token-1",
				"expireIn":             3600,
				"refreshTokenExpireIn": 86400,
				"scope":                "openid",
				"tokenType":            "Bearer",
			})
		case "/v1.0/contact/users/me":
			if got := r.Header.Get("x-acs-dingtalk-access-token"); got != "access-token-1" {
				t.Fatalf("unexpected token header: %s", got)
			}
			_ = json.NewEncoder(w).Encode(map[string]any{
				"nick":      "Ding Tester",
				"unionId":   "union-uid-1",
				"openId":    "openid-1",
				"avatarUrl": "https://example.com/a.png",
			})
		default:
			http.NotFound(w, r)
		}
	}))
	defer srv.Close()

	svc := NewDingTalkService(DingTalkConfig{
		ClientID:     "client-id-1",
		ClientSecret: "client-secret-1",
		RedirectURL:  "http://localhost:8080/auth/dingtalk/callback",
		Scope:        "openid",
		AuthBaseURL:  "https://login.dingtalk.com/oauth2/auth",
		APIBaseURL:   srv.URL,
		HTTPTimeout:  5 * time.Second,
		Prompt:       "consent",
	})

	token, err := svc.ExchangeCode(context.Background(), "code-xyz")
	if err != nil {
		t.Fatalf("exchange code failed: %v", err)
	}
	if token.AccessToken != "access-token-1" {
		t.Fatalf("unexpected access token: %s", token.AccessToken)
	}
	if token.ExpiresInSeconds != 3600 {
		t.Fatalf("unexpected expires in: %d", token.ExpiresInSeconds)
	}

	user, err := svc.GetCurrentUser(context.Background(), token.AccessToken)
	if err != nil {
		t.Fatalf("fetch current user failed: %v", err)
	}
	if user.UnionID != "union-uid-1" {
		t.Fatalf("unexpected union id: %s", user.UnionID)
	}
	if user.OpenID != "openid-1" {
		t.Fatalf("unexpected open id: %s", user.OpenID)
	}
	if user.DisplayName != "Ding Tester" {
		t.Fatalf("unexpected display name: %s", user.DisplayName)
	}
}
