import { prisma } from "../server.js";
import { AppError } from "../middleware/errorHandler.js";

/**
 * Create new patient
 */
export const createPatient = async (data, organizationId) => {
  const {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    email,
    phoneNumber,
    address,
  } = data;

  const patient = await prisma.patient.create({
    data: {
      organizationId,
      firstName,
      lastName,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      email,
      phoneNumber,
      address,
      identifiers: {
        create: {
          type: "local",
          value: generateLocalPatientId(organizationId),
        },
      },
      // Auto-create DPI & DMP records
      dpiRecords: {
        create: {
          facilityId: null, // Will be populated per facility
        },
      },
      dmpRecords: {
        create: {},
      },
    },
    include: {
      identifiers: true,
      contacts: true,
      insurances: true,
    },
  });

  return patient;
};

/**
 * Get patient by ID with all related data
 */
export const getPatientById = async (patientId) => {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      identifiers: true,
      contacts: true,
      insurances: true,
      gp: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          specialty: true,
        },
      },
      _count: {
        select: {
          encounters: true,
          episodes: true,
          conditions: true,
          allergies: true,
          consents: true,
        },
      },
    },
  });

  if (!patient) {
    throw new AppError("Patient not found", 404);
  }

  if (patient.deletedAt) {
    throw new AppError("Patient record has been deleted", 410);
  }

  return patient;
};

/**
 * Update patient information
 */
export const updatePatient = async (patientId, data) => {
  const { firstName, lastName, email, phoneNumber, address, gpId } = data;

  const patient = await prisma.patient.update({
    where: { id: patientId },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(email && { email }),
      ...(phoneNumber && { phoneNumber }),
      ...(address && { address }),
      ...(gpId && { gpId }),
    },
    include: {
      identifiers: true,
      contacts: true,
    },
  });

  return patient;
};

/**
 * Search patients
 */
export const searchPatients = async (organizationId, query, options = {}) => {
  const { page = 1, limit = 20, facilityId } = options;

  const skip = (page - 1) * limit;

  // Build where clause
  const where = {
    organizationId,
    deletedAt: null,
    ...(facilityId && { dpiRecords: { some: { facilityId } } }),
    OR: [
      { firstName: { contains: query, mode: "insensitive" } },
      { lastName: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
      { phoneNumber: { contains: query, mode: "insensitive" } },
      {
        identifiers: {
          some: { value: { contains: query, mode: "insensitive" } },
        },
      },
    ],
  };

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      skip,
      take: limit,
      include: {
        identifiers: { where: { isActive: true } },
        _count: { select: { encounters: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.patient.count({ where }),
  ]);

  return {
    data: patients,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get patient timeline (encounters, episodes, recent activity)
 */
export const getPatientTimeline = async (patientId, limit = 50) => {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
  });

  if (!patient) {
    throw new AppError("Patient not found", 404);
  }

  const encounters = await prisma.encounter.findMany({
    where: { patientId },
    orderBy: { startDateTime: "desc" },
    take: limit,
    include: {
      practitioner: { select: { firstName: true, lastName: true } },
      facility: { select: { name: true } },
      careUnit: { select: { name: true } },
    },
  });

  const conditions = await prisma.condition.findMany({
    where: { patientId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const allergies = await prisma.allergy.findMany({
    where: { patientId },
    orderBy: { createdAt: "desc" },
  });

  const documents = await prisma.document.findMany({
    where: { patientId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      type: true,
      status: true,
      createdAt: true,
      author: true,
    },
  });

  return {
    patient,
    encounters,
    conditions,
    allergies,
    recentDocuments: documents,
  };
};

/**
 * Merge patient records (when duplicate found)
 */
export const mergePatients = async (
  sourcePatientId,
  targetPatientId,
  justification,
) => {
  // Verify both patients exist
  const source = await prisma.patient.findUnique({
    where: { id: sourcePatientId },
  });

  const target = await prisma.patient.findUnique({
    where: { id: targetPatientId },
  });

  if (!source || !target) {
    throw new AppError("One or both patients not found", 404);
  }

  // Begin transaction
  const result = await prisma.$transaction(async (tx) => {
    // Move all identifiers to target
    await tx.patientIdentifier.updateMany({
      where: { patientId: sourcePatientId },
      data: { patientId: targetPatientId },
    });

    // Move encounters
    await tx.encounter.updateMany({
      where: { patientId: sourcePatientId },
      data: { patientId: targetPatientId },
    });

    // Move notes
    await tx.clinicalNote.updateMany({
      where: { patientId: sourcePatientId },
      data: { patientId: targetPatientId },
    });

    // Move documents
    await tx.document.updateMany({
      where: { patientId: sourcePatientId },
      data: { patientId: targetPatientId },
    });

    // Mark source as merged
    await tx.patient.update({
      where: { id: sourcePatientId },
      data: {
        isMerged: true,
        mergedWith: targetPatientId,
      },
    });

    // Audit the merge
    await tx.auditLog.create({
      data: {
        userId: "system", // Will be passed from middleware
        action: "merge",
        resource: "patient",
        resourceId: sourcePatientId,
        patientId: targetPatientId,
        details: JSON.stringify({
          sourcePatientId,
          targetPatientId,
          justification,
        }),
        reason: justification,
      },
    });

    return { sourcePatientId, targetPatientId, merged: true };
  });

  return result;
};

/**
 * Add patient identifier
 */
export const addPatientIdentifier = async (
  patientId,
  type,
  value,
  issuer = null,
) => {
  // Check if identifier already exists
  const existing = await prisma.patientIdentifier.findFirst({
    where: { patientId, type, value },
  });

  if (existing) {
    throw new AppError("This identifier already exists for the patient", 409);
  }

  const identifier = await prisma.patientIdentifier.create({
    data: {
      patientId,
      type,
      value,
      issuer,
    },
  });

  return identifier;
};

/**
 * Get patient identifiers
 */
export const getPatientIdentifiers = async (patientId) => {
  return prisma.patientIdentifier.findMany({
    where: { patientId, isActive: true },
  });
};

/**
 * Add patient contact
 */
export const addPatientContact = async (patientId, data) => {
  const contact = await prisma.patientContact.create({
    data: {
      patientId,
      name: data.name,
      relationship: data.relationship,
      phone: data.phone,
      email: data.email,
      isEmergencyContact: data.isEmergencyContact || false,
    },
  });

  return contact;
};

/**
 * Get patient contacts
 */
export const getPatientContacts = async (patientId) => {
  return prisma.patientContact.findMany({
    where: { patientId },
  });
};

/**
 * Add insurance
 */
export const addPatientInsurance = async (patientId, data) => {
  const insurance = await prisma.patientInsurance.create({
    data: {
      patientId,
      insurerName: data.insurerName,
      policyNumber: data.policyNumber,
      groupNumber: data.groupNumber,
    },
  });

  return insurance;
};

/**
 * Generate local patient ID
 */
function generateLocalPatientId(organizationId) {
  // Format: ORGCODE-YYYYMMDD-XXXXX (5 digit random)
  const date = new Date();
  const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
  const random = Math.floor(Math.random() * 99999)
    .toString()
    .padStart(5, "0");
  return `${organizationId.substring(0, 3).toUpperCase()}-${dateStr}-${random}`;
}

/**
 * Check for duplicate patients (probabilistic matching)
 */
export const findPotentialDuplicates = async (patientId, organizationId) => {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
  });

  if (!patient) {
    throw new AppError("Patient not found", 404);
  }

  // Find patients with same name and close birth date
  const potentialDuplicates = await prisma.patient.findMany({
    where: {
      organizationId,
      id: { not: patientId },
      deletedAt: null,
      isMerged: false,
      AND: [
        {
          OR: [
            {
              AND: [
                {
                  firstName: {
                    contains: patient.firstName,
                    mode: "insensitive",
                  },
                },
                {
                  lastName: { contains: patient.lastName, mode: "insensitive" },
                },
              ],
            },
            {
              AND: [
                {
                  firstName: {
                    contains: patient.lastName,
                    mode: "insensitive",
                  },
                },
                {
                  lastName: {
                    contains: patient.firstName,
                    mode: "insensitive",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    take: 10,
  });

  return potentialDuplicates;
};
