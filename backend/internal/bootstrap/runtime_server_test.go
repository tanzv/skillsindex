package bootstrap

import (
	"context"
	"errors"
	"net"
	"net/http"
	"testing"
	"time"
)

type fakeHTTPServer struct {
	listenError   error
	listenStarted chan struct{}
	shutdownCalls int
	shutdownError error
	stopListen    chan struct{}
}

func newFakeHTTPServer(listenError error, shutdownError error) *fakeHTTPServer {
	return &fakeHTTPServer{
		listenError:   listenError,
		listenStarted: make(chan struct{}, 1),
		shutdownError: shutdownError,
		stopListen:    make(chan struct{}),
	}
}

func (f *fakeHTTPServer) Serve(net.Listener) error {
	select {
	case f.listenStarted <- struct{}{}:
	default:
	}
	if f.listenError != nil {
		return f.listenError
	}
	<-f.stopListen
	return http.ErrServerClosed
}

func (f *fakeHTTPServer) Shutdown(context.Context) error {
	f.shutdownCalls++
	close(f.stopListen)
	return f.shutdownError
}

func TestRunHTTPServerReturnsListenError(t *testing.T) {
	fake := newFakeHTTPServer(errors.New("listen failed"), nil)
	listener := newTestListener(t)
	defer listener.Close()

	err := runHTTPServer(context.Background(), fake, listener, 50*time.Millisecond)
	if err == nil {
		t.Fatalf("expected listen error")
	}
}

func TestRunHTTPServerReturnsNilOnServerClosed(t *testing.T) {
	fake := newFakeHTTPServer(http.ErrServerClosed, nil)
	listener := newTestListener(t)
	defer listener.Close()

	err := runHTTPServer(context.Background(), fake, listener, 50*time.Millisecond)
	if err != nil {
		t.Fatalf("expected nil error when server closes: %v", err)
	}
}

func TestRunHTTPServerShutsDownOnContextCancel(t *testing.T) {
	fake := newFakeHTTPServer(nil, nil)
	ctx, cancel := context.WithCancel(context.Background())
	listener := newTestListener(t)
	defer listener.Close()

	done := make(chan error, 1)
	go func() {
		done <- runHTTPServer(ctx, fake, listener, 50*time.Millisecond)
	}()

	select {
	case <-fake.listenStarted:
	case <-time.After(time.Second):
		t.Fatalf("server did not start listening")
	}

	cancel()

	select {
	case err := <-done:
		if err != nil {
			t.Fatalf("expected graceful shutdown, got error: %v", err)
		}
	case <-time.After(time.Second):
		t.Fatalf("server did not stop after context cancellation")
	}

	if fake.shutdownCalls != 1 {
		t.Fatalf("expected one shutdown call, got %d", fake.shutdownCalls)
	}
}

func newTestListener(t *testing.T) net.Listener {
	t.Helper()

	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("failed to create test listener: %v", err)
	}
	return listener
}
