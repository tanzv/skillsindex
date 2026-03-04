package web

import "testing"

func TestClaimBool(t *testing.T) {
	payload := map[string]any{
		"verified_true":   true,
		"verified_false":  false,
		"verified_string": "true",
		"verified_number": float64(1),
	}

	if got, ok := claimBool(payload, "verified_true"); !ok || !got {
		t.Fatalf("expected verified_true claim to resolve true")
	}
	if got, ok := claimBool(payload, "verified_false"); !ok || got {
		t.Fatalf("expected verified_false claim to resolve false")
	}
	if got, ok := claimBool(payload, "verified_string"); !ok || !got {
		t.Fatalf("expected verified_string claim to resolve true")
	}
	if got, ok := claimBool(payload, "verified_number"); !ok || !got {
		t.Fatalf("expected verified_number claim to resolve true")
	}
	if _, ok := claimBool(payload, "missing_key"); ok {
		t.Fatalf("expected missing claim to be unresolved")
	}
}
