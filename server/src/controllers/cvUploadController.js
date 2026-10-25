const {
  createAuditLog,
} = require("../services/auditService");

await createAuditLog({
  userId: req.user.id,
  action: "cv_uploaded",
  targetType: "user",
  targetId: req.user.id,
  ipAddress: req.ip,
  userAgent: req.get("user-agent"),
});

await createAuditLog({
  userId: req.user.id,
  action: "cv_deleted",
  targetType: "user",
  targetId: req.user.id,
  ipAddress: req.ip,
  userAgent: req.get("user-agent"),
});

await createAuditLog({
  userId: req.user.id,
  action: "application_status_changed",
  targetType: "job_application",
  targetId: application.id,
  ipAddress: req.ip,
  userAgent: req.get("user-agent"),
  details: `Status changed to ${status}`,
});

