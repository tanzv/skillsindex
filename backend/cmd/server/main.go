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
		StartupLabel: "SkillsIndex is listening at",
		ForceAPIOnly: false,
		StateInit:    bootstrap.ServerStateInitializationOptions(),
	}); err != nil {
		log.Fatalf("%v", err)
	}
}
