package web

import "github.com/go-chi/chi/v5"

func (a *App) registerAuthenticationRoutes(r chi.Router) {
	a.registerAccountEntryRoutes(r)
	a.registerPasswordResetRoutes(r)
	a.registerSessionRoutes(r)
	a.registerAPIAuthenticationRoutes(r)
}

func (a *App) registerAccountEntryRoutes(r chi.Router) {
	r.Get("/register", a.showRegister)
	r.Get("/mobile/register", a.showRegister)
	r.Get("/mobile/light/register", a.showRegister)
	r.Post("/register", a.handleRegister)
	r.Post("/light/register", a.handleRegister)
	r.Post("/mobile/register", a.handleRegister)
	r.Post("/mobile/light/register", a.handleRegister)
	r.Get("/login", a.showLogin)
	r.Get("/mobile/login", a.showLogin)
	r.Get("/mobile/light/login", a.showLogin)
	r.Post("/login", a.handleLogin)
	r.Post("/light/login", a.handleLogin)
	r.Post("/mobile/login", a.handleLogin)
	r.Post("/mobile/light/login", a.handleLogin)
	r.Post("/logout", a.handleLogout)
}

func (a *App) registerPasswordResetRoutes(r chi.Router) {
	r.Get("/account/password-reset/request", a.showPasswordResetRequest)
	r.Get("/mobile/account/password-reset/request", a.showPasswordResetRequest)
	r.Get("/mobile/light/account/password-reset/request", a.showPasswordResetRequest)
	r.Post("/account/password-reset/request", a.handlePasswordResetRequest)
	r.Post("/light/account/password-reset/request", a.handlePasswordResetRequest)
	r.Post("/mobile/account/password-reset/request", a.handlePasswordResetRequest)
	r.Post("/mobile/light/account/password-reset/request", a.handlePasswordResetRequest)
	r.Get("/account/password-reset/confirm", a.showPasswordResetConfirm)
	r.Get("/mobile/account/password-reset/confirm", a.showPasswordResetConfirm)
	r.Get("/mobile/light/account/password-reset/confirm", a.showPasswordResetConfirm)
	r.Post("/account/password-reset/confirm", a.handlePasswordResetConfirm)
	r.Post("/light/account/password-reset/confirm", a.handlePasswordResetConfirm)
	r.Post("/mobile/account/password-reset/confirm", a.handlePasswordResetConfirm)
	r.Post("/mobile/light/account/password-reset/confirm", a.handlePasswordResetConfirm)
	r.Post("/api/v1/account/password-reset/request", a.handleAPIAccountPasswordResetRequest)
	r.Post("/api/v1/account/password-reset/confirm", a.handleAPIAccountPasswordResetConfirm)
}

func (a *App) registerSessionRoutes(r chi.Router) {
	r.Get("/auth/dingtalk/start", a.handleDingTalkStart)
	r.Get("/auth/dingtalk/callback", a.handleDingTalkCallback)
	r.Get("/auth/sso/start/{provider}", a.handleSSOStart)
	r.Get("/auth/sso/callback/{provider}", a.handleSSOCallback)
}

func (a *App) registerAPIAuthenticationRoutes(r chi.Router) {
	r.Route("/api/v1/auth", func(apiAuth chi.Router) {
		apiAuth.Get("/providers", a.handleAPIAuthProviders)
		apiAuth.Get("/csrf", a.handleAPIAuthCSRF)
		apiAuth.Post("/login", a.handleAPIAuthLogin)
		apiAuth.Get("/me", a.handleAPIAuthMe)
		apiAuth.With(a.requireAuth).Post("/logout", a.handleAPIAuthLogout)
	})
}
