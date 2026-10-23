const AuditLog = require("../models/AuditLog");

async function recordAudit(req, action, targetType = "", targetId = "", details = {}) {
  try {
    const ip = String(req?.ip || req?.headers?.["x-forwarded-for"] || "").split(",")[0].trim();
    await AuditLog.create({
      actorId: req?.user?.id || null,
      actorRole: req?.user?.role || "system",
      actorName: req?.user?.name || "",
      action,
      targetType,
      targetId: String(targetId || ""),
      details,
      ip,
    });
  } catch (err) {
    console.error("Audit log failed to record:", err.message);
  }
}

module.exports = { recordAudit };
