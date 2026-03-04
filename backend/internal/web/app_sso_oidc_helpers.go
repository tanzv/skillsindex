package web

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
)

func verifySSOIDToken(
	ctx context.Context,
	cfg ssoConnectorConfig,
	rawIDToken string,
	expectedNonce string,
) (map[string]any, error) {
	token := strings.TrimSpace(rawIDToken)
	if token == "" {
		return map[string]any{}, nil
	}

	issuer := strings.TrimSpace(cfg.Issuer)
	if issuer == "" {
		return nil, fmt.Errorf("oidc issuer is required for id token verification")
	}
	clientID := strings.TrimSpace(cfg.ClientID)
	if clientID == "" {
		return nil, fmt.Errorf("oidc client id is required for id token verification")
	}

	verifyCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	provider, err := oidc.NewProvider(verifyCtx, issuer)
	if err != nil {
		return nil, fmt.Errorf("failed to discover oidc provider: %w", err)
	}

	verifiedToken, err := provider.Verifier(&oidc.Config{ClientID: clientID}).Verify(verifyCtx, token)
	if err != nil {
		return nil, fmt.Errorf("failed to verify id token: %w", err)
	}

	claims := make(map[string]any)
	if err := verifiedToken.Claims(&claims); err != nil {
		return nil, fmt.Errorf("failed to decode id token claims: %w", err)
	}

	nonce := strings.TrimSpace(expectedNonce)
	if nonce != "" {
		claimNonce := strings.TrimSpace(claimString(claims, "nonce"))
		if claimNonce == "" || claimNonce != nonce {
			return nil, fmt.Errorf("id token nonce mismatch")
		}
	}

	return claims, nil
}
