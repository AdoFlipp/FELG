CREATE TABLE IF NOT EXISTS search_alert_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    alert_id UUID NOT NULL
        REFERENCES search_alerts(id)
        ON DELETE CASCADE,

    job_id UUID NOT NULL
        REFERENCES jobs(id)
        ON DELETE CASCADE,

    notification_id UUID
        REFERENCES notifications(id)
        ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(alert_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_search_alert_notifications_alert
ON search_alert_notifications(alert_id);