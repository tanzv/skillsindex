package web

type adminViewBuildError struct {
	Status  int
	Message string
	Cause   error
}

func (e *adminViewBuildError) Error() string {
	if e == nil {
		return ""
	}
	if e.Cause == nil {
		return e.Message
	}
	return e.Message + ": " + e.Cause.Error()
}

func (e *adminViewBuildError) Unwrap() error {
	if e == nil {
		return nil
	}
	return e.Cause
}

func newAdminViewBuildError(status int, message string, cause error) error {
	if cause == nil {
		return nil
	}
	return &adminViewBuildError{
		Status:  status,
		Message: message,
		Cause:   cause,
	}
}
