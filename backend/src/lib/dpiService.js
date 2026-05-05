// DPI (Dossier Patient Informatisé) Service - Patient Electronic Health Record
import { prisma } from "../config/database.js";

export async function createEncounter(patientId, organizationId, data) {
  return await prisma.encounter.create({
    data: {
      patientId,
      organizationId,
      type: data.type, // consultation, hospitalization, emergency, follow-up
      practitionerId: data.practitionerId,
      departmentId: data.departmentId,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      reason: data.reason,
      diagnosis: data.diagnosis,
      notes: data.notes,
      status: data.status || "in-progress", // in-progress, completed, cancelled
      metadata: data.metadata || {},
    },
    include: { practitioner: true, department: true },
  });
}

export async function getEncounter(encounterId, organizationId) {
  return await prisma.encounter.findUnique({
    where: { id: encounterId },
    include: {
      patient: true,
      practitioner: true,
      department: true,
      notes: true,
      documents: true,
      observations: true,
    },
  });
}

export async function listEncounters(
  patientId,
  organizationId,
  pagination = {},
) {
  const {
    page = 1,
    limit = 20,
    sortBy = "startDate",
    sortOrder = "desc",
  } = pagination;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.encounter.findMany({
      where: { patientId, organizationId },
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: { practitioner: true, department: true },
    }),
    prisma.encounter.count({ where: { patientId, organizationId } }),
  ]);

  return {
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function addEncounterNote(encounterId, data) {
  return await prisma.encounterNote.create({
    data: {
      encounterId,
      type: data.type, // subjective, objective, assessment, plan
      content: data.content,
      practitionerId: data.practitionerId,
      createdAt: new Date(),
    },
    include: { practitioner: true },
  });
}

export async function addDiagnosis(encounterId, data) {
  return await prisma.diagnosis.create({
    data: {
      encounterId,
      code: data.code, // ICD-10 code
      description: data.description,
      type: data.type, // primary, secondary
      status: data.status || "confirmed", // confirmed, provisional, differential, rule-out
    },
  });
}

export async function addProcedure(encounterId, data) {
  return await prisma.procedure.create({
    data: {
      encounterId,
      code: data.code,
      description: data.description,
      performedDate: new Date(data.performedDate),
      status: data.status || "completed",
    },
  });
}

export async function recordObservation(encounterId, data) {
  return await prisma.observation.create({
    data: {
      encounterId,
      code: data.code, // vital signs, lab result, etc
      display: data.display,
      value: data.value,
      unit: data.unit,
      referenceRange: data.referenceRange,
      status: data.status || "final",
      effectiveDate: new Date(data.effectiveDate || Date.now()),
    },
  });
}

export async function uploadDocument(encounterId, data) {
  return await prisma.document.create({
    data: {
      encounterId,
      type: data.type, // lab_report, imaging, prescription, discharge, etc
      title: data.title,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      mimeType: data.mimeType,
      size: data.size,
      uploadedBy: data.uploadedBy,
      uploadedAt: new Date(),
    },
  });
}

export async function getDPISummary(patientId, organizationId) {
  const [encounters, documents, diagnoses] = await Promise.all([
    prisma.encounter.findMany({
      where: { patientId, organizationId, status: "completed" },
      orderBy: { startDate: "desc" },
      take: 10,
      include: { practitioner: true },
    }),
    prisma.document.findMany({
      where: { encounter: { patientId, organizationId } },
      orderBy: { uploadedAt: "desc" },
      take: 10,
    }),
    prisma.diagnosis.findMany({
      where: { encounter: { patientId, organizationId } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return { encounters, documents, diagnoses };
}

export async function publishToDMP(encounterId, organizationId, data) {
  const encounter = await prisma.encounter.findUnique({
    where: { id: encounterId },
    include: { patient: true },
  });

  if (!encounter) throw new Error("Encounter not found");

  return await prisma.dmpPublication.create({
    data: {
      encounterId,
      organizationId,
      patientId: encounter.patientId,
      documentType: data.documentType || "encounter_summary",
      content: data.content,
      publishedAt: new Date(),
      accessToken: require("crypto").randomBytes(16).toString("hex"),
    },
  });
}
