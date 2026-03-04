package web

import (
	"testing"

	"skillsindex/internal/models"
)

func TestNormalizeSSODefaultUserRole(t *testing.T) {
	cases := []struct {
		name string
		raw  string
		want models.UserRole
	}{
		{name: "empty defaults to member", raw: "", want: models.RoleMember},
		{name: "viewer allowed", raw: "viewer", want: models.RoleViewer},
		{name: "member allowed", raw: "member", want: models.RoleMember},
		{name: "admin rejected", raw: "admin", want: models.RoleMember},
		{name: "super admin rejected", raw: "super_admin", want: models.RoleMember},
	}

	for _, tc := range cases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			got := normalizeSSODefaultUserRole(tc.raw)
			if got != tc.want {
				t.Fatalf("unexpected role: got=%s want=%s", got, tc.want)
			}
		})
	}
}

func TestNormalizeSSODefaultOrganizationGroupRules(t *testing.T) {
	raw := `[{"group":"engineering","org_id":12,"org_role":"viewer"},{"group":"engineering","org_id":12,"org_role":"member"},{"group":"ops","org_id":13,"org_role":"member"},{"group":"","org_id":14,"org_role":"viewer"}]`
	rules := normalizeSSODefaultOrganizationGroupRules(raw)
	if len(rules) != 2 {
		t.Fatalf("unexpected rules length: got=%d want=%d", len(rules), 2)
	}
	if rules[0].Group != "engineering" || rules[0].OrgID != 12 || rules[0].OrgRole != models.OrganizationRoleViewer {
		t.Fatalf("unexpected first rule: %#v", rules[0])
	}
	if rules[1].Group != "ops" || rules[1].OrgID != 13 || rules[1].OrgRole != models.OrganizationRoleMember {
		t.Fatalf("unexpected second rule: %#v", rules[1])
	}
}

func TestNormalizeSSOClaimEmailVerified(t *testing.T) {
	if got := normalizeSSOClaimEmailVerified(""); got != "email_verified" {
		t.Fatalf("unexpected default claim: got=%s want=%s", got, "email_verified")
	}
	if got := normalizeSSOClaimEmailVerified("verified_flag"); got != "verified_flag" {
		t.Fatalf("unexpected custom claim: got=%s want=%s", got, "verified_flag")
	}
}
