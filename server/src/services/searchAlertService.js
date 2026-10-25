const pool = require("../config/database");
const { createNotification } = require("./notificationService");

const processJobAlerts = async () => {
  try {
    const alerts = await pool.query(`
      SELECT
        sa.id AS alert_id,
        sa.user_id,
        ss.id AS saved_search_id,
        ss.name,
        ss.query,
        ss.country,
        ss.work_type,
        sa.last_checked_at
      FROM search_alerts sa
      JOIN saved_searches ss
        ON ss.id = sa.saved_search_id
      WHERE sa.is_active = TRUE
        AND ss.alerts_enabled = TRUE
    `);

    for (const alert of alerts.rows) {
      const values = [];
      const conditions = [
        "j.is_active = TRUE",
        "j.created_at > $1",
      ];

      values.push(alert.last_checked_at);

      let index = 2;

      if (alert.query && alert.query.trim()) {
        conditions.push(`
          j.search_vector @@
          plainto_tsquery('simple', $${index})
        `);

        values.push(alert.query.trim());
        index++;
      }

      if (alert.country && alert.country.trim()) {
        conditions.push(`
          LOWER(j.country) = LOWER($${index})
        `);

        values.push(alert.country.trim());
        index++;
      }

      if (alert.work_type && alert.work_type.trim()) {
        conditions.push(`
          j.work_type = $${index}
        `);

        values.push(alert.work_type.trim());
        index++;
      }

      const result = await pool.query(
        `
        SELECT
          j.id,
          j.title,
          o.name AS organization_name
        FROM jobs j
        LEFT JOIN organizations o
          ON o.id = j.organization_id
        WHERE ${conditions.join(" AND ")}
        ORDER BY j.created_at DESC
        LIMIT 20
        `,
        values
      );

      for (const job of result.rows) {
  const existing = await pool.query(
    `
    SELECT id
    FROM search_alert_notifications
    WHERE alert_id = $1
      AND job_id = $2
    `,
    [alert.alert_id, job.id]
  );

  if (existing.rows.length > 0) {
    continue;
  }

  const notification =
    await createNotification({
      userId: alert.user_id,
      type: "search_alert",
      title: "New job matches your search",
      message: `${job.title}${
        job.organization_name
          ? ` at ${job.organization_name}`
          : ""
      } matches your saved search "${alert.name}".`,
      relatedId: job.id,
    });

  if (notification) {
    await pool.query(
      `
      INSERT INTO search_alert_notifications
      (
        alert_id,
        job_id,
        notification_id
      )
      VALUES ($1, $2, $3)
      ON CONFLICT (alert_id, job_id)
      DO NOTHING
      `,
      [
        alert.alert_id,
        job.id,
        notification.id,
      ]
    );
  }
}

      await pool.query(
        `
        UPDATE search_alerts
        SET last_checked_at = CURRENT_TIMESTAMP
        WHERE id = $1
        `,
        [alert.alert_id]
      );
    }

    console.log(
      `Search alert check completed. Checked ${alerts.rows.length} alerts.`
    );
  } catch (error) {
    console.error(
      "Search alert processing error:",
      error
    );
  }
};

module.exports = {
  processJobAlerts,
};