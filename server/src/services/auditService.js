const pool =
  require("../config/database");

const createAuditLog = async ({
  userId = null,
  action,
  targetType = null,
  targetId = null,
  ipAddress = null,
  userAgent = null,
  details = null,
}) => {
  try {
    await pool.query(
      `
      INSERT INTO security_audit_logs
      (
        user_id,
        action,
        target_type,
        target_id,
        ip_address,
        user_agent,
        details
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7)
      `,
      [
        userId,
        action,
        targetType,
        targetId,
        ipAddress,
        userAgent,
        details,
      ]
    );
  } catch (error) {
    console.error(
      "Audit log error:",
      error
    );
  }
};

module.exports = {
  createAuditLog,
};