package web

import "strings"

func adminPageName(section string) string {
	return "admin_" + normalizeAdminSection(section)
}

func isAdminPage(page string) bool {
	clean := strings.ToLower(strings.TrimSpace(page))
	return clean == "admin" || strings.HasPrefix(clean, "admin_")
}

func bodyClass(page string) string {
	clean := strings.ToLower(strings.TrimSpace(page))
	if isAdminPage(clean) {
		return "page-admin"
	}
	if clean == "" {
		clean = "home"
	}
	switch clean {
	case "categories", "category", "timeline", "docs", "api_docs", "about", "swagger", "compare", "rollout", "workspace", "governance", "detail", "prototype_auth", "state_loading", "state_empty", "state_error", "state_permission":
		return "page-home page-" + clean
	case "password_reset_request", "password_reset_confirm":
		return "page-login"
	case "register_light":
		return "page-register page-login-light"
	case "register_mobile":
		return "page-register page-login-mobile"
	case "register_mobile_light":
		return "page-register page-login-mobile page-login-light"
	case "login_light":
		return "page-login page-login-light"
	case "login_mobile":
		return "page-login page-login-mobile"
	case "login_mobile_light":
		return "page-login page-login-mobile page-login-light"
	case "password_reset_request_light", "password_reset_confirm_light":
		return "page-login page-login-light"
	case "password_reset_request_mobile", "password_reset_confirm_mobile":
		return "page-login page-login-mobile"
	case "password_reset_request_mobile_light", "password_reset_confirm_mobile_light":
		return "page-login page-login-mobile page-login-light"
	}
	return "page-" + clean
}

func isLoginPage(page string) bool {
	switch strings.ToLower(strings.TrimSpace(page)) {
	case "login", "login_light", "login_mobile", "login_mobile_light":
		return true
	default:
		return false
	}
}

func isRegisterPage(page string) bool {
	switch strings.ToLower(strings.TrimSpace(page)) {
	case "register", "register_light", "register_mobile", "register_mobile_light":
		return true
	default:
		return false
	}
}

func isPasswordResetRequestPage(page string) bool {
	switch strings.ToLower(strings.TrimSpace(page)) {
	case "password_reset_request", "password_reset_request_light", "password_reset_request_mobile", "password_reset_request_mobile_light":
		return true
	default:
		return false
	}
}

func isPasswordResetConfirmPage(page string) bool {
	switch strings.ToLower(strings.TrimSpace(page)) {
	case "password_reset_confirm", "password_reset_confirm_light", "password_reset_confirm_mobile", "password_reset_confirm_mobile_light":
		return true
	default:
		return false
	}
}

func isAuthShellPage(page string) bool {
	clean := strings.ToLower(strings.TrimSpace(page))
	return isLoginPage(clean) || isRegisterPage(clean) || isPasswordResetRequestPage(clean) || isPasswordResetConfirmPage(clean)
}

func authVariantFromPath(path string) string {
	clean := strings.TrimSpace(path)
	switch {
	case strings.HasPrefix(clean, "/mobile/light/"):
		return "mobile_light"
	case strings.HasPrefix(clean, "/mobile/"):
		return "mobile"
	case strings.HasPrefix(clean, "/light/"):
		return "light"
	default:
		return ""
	}
}

func authVariantFromPage(page string) string {
	clean := strings.ToLower(strings.TrimSpace(page))
	switch {
	case strings.HasSuffix(clean, "_mobile_light"):
		return "mobile_light"
	case strings.HasSuffix(clean, "_mobile"):
		return "mobile"
	case strings.HasSuffix(clean, "_light"):
		return "light"
	default:
		return ""
	}
}

func pageWithVariant(base string, variant string) string {
	switch strings.TrimSpace(variant) {
	case "light":
		return base + "_light"
	case "mobile":
		return base + "_mobile"
	case "mobile_light":
		return base + "_mobile_light"
	default:
		return base
	}
}

func pathWithVariant(basePath string, variant string) string {
	cleanBase := strings.TrimSpace(basePath)
	if cleanBase == "" {
		return "/"
	}
	if !strings.HasPrefix(cleanBase, "/") {
		cleanBase = "/" + cleanBase
	}
	switch strings.TrimSpace(variant) {
	case "light":
		return "/light" + cleanBase
	case "mobile":
		return "/mobile" + cleanBase
	case "mobile_light":
		return "/mobile/light" + cleanBase
	default:
		return cleanBase
	}
}

func loginPath(page string) string {
	return pathWithVariant("/login", authVariantFromPage(page))
}

func registerPath(page string) string {
	return pathWithVariant("/register", authVariantFromPage(page))
}

func passwordResetRequestPath(page string) string {
	return pathWithVariant("/account/password-reset/request", authVariantFromPage(page))
}

func passwordResetConfirmPath(page string) string {
	return pathWithVariant("/account/password-reset/confirm", authVariantFromPage(page))
}

func resolveLoginPageFromPath(path string) string {
	return pageWithVariant("login", authVariantFromPath(path))
}

func resolveRegisterPageFromPath(path string) string {
	return pageWithVariant("register", authVariantFromPath(path))
}

func resolvePasswordResetRequestPageFromPath(path string) string {
	return pageWithVariant("password_reset_request", authVariantFromPath(path))
}

func resolvePasswordResetConfirmPageFromPath(path string) string {
	return pageWithVariant("password_reset_confirm", authVariantFromPath(path))
}
