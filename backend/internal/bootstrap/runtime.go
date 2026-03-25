package bootstrap

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"strings"
	"time"

	"skillsindex/internal/config"
	"skillsindex/internal/web"
)

const defaultCORSOrigin = "http://localhost:5173"
const defaultHTTPShutdownTimeout = 10 * time.Second
const defaultTemplateGlob = "web/templates/*.tmpl"

// RunOptions controls command-level startup behavior.
type RunOptions struct {
	StartupLabel string
	ForceAPIOnly bool
	StateInit    *StateInitializationOptions
}

// StateInitializationOptions controls which persistent startup tasks are executed.
type StateInitializationOptions struct {
	SeedData             bool
	DefaultAccount       bool
	RegistrationSetting  bool
	RepositorySyncPolicy bool
	RepositorySyncMirror bool
}

func defaultStateInitializationOptions() StateInitializationOptions {
	return StateInitializationOptions{
		SeedData:             true,
		DefaultAccount:       true,
		RegistrationSetting:  true,
		RepositorySyncPolicy: true,
		RepositorySyncMirror: true,
	}
}

// BootstrapStateInitializationOptions returns the startup state policy for explicit bootstrap runs.
func BootstrapStateInitializationOptions() *StateInitializationOptions {
	options := defaultStateInitializationOptions()
	return &options
}

// NormalizeRuntimeConfig applies runtime defaults for a command entrypoint.
func NormalizeRuntimeConfig(cfg config.Config, options RunOptions) config.Config {
	if options.ForceAPIOnly {
		cfg.APIOnly = true
	}
	if len(cfg.CORSAllowedOrigins) == 0 && !cfg.IsProduction() {
		cfg.CORSAllowedOrigins = []string{defaultCORSOrigin}
	}
	return cfg
}

// ValidateSecurityDefaults checks required production safeguards.
func ValidateSecurityDefaults(cfg config.Config) error {
	if !cfg.IsProduction() {
		return nil
	}
	if strings.TrimSpace(cfg.SessionSecret) == "" || cfg.SessionSecret == "change-me-in-production" {
		return errors.New("SESSION_SECRET must be explicitly configured in production")
	}
	if strings.TrimSpace(cfg.AdminPassword) == "" || cfg.AdminPassword == "Admin123456!" {
		return errors.New("ADMIN_PASSWORD must be explicitly configured in production")
	}
	return nil
}

// LogAPIKeyWarning emits a warning when no static API keys are configured.
func LogAPIKeyWarning(logger *log.Logger, cfg config.Config) {
	if logger == nil {
		logger = log.Default()
	}
	if len(cfg.APIKeys) == 0 {
		logger.Printf("API_KEYS is empty; API routes require database-issued API keys")
	}
}

func resolveTemplateGlob(apiOnly bool) string {
	if apiOnly {
		return ""
	}
	return defaultTemplateGlob
}

func resolveStateInitializationOptions(options *StateInitializationOptions) StateInitializationOptions {
	if options == nil {
		return defaultStateInitializationOptions()
	}
	return *options
}

// ServerStateInitializationOptions returns the startup state policy for the web server command.
func ServerStateInitializationOptions() *StateInitializationOptions {
	options := defaultStateInitializationOptions()
	options.SeedData = false
	options.DefaultAccount = false
	options.RepositorySyncPolicy = false
	options.RepositorySyncMirror = false
	return &options
}

// APIStateInitializationOptions returns the startup state policy for the API-only command.
func APIStateInitializationOptions() *StateInitializationOptions {
	options := defaultStateInitializationOptions()
	options.SeedData = false
	options.DefaultAccount = false
	options.RepositorySyncPolicy = false
	options.RepositorySyncMirror = false
	return &options
}

// RunAPIServer bootstraps all dependencies and starts the HTTP API server.
func RunAPIServer(ctx context.Context, cfg config.Config, options RunOptions) error {
	if ctx == nil {
		ctx = context.Background()
	}

	runtimeConfig := NormalizeRuntimeConfig(cfg, options)
	if err := ValidateSecurityDefaults(runtimeConfig); err != nil {
		return err
	}
	LogAPIKeyWarning(log.Default(), runtimeConfig)

	if err := os.MkdirAll(runtimeConfig.StoragePath, 0o755); err != nil {
		return fmt.Errorf("failed to create storage path: %w", err)
	}

	core, err := prepareRuntimeBootstrapCore(ctx, runtimeConfig, resolveStateInitializationOptions(options.StateInit))
	if err != nil {
		return err
	}
	defer core.close()

	serviceSet, err := buildRuntimeServices(
		ctx,
		runtimeConfig,
		core.database,
		core.authService,
		core.settingsService,
		core.repoSyncPolicyService,
		core.syncPolicyRecordService,
	)
	if err != nil {
		return err
	}

	app, err := web.NewApp(buildWebAppDependencies(runtimeConfig, serviceSet))
	if err != nil {
		return fmt.Errorf("failed to build web app: %w", err)
	}

	httpServer := &http.Server{
		Addr:              ":" + runtimeConfig.ServerPort,
		Handler:           app.Router(),
		ReadHeaderTimeout: 10 * time.Second,
	}
	listener, err := net.Listen("tcp", httpServer.Addr)
	if err != nil {
		return fmt.Errorf("failed to listen on %s: %w", httpServer.Addr, err)
	}
	log.Printf(
		"repository sync scheduler initialized bootstrap_enabled=%t interval=%s timeout=%s batch_size=%d",
		runtimeConfig.RepoSyncEnabled,
		runtimeConfig.RepoSyncInterval,
		runtimeConfig.RepoSyncTimeout,
		runtimeConfig.RepoSyncBatchSize,
	)

	startupLabel := strings.TrimSpace(options.StartupLabel)
	if startupLabel == "" {
		startupLabel = "SkillsIndex is listening at"
	}
	fmt.Printf("%s %s\n", startupLabel, buildStartupURL(listener))
	if err := runHTTPServerWithScheduler(ctx, httpServer, listener, serviceSet.scheduler, defaultHTTPShutdownTimeout); err != nil {
		return fmt.Errorf("server failed: %w", err)
	}
	return nil
}

// RunBootstrapState applies schema migration and explicit state initialization without starting the HTTP server.
func RunBootstrapState(ctx context.Context, cfg config.Config, options *StateInitializationOptions) error {
	if ctx == nil {
		ctx = context.Background()
	}

	runtimeConfig := NormalizeRuntimeConfig(cfg, RunOptions{})
	if err := ValidateSecurityDefaults(runtimeConfig); err != nil {
		return err
	}

	core, err := prepareRuntimeBootstrapCore(ctx, runtimeConfig, resolveStateInitializationOptions(options))
	if err != nil {
		return err
	}
	defer core.close()

	log.Printf("bootstrap state initialization completed")
	return nil
}

type managedHTTPServer interface {
	Serve(net.Listener) error
	Shutdown(context.Context) error
}

type managedScheduler interface {
	Start(context.Context)
}

func buildStartupURL(listener net.Listener) string {
	if listener == nil {
		return "http://localhost"
	}
	host, port, err := net.SplitHostPort(listener.Addr().String())
	if err != nil {
		return "http://" + listener.Addr().String()
	}
	if host == "" || host == "::" || host == "0.0.0.0" {
		host = "localhost"
	}
	return fmt.Sprintf("http://%s:%s", host, port)
}

func runHTTPServerWithScheduler(
	ctx context.Context,
	server managedHTTPServer,
	listener net.Listener,
	scheduler managedScheduler,
	shutdownTimeout time.Duration,
) error {
	if listener == nil {
		return fmt.Errorf("listener is required")
	}
	if ctx == nil {
		ctx = context.Background()
	}

	runCtx, cancel := context.WithCancel(ctx)
	defer cancel()

	if scheduler != nil {
		scheduler.Start(runCtx)
	}
	return runHTTPServer(runCtx, server, listener, shutdownTimeout)
}

func runHTTPServer(ctx context.Context, server managedHTTPServer, listener net.Listener, shutdownTimeout time.Duration) error {
	if ctx == nil {
		ctx = context.Background()
	}
	if listener == nil {
		return fmt.Errorf("listener is required")
	}
	defer func() {
		if closeErr := listener.Close(); closeErr != nil && !errors.Is(closeErr, net.ErrClosed) {
			log.Printf("failed to close listener: %v", closeErr)
		}
	}()
	errCh := make(chan error, 1)
	go func() {
		errCh <- server.Serve(listener)
	}()

	select {
	case err := <-errCh:
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			return err
		}
		return nil
	case <-ctx.Done():
		shutdownCtx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
		defer cancel()
		if err := server.Shutdown(shutdownCtx); err != nil {
			return fmt.Errorf("shutdown failed: %w", err)
		}
		err := <-errCh
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			return err
		}
		return nil
	}
}
