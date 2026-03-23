package main

import (
	"context"
	"log"
	"os/signal"
	"syscall"

	"skillsindex/internal/bootstrap"
	"skillsindex/internal/config"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	cfg := config.Load()
	if err := bootstrap.RunAPIServer(ctx, cfg, bootstrap.RunOptions{
		StartupLabel: "SkillsIndex API is listening at",
		ForceAPIOnly: true,
		StateInit:    bootstrap.APIStateInitializationOptions(),
	}); err != nil {
		log.Fatalf("%v", err)
	}
}
