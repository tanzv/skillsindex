package web

import (
	"strings"
	"sync"
	"time"
)

const (
	defaultLoginThrottleThreshold    = 5
	defaultLoginThrottleWindow       = 15 * time.Minute
	defaultLoginThrottleLockDuration = 15 * time.Minute
)

type loginThrottleBucket struct {
	FirstFailureAt time.Time
	Failures       int
	LockedUntil    time.Time
}

type loginThrottleState struct {
	mu           sync.Mutex
	now          func() time.Time
	threshold    int
	window       time.Duration
	lockDuration time.Duration
	buckets      map[string]loginThrottleBucket
}

func newLoginThrottleState() *loginThrottleState {
	return &loginThrottleState{
		now:          time.Now,
		threshold:    defaultLoginThrottleThreshold,
		window:       defaultLoginThrottleWindow,
		lockDuration: defaultLoginThrottleLockDuration,
		buckets:      map[string]loginThrottleBucket{},
	}
}

func (s *loginThrottleState) limited(username string, issuedIP string) bool {
	if s == nil {
		return false
	}

	now := s.now().UTC()
	keys := loginThrottleKeys(username, issuedIP)

	s.mu.Lock()
	defer s.mu.Unlock()

	for key, bucket := range s.buckets {
		if bucket.LockedUntil.IsZero() {
			if bucket.FirstFailureAt.IsZero() || now.Sub(bucket.FirstFailureAt) > s.window {
				delete(s.buckets, key)
			}
			continue
		}
		if !bucket.LockedUntil.After(now) {
			delete(s.buckets, key)
		}
	}

	for _, key := range keys {
		bucket, ok := s.buckets[key]
		if !ok {
			continue
		}
		if bucket.LockedUntil.After(now) {
			return true
		}
	}

	return false
}

func (s *loginThrottleState) recordFailure(username string, issuedIP string) {
	if s == nil {
		return
	}

	now := s.now().UTC()
	keys := loginThrottleKeys(username, issuedIP)

	s.mu.Lock()
	defer s.mu.Unlock()

	for _, key := range keys {
		bucket := s.buckets[key]
		if bucket.FirstFailureAt.IsZero() || now.Sub(bucket.FirstFailureAt) > s.window {
			bucket = loginThrottleBucket{
				FirstFailureAt: now,
				Failures:       0,
			}
		}
		bucket.Failures++
		if bucket.Failures >= s.threshold {
			bucket.LockedUntil = now.Add(s.lockDuration)
			bucket.Failures = 0
			bucket.FirstFailureAt = now
		}
		s.buckets[key] = bucket
	}
}

func (s *loginThrottleState) recordSuccess(username string, issuedIP string) {
	if s == nil {
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	for _, key := range loginThrottleKeys(username, issuedIP) {
		delete(s.buckets, key)
	}
}

func loginThrottleKeys(username string, issuedIP string) []string {
	keys := make([]string, 0, 2)

	normalizedUsername := strings.TrimSpace(strings.ToLower(username))
	if normalizedUsername != "" {
		keys = append(keys, "user:"+normalizedUsername)
	}

	normalizedIP := sanitizeIssuedIP(issuedIP)
	if normalizedIP != "" {
		keys = append(keys, "ip:"+normalizedIP)
	}

	return keys
}

func (a *App) loginThrottleState() *loginThrottleState {
	if a.loginThrottle == nil {
		a.loginThrottle = newLoginThrottleState()
	}
	return a.loginThrottle
}
