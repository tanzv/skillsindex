package web

var authProviderOrder = []string{
	"dingtalk",
	"github",
	"google",
	"wecom",
	"microsoft",
}

var authProviderLabelKeys = map[string]string{
	"dingtalk":  "auth.sign_in_dingtalk",
	"github":    "auth.sign_in_github",
	"google":    "auth.sign_in_google",
	"wecom":     "auth.sign_in_wecom",
	"microsoft": "auth.sign_in_microsoft",
}

var authProviderShortLabelKeys = map[string]string{
	"dingtalk":  "auth.provider_dingtalk",
	"github":    "auth.provider_github",
	"google":    "auth.provider_google",
	"wecom":     "auth.provider_wecom",
	"microsoft": "auth.provider_microsoft",
}

var authProviderIconPaths = map[string]string{
	"dingtalk":  "/static/icons/auth/dingtalk.svg",
	"github":    "/static/icons/auth/github.svg",
	"google":    "/static/icons/auth/google.svg",
	"wecom":     "/static/icons/auth/wecom.svg",
	"microsoft": "/static/icons/auth/microsoft.svg",
}
