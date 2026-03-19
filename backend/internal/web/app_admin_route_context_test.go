package web

import "testing"

func TestResolveAdminRouteContext(t *testing.T) {
	cases := []struct {
		name         string
		section      string
		subsection   string
		detail       string
		extra        string
		wantSection  string
		wantMode     string
		wantIncident string
	}{
		{
			name:        "ingestion repository route",
			section:     "ingestion",
			subsection:  "repository",
			wantSection: "ingestion",
			wantMode:    "repository",
		},
		{
			name:        "records sync jobs route",
			section:     "records",
			subsection:  "sync-jobs",
			wantSection: "records",
			wantMode:    "sync-jobs",
		},
		{
			name:        "integrations webhook logs route",
			section:     "integrations",
			subsection:  "webhooks",
			detail:      "logs",
			wantSection: "integrations",
			wantMode:    "webhooks",
		},
		{
			name:         "incidents response route",
			section:      "incidents",
			subsection:   "42",
			detail:       "response",
			wantSection:  "incidents",
			wantMode:     "response",
			wantIncident: "42",
		},
		{
			name:        "accounts new route",
			section:     "accounts",
			subsection:  "new",
			wantSection: "access",
			wantMode:    "accounts-new",
		},
		{
			name:        "roles list route",
			section:     "roles",
			wantSection: "access",
			wantMode:    "roles-list",
		},
		{
			name:        "moderation route",
			section:     "moderation",
			wantSection: "moderation",
		},
		{
			name:        "ops metrics route",
			section:     "ops",
			subsection:  "metrics",
			wantSection: "ops",
			wantMode:    "metrics",
		},
		{
			name:        "ops release gates route",
			section:     "ops",
			subsection:  "release-gates",
			wantSection: "ops",
			wantMode:    "release-gates",
		},
		{
			name:        "ops recovery drills route",
			section:     "ops",
			subsection:  "recovery-drills",
			wantSection: "ops",
			wantMode:    "recovery-drills",
		},
		{
			name:        "ops releases route",
			section:     "ops",
			subsection:  "releases",
			wantSection: "ops",
			wantMode:    "releases",
		},
		{
			name:        "ops change approvals route",
			section:     "ops",
			subsection:  "change-approvals",
			wantSection: "ops",
			wantMode:    "change-approvals",
		},
		{
			name:        "ops backup plans route",
			section:     "ops",
			subsection:  "backup-plans",
			wantSection: "ops",
			wantMode:    "backup-plans",
		},
		{
			name:        "ops backup runs route",
			section:     "ops",
			subsection:  "backup-runs",
			wantSection: "ops",
			wantMode:    "backup-runs",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			ctx := resolveAdminRouteContext(tc.section, tc.subsection, tc.detail, tc.extra)
			if ctx.Section != tc.wantSection {
				t.Fatalf("unexpected section: got=%s want=%s", ctx.Section, tc.wantSection)
			}

			mode := ""
			switch ctx.Section {
			case "ingestion":
				mode = ctx.IngestionSource
			case "records":
				mode = ctx.RecordsMode
			case "integrations":
				mode = ctx.IntegrationsMode
			case "incidents":
				mode = ctx.IncidentsMode
			case "access":
				mode = ctx.AccessMode
			case "ops":
				mode = ctx.OpsMode
			}

			if mode != tc.wantMode {
				t.Fatalf("unexpected mode: got=%s want=%s", mode, tc.wantMode)
			}
			if ctx.IncidentID != tc.wantIncident {
				t.Fatalf("unexpected incident id: got=%s want=%s", ctx.IncidentID, tc.wantIncident)
			}
		})
	}
}
