package web

import (
	"testing"

	"skillsindex/internal/models"
)

func TestCountSkillBuckets(t *testing.T) {
	items := []models.Skill{
		{Visibility: models.VisibilityPublic, SourceType: models.SourceTypeManual},
		{Visibility: models.VisibilityPrivate, SourceType: models.SourceTypeUpload},
		{Visibility: models.VisibilityPublic, SourceType: models.SourceTypeRepository},
		{Visibility: models.VisibilityPrivate, SourceType: models.SourceTypeSkillMP},
	}

	publicCount, privateCount, syncableCount := countSkillBuckets(items)
	if publicCount != 2 {
		t.Fatalf("unexpected public count: got=%d want=2", publicCount)
	}
	if privateCount != 2 {
		t.Fatalf("unexpected private count: got=%d want=2", privateCount)
	}
	if syncableCount != 2 {
		t.Fatalf("unexpected syncable count: got=%d want=2", syncableCount)
	}
}
