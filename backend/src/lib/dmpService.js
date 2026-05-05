// DMP (Dossier Médical Partagé) Service - Shared Medical Record
import { prisma } from "../config/database.js";

export async function getDMPRecord(patientId, organizationId) {
  return await prisma.dmp.findUnique({
    where: { patientId },
    include: {
      publications: {
        orderBy: { publishedAt: "desc" },
        take: 50,
        include: { organization: true },
      },
      accessGrants: {
        where: { revokedAt: null },
        include: { grantedTo: true },
      },
    },
  });
}

export async function createDMP(patientId, organizationId) {
  return await prisma.dmp.create({
    data: {
      patientId,
      organizationId,
      status: "active",
      createdAt: new Date(),
    },
  });
}

export async function publishDocumentToDMP(patientId, data) {
  const dmp = await prisma.dmp.findUnique({ where: { patientId } });
  if (!dmp) throw new Error("DMP not found");

  return await prisma.dmpPublication.create({
    data: {
      dmpId: dmp.id,
      patientId,
      organizationId: data.organizationId,
      documentType: data.documentType,
      title: data.title,
      content: data.content,
      publishedAt: new Date(),
      status: "published",
      visibility: data.visibility || "shared", // private, shared, public
    },
  });
}

export async function grantDMPAccess(patientId, data) {
  const dmp = await prisma.dmp.findUnique({ where: { patientId } });
  if (!dmp) throw new Error("DMP not found");

  return await prisma.dmpAccessGrant.create({
    data: {
      dmpId: dmp.id,
      patientId,
      grantedToId: data.grantedToId,
      grantedById: data.grantedById,
      accessType: data.accessType, // view, edit, download
      documentTypes: data.documentTypes || [], // specific types or empty for all
      validFrom: new Date(data.validFrom || Date.now()),
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      grantedAt: new Date(),
      status: "active",
    },
    include: { grantedTo: true },
  });
}

export async function revokeDMPAccess(accessGrantId) {
  return await prisma.dmpAccessGrant.update({
    where: { id: accessGrantId },
    data: { revokedAt: new Date(), status: "revoked" },
  });
}

export async function listDMPAccessGrants(patientId) {
  return await prisma.dmpAccessGrant.findMany({
    where: { patientId, revokedAt: null },
    include: { grantedTo: true, grantedBy: true },
    orderBy: { grantedAt: "desc" },
  });
}

export async function getDMPAccessHistory(patientId) {
  return await prisma.dmpAccessLog.findMany({
    where: { patientId },
    include: { accessedBy: true },
    orderBy: { accessedAt: "desc" },
    take: 100,
  });
}

export async function logDMPAccess(patientId, data) {
  return await prisma.dmpAccessLog.create({
    data: {
      patientId,
      accessedById: data.accessedById,
      organizationId: data.organizationId,
      action: data.action, // view, download, export
      documentId: data.documentId,
      accessedAt: new Date(),
      metadata: data.metadata || {},
    },
  });
}

export async function getDMPPublications(patientId) {
  return await prisma.dmpPublication.findMany({
    where: { patientId, status: "published" },
    include: { organization: true },
    orderBy: { publishedAt: "desc" },
  });
}

export async function shareDMPDocument(patientId, data) {
  const publication = await prisma.dmpPublication.findUnique({
    where: { id: data.publicationId },
  });

  if (!publication) throw new Error("Publication not found");

  return await prisma.dmpShare.create({
    data: {
      publicationId: data.publicationId,
      patientId,
      sharedWithId: data.sharedWithId,
      sharedById: data.sharedById,
      shareType: data.shareType, // link, email, organization
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      shareToken: require("crypto").randomBytes(16).toString("hex"),
      sharedAt: new Date(),
    },
  });
}
