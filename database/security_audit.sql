CREATE TABLE IF NOT EXISTS security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    action VARCHAR(100) NOT NULL,

    target_type VARCHAR(100),

    target_id UUID,

    ip_address INET,

    user_agent TEXT,

    details TEXT,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS
idx_security_audit_user
ON security_audit_logs(user_id);

CREATE INDEX IF NOT EXISTS
idx_security_audit_created
ON security_audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS
idx_security_audit_action
ON security_audit_logs(action);