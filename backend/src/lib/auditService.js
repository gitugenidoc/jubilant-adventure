// Audit Service - Track all access and modifications for compliance
import { prisma } from "../config/database.js";

export async function logAuditEvent(organizationId, data) {
  return await prisma.auditLog.create({
    data: {
      organizationId,
      userId: data.userId,
      action: data.action, // login, logout, view, create, update, delete, export
      resourceType: data.resourceType, // patient, encounter, document, etc
      resourceId: data.resourceId,
      patientId: data.patientId,
      changesSummary: data.changesSummary,
      status: data.status || "success", // success, failure
      errorMessage: data.errorMessage,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      timestamp: new Date(),
      metadata: data.metadata || {},
    },
  });
}

export async function logSecurityEvent(organizationId, data) {
  return await prisma.securityLog.create({
    data: {
      organizationId,
      userId: data.userId,
      eventType: data.eventType, // failed_login, permission_denied, suspicious_activity, data_export, breach_attempt
      severity: data.severity, // low, medium, high, critical
      description: data.description,
      affectedPatients: data.affectedPatients || 0,
      affectedResources: data.affectedResources || [],
      reportedAt: new Date(),
      resolvedAt: data.resolvedAt ? new Date(data.resolvedAt) : null,
      status: data.status || "open", // open, investigating, resolved, escalated
      metadata: data.metadata || {},
    },
  });
}

export async function logBreakGlassAccess(organizationId, data) {
  // Break-glass: emergency access to protected data
  return await prisma.breakGlassLog.create({
    data: {
      organizationId,
      userId: data.userId,
      patientId: data.patientId,
      reason: data.reason, // emergency, urgent-care, life-threatening
      dataAccessed: data.dataAccessed || [],
      accessedAt: new Date(),
      duration: data.duration || 0,
      justification: data.justification,
      reviewedAt: data.reviewedAt ? new Date(data.reviewedAt) : null,
      reviewedBy: data.reviewedBy,
      status: data.status || "pending-review",
    },
  });
}

export async function getAuditLogs(organizationId, filters = {}) {
  const {
    userId,
    resourceType,
    patientId,
    startDate,
    endDate,
    action,
    page = 1,
    limit = 50,
  } = filters;

  const skip = (page - 1) * limit;
  const where = { organizationId };

  if (userId) where.userId = userId;
  if (resourceType) where.resourceType = resourceType;
  if (patientId) where.patientId = patientId;
  if (action) where.action = action;
  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp.gte = new Date(startDate);
    if (endDate) where.timestamp.lte = new Date(endDate);
  }

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { timestamp: "desc" },
      include: {
        user: {
          select: { id: true, email: true, firstname: true, lastname: true },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function getSecurityEvents(organizationId, filters = {}) {
  const {
    severity,
    status,
    startDate,
    endDate,
    page = 1,
    limit = 50,
  } = filters;
  const skip = (page - 1) * limit;
  const where = { organizationId };

  if (severity) where.severity = severity;
  if (status) where.status = status;
  if (startDate || endDate) {
    where.reportedAt = {};
    if (startDate) where.reportedAt.gte = new Date(startDate);
    if (endDate) where.reportedAt.lte = new Date(endDate);
  }

  const [data, total] = await Promise.all([
    prisma.securityLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { reportedAt: "desc" },
    }),
    prisma.securityLog.count({ where }),
  ]);

  return {
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function getBreakGlassLogs(organizationId, filters = {}) {
  const { userId, patientId, status, page = 1, limit = 50 } = filters;
  const skip = (page - 1) * limit;
  const where = { organizationId };

  if (userId) where.userId = userId;
  if (patientId) where.patientId = patientId;
  if (status) where.status = status;

  const [data, total] = await Promise.all([
    prisma.breakGlassLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { accessedAt: "desc" },
      include: {
        user: {
          select: { id: true, email: true, firstname: true, lastname: true },
        },
      },
    }),
    prisma.breakGlassLog.count({ where }),
  ]);

  return {
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function getUserAuditTrail(userId, organizationId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await prisma.auditLog.findMany({
    where: {
      userId,
      organizationId,
      timestamp: { gte: startDate },
    },
    orderBy: { timestamp: "desc" },
    take: 100,
  });
}

export async function getDataAccessReport(
  organizationId,
  patientId,
  days = 90,
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await prisma.auditLog.findMany({
    where: {
      organizationId,
      patientId,
      action: { in: ["view", "export", "download"] },
      timestamp: { gte: startDate },
    },
    orderBy: { timestamp: "desc" },
    include: {
      user: {
        select: { id: true, email: true, firstname: true, lastname: true },
      },
    },
  });
}

export async function generateComplianceReport(
  organizationId,
  startDate,
  endDate,
) {
  const where = {
    organizationId,
    timestamp: {
      gte: new Date(startDate),
      lte: new Date(endDate),
    },
  };

  const [
    totalEvents,
    securityEvents,
    breakGlassEvents,
    failedLogins,
    dataExports,
  ] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.securityLog.count({
      where: { organizationId, reportedAt: where.timestamp },
    }),
    prisma.breakGlassLog.count({
      where: { organizationId, accessedAt: where.timestamp },
    }),
    prisma.auditLog.count({
      where: { ...where, action: "login", status: "failure" },
    }),
    prisma.auditLog.count({ where: { ...where, action: "export" } }),
  ]);

  return {
    period: { startDate, endDate },
    totalEvents,
    securityEvents,
    breakGlassEvents,
    failedLoginAttempts: failedLogins,
    dataExports,
    complianceStatus: securityEvents === 0 ? "compliant" : "review-required",
  };
}
