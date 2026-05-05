// Consent Service - Manage patient consent for data access and processing
import { prisma } from "../config/database.js";

export async function createConsent(patientId, organizationId, data) {
  return await prisma.consent.create({
    data: {
      patientId,
      organizationId,
      type: data.type, // research, treatment, marketing, secondary-use, genetic
      category: data.category, // research, health-monitoring, marketing, etc
      scope: data.scope || "all", // all, specific-encounter, specific-data
      status: "active",
      grantedAt: new Date(),
      validFrom: new Date(data.validFrom || Date.now()),
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      consentedBy: data.consentedBy, // patient ID or representative
      grantedBy: data.grantedBy, // practitioner ID
      description: data.description,
      consentDocument: data.consentDocument,
      metadata: data.metadata || {},
    },
  });
}

export async function getConsent(consentId) {
  return await prisma.consent.findUnique({
    where: { id: consentId },
    include: {
      patient: true,
      consentedByUser: true,
      grantedByUser: true,
    },
  });
}

export async function listConsents(patientId, status = "active") {
  return await prisma.consent.findMany({
    where: { patientId, status },
    include: { patient: true, grantedByUser: true },
    orderBy: { grantedAt: "desc" },
  });
}

export async function revokeConsent(consentId, reason = "") {
  return await prisma.consent.update({
    where: { id: consentId },
    data: {
      status: "revoked",
      revokedAt: new Date(),
      revocationReason: reason,
    },
  });
}

export async function getConsentHistory(patientId) {
  return await prisma.consentHistory.findMany({
    where: { patientId },
    include: { consent: true },
    orderBy: { changedAt: "desc" },
  });
}

export async function logConsentChange(
  consentId,
  patientId,
  action,
  reason = "",
) {
  const consent = await prisma.consent.findUnique({ where: { id: consentId } });

  return await prisma.consentHistory.create({
    data: {
      consentId,
      patientId,
      action, // created, modified, revoked, expired
      previousStatus: consent?.status,
      newStatus: action === "revoked" ? "revoked" : "active",
      reason,
      changedAt: new Date(),
    },
  });
}

export async function verifyConsentValidity(patientId, type, purpose = "") {
  const consent = await prisma.consent.findFirst({
    where: {
      patientId,
      type,
      status: "active",
      validFrom: { lte: new Date() },
      OR: [{ validUntil: { gte: new Date() } }, { validUntil: null }],
    },
  });

  return { isValid: !!consent, consent };
}

export async function getConsentedOrganizations(patientId) {
  const consents = await prisma.consent.findMany({
    where: { patientId, status: "active" },
    distinct: ["organizationId"],
    select: { organizationId: true },
  });

  return consents.map((c) => c.organizationId);
}

export async function auditConsentAccess(consentId, patientId, data) {
  return await prisma.consentAuditLog.create({
    data: {
      consentId,
      patientId,
      accessedById: data.accessedById,
      organizationId: data.organizationId,
      action: data.action, // consult, modify, revoke
      accessedAt: new Date(),
      ipAddress: data.ipAddress,
      metadata: data.metadata || {},
    },
  });
}

export async function bulkCreateConsents(patientId, consents) {
  return await prisma.consent.createMany({
    data: consents.map((c) => ({
      patientId,
      organizationId: c.organizationId,
      type: c.type,
      status: "active",
      grantedAt: new Date(),
      validFrom: new Date(c.validFrom || Date.now()),
      validUntil: c.validUntil ? new Date(c.validUntil) : null,
    })),
  });
}
