package web

type authProviderDefinition struct {
	Key                string
	DefaultDisplayName string
	LabelKey           string
	ShortLabelKey      string
	IconPath           string
	ManagementKind     string
}

var authProviderDefinitions = []authProviderDefinition{
	{
		Key:                "dingtalk",
		DefaultDisplayName: "DingTalk",
		LabelKey:           "auth.sign_in_dingtalk",
		ShortLabelKey:      "auth.provider_dingtalk",
		IconPath:           "/static/icons/auth/dingtalk.svg",
		ManagementKind:     "oidc",
	},
	{
		Key:                "feishu",
		DefaultDisplayName: "Feishu",
		LabelKey:           "auth.sign_in_feishu",
		ShortLabelKey:      "auth.provider_feishu",
		IconPath:           "",
		ManagementKind:     "oidc",
	},
	{
		Key:                "github",
		DefaultDisplayName: "GitHub",
		LabelKey:           "auth.sign_in_github",
		ShortLabelKey:      "auth.provider_github",
		IconPath:           "/static/icons/auth/github.svg",
		ManagementKind:     "oidc",
	},
	{
		Key:                "google",
		DefaultDisplayName: "Google",
		LabelKey:           "auth.sign_in_google",
		ShortLabelKey:      "auth.provider_google",
		IconPath:           "/static/icons/auth/google.svg",
		ManagementKind:     "oidc",
	},
	{
		Key:                "wecom",
		DefaultDisplayName: "WeCom",
		LabelKey:           "auth.sign_in_wecom",
		ShortLabelKey:      "auth.provider_wecom",
		IconPath:           "/static/icons/auth/wecom.svg",
		ManagementKind:     "oidc",
	},
	{
		Key:                "microsoft",
		DefaultDisplayName: "Microsoft",
		LabelKey:           "auth.sign_in_microsoft",
		ShortLabelKey:      "auth.provider_microsoft",
		IconPath:           "/static/icons/auth/microsoft.svg",
		ManagementKind:     "oidc",
	},
}

var authProviderOrder = buildAuthProviderOrder()
var authProviderLabelKeys = buildAuthProviderLabelKeys()
var authProviderShortLabelKeys = buildAuthProviderShortLabelKeys()
var authProviderIconPaths = buildAuthProviderIconPaths()
var authProviderDefinitionsByKey = buildAuthProviderDefinitionsByKey()

func buildAuthProviderOrder() []string {
	items := make([]string, 0, len(authProviderDefinitions))
	for _, definition := range authProviderDefinitions {
		items = append(items, definition.Key)
	}
	return items
}

func buildAuthProviderLabelKeys() map[string]string {
	items := make(map[string]string, len(authProviderDefinitions))
	for _, definition := range authProviderDefinitions {
		items[definition.Key] = definition.LabelKey
	}
	return items
}

func buildAuthProviderShortLabelKeys() map[string]string {
	items := make(map[string]string, len(authProviderDefinitions))
	for _, definition := range authProviderDefinitions {
		items[definition.Key] = definition.ShortLabelKey
	}
	return items
}

func buildAuthProviderIconPaths() map[string]string {
	items := make(map[string]string, len(authProviderDefinitions))
	for _, definition := range authProviderDefinitions {
		items[definition.Key] = definition.IconPath
	}
	return items
}

func buildAuthProviderDefinitionsByKey() map[string]authProviderDefinition {
	items := make(map[string]authProviderDefinition, len(authProviderDefinitions))
	for _, definition := range authProviderDefinitions {
		items[definition.Key] = definition
	}
	return items
}

func authProviderDefinitionFor(key string) (authProviderDefinition, bool) {
	definition, ok := authProviderDefinitionsByKey[key]
	return definition, ok
}
