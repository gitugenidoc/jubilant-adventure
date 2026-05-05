import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ==================== ORGANIZATIONS ====================
  console.log("Creating organizations...");

  const org1 = await prisma.organization.create({
    data: {
      name: "Hôpital Cheikh Khalifa",
      code: "HCK",
      registrationNumber: "HCK-2024-001",
    },
  });

  const org2 = await prisma.organization.create({
    data: {
      name: "Hôpital Universitaire Mohammed VI",
      code: "HUM6",
      registrationNumber: "HUM6-2024-001",
    },
  });

  // ==================== FACILITIES ====================
  console.log("Creating facilities...");

  const facility1 = await prisma.facility.create({
    data: {
      organizationId: org1.id,
      name: "Site Principal HCK",
      code: "HCK-MAIN",
      address: "Casablanca, Morocco",
      phone: "+212 522 xxx xxx",
    },
  });

  const facility2 = await prisma.facility.create({
    data: {
      organizationId: org2.id,
      name: "Hôpital Universitaire - Bloc Chirurgical",
      code: "HUM6-SURGERY",
      address: "Rabat, Morocco",
      phone: "+212 537 xxx xxx",
    },
  });

  // ==================== CARE UNITS ====================
  console.log("Creating care units...");

  const careUnits = await Promise.all([
    prisma.careUnit.create({
      data: {
        facilityId: facility1.id,
        name: "Urgences",
        code: "URG",
        type: "urgences",
      },
    }),
    prisma.careUnit.create({
      data: {
        facilityId: facility1.id,
        name: "Consultation Générale",
        code: "CONS",
        type: "consultation",
      },
    }),
    prisma.careUnit.create({
      data: {
        facilityId: facility2.id,
        name: "Bloc Opératoire",
        code: "BLOC",
        type: "bloc",
      },
    }),
    prisma.careUnit.create({
      data: {
        facilityId: facility2.id,
        name: "Pharmacie",
        code: "PHARM",
        type: "pharmacie",
      },
    }),
    prisma.careUnit.create({
      data: {
        facilityId: facility2.id,
        name: "Laboratoire",
        code: "LAB",
        type: "laboratoire",
      },
    }),
  ]);

  // ==================== ROLES & PERMISSIONS ====================
  console.log("Creating roles and permissions...");

  // Admin permission
  const adminRole = await prisma.role.create({
    data: {
      name: "admin",
      description: "Administrator",
      organizationId: org1.id,
    },
  });

  // Doctor permission
  const doctorRole = await prisma.role.create({
    data: {
      name: "doctor",
      description: "Medical Doctor",
      organizationId: org1.id,
    },
  });

  // Nurse permission
  const nurseRole = await prisma.role.create({
    data: {
      name: "nurse",
      description: "Nurse",
      organizationId: org1.id,
    },
  });

  // Patient role
  const patientRole = await prisma.role.create({
    data: {
      name: "patient",
      description: "Patient",
      organizationId: org1.id,
    },
  });

  // Create permissions
  const permissions = [
    { name: "patients:read", resource: "patient", action: "read" },
    { name: "patients:write", resource: "patient", action: "write" },
    { name: "dpi:read", resource: "dpi", action: "read" },
    { name: "dpi:write", resource: "dpi", action: "write" },
    { name: "dmp:read", resource: "dmp", action: "read" },
    { name: "dmp:publish", resource: "dmp", action: "publish" },
    { name: "prescribe", resource: "prescription", action: "create" },
    { name: "sign_document", resource: "document", action: "sign" },
    { name: "audit:read", resource: "audit", action: "read" },
    { name: "users:manage", resource: "user", action: "manage" },
  ];

  const createdPermissions = await Promise.all(
    permissions.map((p) => prisma.permission.create({ data: p })),
  );

  // Assign permissions to roles
  await Promise.all([
    ...createdPermissions.map((p) =>
      prisma.rolePermission.create({
        data: {
          roleId: adminRole.id,
          permissionId: p.id,
        },
      }),
    ),
    ...createdPermissions.slice(0, 7).map((p) =>
      prisma.rolePermission.create({
        data: {
          roleId: doctorRole.id,
          permissionId: p.id,
        },
      }),
    ),
  ]);

  // ==================== PRACTITIONERS ====================
  console.log("Creating practitioners...");

  const practitioner1 = await prisma.practitioner.create({
    data: {
      organizationId: org1.id,
      firstName: "Ahmed",
      lastName: "Bennani",
      title: "Dr",
      license: "BENCH-2020-001",
      specialties: {
        create: {
          specialty: "Cardiologie",
        },
      },
    },
  });

  const practitioner2 = await prisma.practitioner.create({
    data: {
      organizationId: org1.id,
      firstName: "Fatima",
      lastName: "Alami",
      title: "Dr",
      license: "BENCH-2021-001",
      specialties: {
        create: {
          specialty: "Chirurgie Générale",
        },
      },
    },
  });

  // ==================== USERS ====================
  console.log("Creating users...");

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@genidoc.ma",
      password: await bcryptjs.hash("Admin@123456", 12),
      firstname: "Admin",
      lastname: "System",
      organizationId: org1.id,
      facilityId: facility1.id,
      mfaEnabled: false,
      isActive: true,
      roles: {
        create: {
          roleId: adminRole.id,
        },
      },
    },
  });

  const doctorUser = await prisma.user.create({
    data: {
      email: "doctor@genidoc.ma",
      password: await bcryptjs.hash("Doctor@123456", 12),
      firstname: "Ahmed",
      lastname: "Bennani",
      organizationId: org1.id,
      facilityId: facility1.id,
      practitionerId: practitioner1.id,
      mfaEnabled: false,
      isActive: true,
      roles: {
        create: {
          roleId: doctorRole.id,
        },
      },
    },
  });

  const nurseUser = await prisma.user.create({
    data: {
      email: "nurse@genidoc.ma",
      password: await bcryptjs.hash("Nurse@123456", 12),
      firstname: "Laila",
      lastname: "Saidi",
      organizationId: org1.id,
      facilityId: facility1.id,
      mfaEnabled: false,
      isActive: true,
      roles: {
        create: {
          roleId: nurseRole.id,
        },
      },
    },
  });

  // ==================== PATIENTS ====================
  console.log("Creating patients...");

  const patients = await Promise.all([
    prisma.patient.create({
      data: {
        organizationId: org1.id,
        firstName: "Mohammed",
        lastName: "Hassan",
        dateOfBirth: new Date("1975-03-15"),
        gender: "M",
        email: "mohammed.hassan@example.ma",
        phoneNumber: "+212 612 345 678",
        address: "Casablanca",
        gpId: practitioner1.id,
        identifiers: {
          create: {
            type: "local",
            value: "HCK-20240505-00001",
            isActive: true,
          },
        },
      },
    }),
    prisma.patient.create({
      data: {
        organizationId: org1.id,
        firstName: "Aïcha",
        lastName: "Moudni",
        dateOfBirth: new Date("1982-07-22"),
        gender: "F",
        email: "aicha.moudni@example.ma",
        phoneNumber: "+212 612 345 679",
        address: "Fez",
        identifiers: {
          create: {
            type: "local",
            value: "HCK-20240505-00002",
            isActive: true,
          },
        },
      },
    }),
    prisma.patient.create({
      data: {
        organizationId: org2.id,
        firstName: "Khalid",
        lastName: "Idrissi",
        dateOfBirth: new Date("1990-11-10"),
        gender: "M",
        email: "khalid.idrissi@example.ma",
        phoneNumber: "+212 612 345 680",
        address: "Rabat",
        gpId: practitioner2.id,
        identifiers: {
          create: {
            type: "local",
            value: "HUM6-20240505-00001",
            isActive: true,
          },
        },
      },
    }),
  ]);

  // ==================== ENCOUNTERS ====================
  console.log("Creating encounters...");

  const encounter = await prisma.encounter.create({
    data: {
      patientId: patients[0].id,
      facilityId: facility1.id,
      careUnitId: careUnits[0].id,
      practitionerId: practitioner1.id,
      type: "ambulatory",
      status: "finished",
      reason: "Hypertension follow-up",
      startDateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      endDateTime: new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000,
      ), // +1 hour
      createdBy: doctorUser.id,
    },
  });

  // ==================== ALLERGIES & CONDITIONS ====================
  console.log("Creating clinical data...");

  await prisma.allergy.create({
    data: {
      patientId: patients[0].id,
      substance: "Penicillin",
      substanceCode: "J01CA04",
      reaction: "Rash",
      severity: "moderate",
      status: "active",
    },
  });

  await prisma.condition.create({
    data: {
      patientId: patients[0].id,
      code: "I10",
      display: "Essential (primary) hypertension",
      status: "active",
      category: "diagnosis",
      onsetDate: new Date("2018-05-01"),
    },
  });

  // ==================== CONSENTS ====================
  console.log("Creating consents...");

  await prisma.patientConsent.create({
    data: {
      patientId: patients[0].id,
      type: "dmp_creation",
      purpose: "Creation and access to shared medical record",
      scope: "all_data",
      status: "granted",
      grantedAt: new Date(),
      grantedBy: doctorUser.id,
      consentText:
        "I agree to the creation and sharing of my medical record in accordance with Moroccan law 09-08",
      consentVersion: "1.0",
    },
  });

  // ==================== DIGITAL CARDS ====================
  console.log("Creating digital cards...");

  await Promise.all(
    patients.map((patient) =>
      prisma.patientDigitalCard.create({
        data: {
          patientId: patient.id,
          cardNumber: `DC-${patient.id.substring(0, 8).toUpperCase()}`,
          qrCode: "data:image/svg+xml;base64,...", // Will be generated in API
          status: "active",
          expiresAt: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000), // 2 years
        },
      }),
    ),
  );

  // ==================== DPI & DMP ====================
  console.log("Creating DPI and DMP records...");

  await Promise.all(
    patients.map((patient) =>
      prisma.dpiRecord.create({
        data: {
          patientId: patient.id,
          facilityId: facility1.id,
          synopsis: `Hospital electronic record for ${patient.firstName} ${patient.lastName}`,
        },
      }),
    ),
  );

  await Promise.all(
    patients.map((patient) =>
      prisma.dmpRecord.create({
        data: {
          patientId: patient.id,
        },
      }),
    ),
  );

  console.log(`✅ Database seeded successfully!

📊 Summary:
  - Organizations: 2
  - Facilities: 2
  - Care Units: 5
  - Users: 3 (1 admin, 1 doctor, 1 nurse)
  - Patients: 3
  - Practitioners: 2
  - Encounters: 1
  - Allergies & Conditions: 2
  - Digital Cards: 3

👤 Demo Credentials:
  Admin:  admin@genidoc.ma / Admin@123456
  Doctor: doctor@genidoc.ma / Doctor@123456
  Nurse:  nurse@genidoc.ma / Nurse@123456
  `);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
