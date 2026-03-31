package web

type (
	marketplacePresentationSubcategoryDefinition struct {
		Name                   string
		Slug                   string
		LegacyCategorySlugs    []string
		LegacySubcategorySlugs []string
		Keywords               []string
	}

	marketplacePresentationCategoryDefinition struct {
		Name          string
		Description   string
		Slug          string
		Subcategories []marketplacePresentationSubcategoryDefinition
	}

	marketplacePresentationClassificationInput struct {
		RawCategory    string
		RawSubcategory string
		RawLabel       string
		RawDescription string
		Tags           []string
		SourceType     string
	}

	marketplacePresentationClassification struct {
		CategorySlug        string
		CategoryLabel       string
		CategoryDescription string
		SubcategorySlug     string
		SubcategoryLabel    string
	}
)
