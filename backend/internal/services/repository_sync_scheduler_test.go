package services

import (
	"context"
	"io"
	"log"
	"testing"
	"time"
)

func TestRepositorySyncSchedulerCurrentPolicyUsesProvider(t *testing.T) {
	scheduler := NewRepositorySyncScheduler(
		nil,
		nil,
		nil,
		30*time.Minute,
		10*time.Minute,
		20,
		log.New(io.Discard, "", 0),
		func(context.Context) (RepositorySyncPolicy, error) {
			return RepositorySyncPolicy{
				Enabled:   true,
				Interval:  5 * time.Minute,
				Timeout:   2 * time.Minute,
				BatchSize: 99,
			}, nil
		},
	)

	policy := scheduler.currentPolicy(context.Background())
	if policy.Interval != 5*time.Minute {
		t.Fatalf("unexpected interval: got=%s want=5m", policy.Interval)
	}
	if policy.Timeout != 2*time.Minute {
		t.Fatalf("unexpected timeout: got=%s want=2m", policy.Timeout)
	}
	if policy.BatchSize != 99 {
		t.Fatalf("unexpected batch size: got=%d want=99", policy.BatchSize)
	}
}

func TestRepositorySyncSchedulerRunOnceSkipsWhenDisabled(t *testing.T) {
	scheduler := NewRepositorySyncScheduler(
		nil,
		nil,
		nil,
		30*time.Minute,
		10*time.Minute,
		20,
		log.New(io.Discard, "", 0),
		func(context.Context) (RepositorySyncPolicy, error) {
			return RepositorySyncPolicy{
				Enabled:   false,
				Interval:  15 * time.Minute,
				Timeout:   5 * time.Minute,
				BatchSize: 10,
			}, nil
		},
	)

	scheduler.runOnce(context.Background(), "test")
}
