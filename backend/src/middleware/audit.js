import { prisma } from "../server.js";
import { asyncHandler } from "./errorHandler.js";

/**
 * Audit middleware - logs all requests to protected routes
 */
export const auditMiddleware = asyncHandler(async (req, res, next) => {
  // Store original response.json
  const originalJson = res.json;

  // Intercept res.json to capture response
  res.json = function (data) {
    // Only log successful requests
    if (res.statusCode < 400 && req.user) {
      logAuditEvent({
        user: req.user,
        action: mapActionFromMethod(req.method, req.path),
        resource: extractResource(req.path),
        resourceId: req.params.id || req.params.patientId,
        patientId: req.params.patientId || req.query.patientId,
        details: sanitizeDetails(req),
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        statusCode: res.statusCode,
      }).catch((err) => console.error("Audit logging error:", err));
    }

    // Call original json
    return originalJson.call(this, data);
  };

  next();
});

/**
 * Log critical security events
 */
export const logSecurityEvent = asyncHandler(async (event) => {
  await prisma.securityEvent.create({
    data: {
      type: event.type, // failed_login, permission_denied, suspicious_activity
      severity: event.severity || "medium",
      userId: event.userId,
      description: event.description,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      resolved: false,
    },
  });
});

/**
 * Log break glass emergency access
 */
export const logBreakGlass = async (data) => {
  await prisma.breakGlassLog.create({
    data: {
      userId: data.userId,
      patientId: data.patientId,
      justification: data.justification,
      reason: data.reason,
      dataAccessed: JSON.stringify(data.dataAccessed || []),
      ipAddress: data.ipAddress,
      duration: data.duration,
    },
  });
};

// ==================== HELPERS ====================

async function logAuditEvent(event) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: event.user.id,
        action: event.action,
        resource: event.resource,
        resourceId: event.resourceId,
        patientId: event.patientId,
        details: event.details ? JSON.stringify(event.details) : null,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
}

function mapActionFromMethod(method, path) {
  if (method === "GET") return "read";
  if (method === "POST") return "create";
  if (method === "PUT" || method === "PATCH") return "update";
  if (method === "DELETE") return "delete";
  return "unknown";
}

function extractResource(path) {
  const segments = path.split("/");
  // /api/patients/123 => 'patient'
  // /api/dpi/123/notes => 'dpi'
  const main = segments[2];
  const secondary = segments[4];

  if (secondary === "publish") return "dmp_publication";
  if (secondary === "documents") return "document";
  if (secondary === "access") return "access_control";

  return main ? main.slice(0, -1) : "unknown"; // Remove 's'
}

function sanitizeDetails(req) {
  const details = {
    method: req.method,
    path: req.path,
    query: req.query,
  };

  // Don't log sensitive data from body
  if (req.body && typeof req.body === "object") {
    const safe = { ...req.body };
    delete safe.password;
    delete safe.mfaSecret;
    delete safe.token;
    details.body = safe;
  }

  return details;
}

/**
 * Create audit entry for sensitive operations
 */
export const auditSensitiveOperation = async (
  userId,
  operation,
  resource,
  resourceId,
  reason,
) => {
  await prisma.auditLog.create({
    data: {
      userId,
      action: operation,
      resource,
      resourceId,
      details: JSON.stringify({ sensitiveOperation: true }),
      reason,
    },
  });
};
