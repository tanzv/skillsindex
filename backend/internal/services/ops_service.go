package services

import (
	"time"

	"gorm.io/gorm"
)

// OpsService provides operations, observability, and compliance snapshots.
type OpsService struct {
	db *gorm.DB
}

// OpsMetrics describes operational baseline metrics.
type OpsMetrics struct {
	GeneratedAt           time.Time `json:"generated_at"`
	RequestQPS            float64   `json:"request_qps"`
	LatencyP50Ms          float64   `json:"latency_p50_ms"`
	LatencyP95Ms          float64   `json:"latency_p95_ms"`
	LatencyP99Ms          float64   `json:"latency_p99_ms"`
	ErrorRate4xx          float64   `json:"error_rate_4xx"`
	ErrorRate5xx          float64   `json:"error_rate_5xx"`
	SyncSuccessRate       float64   `json:"sync_success_rate"`
	AuditWriteFailureRate float64   `json:"audit_write_failure_rate"`
	TotalAuditLogs24h     int64     `json:"total_audit_logs_24h"`
	TotalSyncRuns24h      int64     `json:"total_sync_runs_24h"`
	FailedSyncRuns24h     int64     `json:"failed_sync_runs_24h"`
	RetentionDays         int       `json:"retention_days"`
}

// OpsAlertSeverity describes alert severity levels.
type OpsAlertSeverity string

const (
	// OpsAlertSeverityInfo indicates informational state.
	OpsAlertSeverityInfo OpsAlertSeverity = "info"
	// OpsAlertSeverityWarning indicates warning state.
	OpsAlertSeverityWarning OpsAlertSeverity = "warning"
	// OpsAlertSeverityCritical indicates critical state.
	OpsAlertSeverityCritical OpsAlertSeverity = "critical"
)

// OpsAlert describes one derived operational alert.
type OpsAlert struct {
	Code      string           `json:"code"`
	Severity  OpsAlertSeverity `json:"severity"`
	Message   string           `json:"message"`
	Triggered bool             `json:"triggered"`
}

// OpsReleaseGateCheck describes one release gate check item.
type OpsReleaseGateCheck struct {
	Code     string           `json:"code"`
	Severity OpsAlertSeverity `json:"severity"`
	Message  string           `json:"message"`
	Passed   bool             `json:"passed"`
}

// OpsReleaseGateSnapshot describes release readiness checks.
type OpsReleaseGateSnapshot struct {
	GeneratedAt time.Time             `json:"generated_at"`
	Passed      bool                  `json:"passed"`
	Checks      []OpsReleaseGateCheck `json:"checks"`
}

// RecordRecoveryDrillInput stores parameters for one recovery drill run.
type RecordRecoveryDrillInput struct {
	RPOHours   float64
	RTOHours   float64
	Note       string
	OccurredAt time.Time
}

// OpsRecoveryDrillRecord describes one logged recovery drill result.
type OpsRecoveryDrillRecord struct {
	LoggedAt    time.Time `json:"logged_at"`
	ActorUserID uint      `json:"actor_user_id"`
	RPOHours    float64   `json:"rpo_hours"`
	RTOHours    float64   `json:"rto_hours"`
	Passed      bool      `json:"passed"`
	Note        string    `json:"note"`
}

// RecordReleaseInput stores one release publishing record.
type RecordReleaseInput struct {
	Version      string
	Environment  string
	ChangeTicket string
	Status       string
	Note         string
	ReleasedAt   time.Time
}

// OpsReleaseRecord describes one release event.
type OpsReleaseRecord struct {
	ReleasedAt   time.Time `json:"released_at"`
	ActorUserID  uint      `json:"actor_user_id"`
	Version      string    `json:"version"`
	Environment  string    `json:"environment"`
	ChangeTicket string    `json:"change_ticket"`
	Status       string    `json:"status"`
	Note         string    `json:"note"`
}

// RecordChangeApprovalInput stores one change approval event.
type RecordChangeApprovalInput struct {
	TicketID   string
	Reviewer   string
	Status     string
	Note       string
	OccurredAt time.Time
}

// OpsChangeApprovalRecord describes one change approval audit record.
type OpsChangeApprovalRecord struct {
	OccurredAt  time.Time `json:"occurred_at"`
	ActorUserID uint      `json:"actor_user_id"`
	TicketID    string    `json:"ticket_id"`
	Reviewer    string    `json:"reviewer"`
	Status      string    `json:"status"`
	Note        string    `json:"note"`
}

// UpsertBackupPlanInput stores one backup plan event.
type UpsertBackupPlanInput struct {
	PlanKey       string
	BackupType    string
	Schedule      string
	RetentionDays int
	Enabled       bool
	Note          string
	OccurredAt    time.Time
}

// OpsBackupPlanRecord describes one backup plan record.
type OpsBackupPlanRecord struct {
	LoggedAt      time.Time `json:"logged_at"`
	ActorUserID   uint      `json:"actor_user_id"`
	PlanKey       string    `json:"plan_key"`
	BackupType    string    `json:"backup_type"`
	Schedule      string    `json:"schedule"`
	RetentionDays int       `json:"retention_days"`
	Enabled       bool      `json:"enabled"`
	Note          string    `json:"note"`
}

// RecordBackupRunInput stores one backup run event.
type RecordBackupRunInput struct {
	PlanKey         string
	Status          string
	SizeMB          float64
	DurationMinutes float64
	Note            string
	OccurredAt      time.Time
}

// OpsBackupRunRecord describes one backup run record.
type OpsBackupRunRecord struct {
	LoggedAt        time.Time `json:"logged_at"`
	ActorUserID     uint      `json:"actor_user_id"`
	PlanKey         string    `json:"plan_key"`
	Status          string    `json:"status"`
	SizeMB          float64   `json:"size_mb"`
	DurationMinutes float64   `json:"duration_minutes"`
	Note            string    `json:"note"`
}

// AuditExportInput describes filters for exporting audit logs.
type AuditExportInput struct {
	From   time.Time
	To     time.Time
	Format string
}

const (
	opsRecoveryDrillAction  = "ops_recovery_drill"
	opsReleaseGateAction    = "ops_release_gate_run"
	opsReleaseAction        = "ops_release"
	opsChangeApprovalAction = "ops_change_approval"
	opsBackupPlanAction     = "ops_backup_plan"
	opsBackupRunAction      = "ops_backup_run"
	opsTargetType           = "ops"
	targetRPOHours          = 1.0
	targetRTOHours          = 4.0
)

// NewOpsService creates a new operations service.
func NewOpsService(db *gorm.DB) *OpsService {
	return &OpsService{db: db}
}
