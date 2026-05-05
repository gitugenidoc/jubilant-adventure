-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "password" TEXT NOT NULL,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "lastLogin" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" TEXT NOT NULL,
    "facilityId" TEXT,
    "careUnitId" TEXT,
    "practitionerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "User_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_careUnitId_fkey" FOREIGN KEY ("careUnitId") REFERENCES "CareUnit" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_practitionerId_fkey" FOREIGN KEY ("practitionerId") REFERENCES "Practitioner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Role_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "grantedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserPermission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "grantedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grantedBy" TEXT,
    CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserPermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "registrationNumber" TEXT,
    "website" TEXT,
    "dataProcessingAgreement" TEXT,
    "policyVersion" TEXT NOT NULL DEFAULT '1.0',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Facility_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CareUnit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facilityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CareUnit_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "gender" TEXT NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT,
    "address" TEXT,
    "gpId" TEXT,
    "mergedWith" TEXT,
    "isMerged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Patient_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Patient_gpId_fkey" FOREIGN KEY ("gpId") REFERENCES "Practitioner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PatientIdentifier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "issuer" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "verifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PatientIdentifier_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PatientContact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "isEmergencyContact" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PatientContact_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PatientInsurance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "insurerName" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "groupNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PatientInsurance_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Practitioner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "title" TEXT,
    "license" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Practitioner_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PractitionerSpecialty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "practitionerId" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "certifications" TEXT,
    CONSTRAINT "PractitionerSpecialty_practitionerId_fkey" FOREIGN KEY ("practitionerId") REFERENCES "Practitioner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EpisodeOfCare" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "type" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EpisodeOfCare_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Encounter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "episodeId" TEXT,
    "facilityId" TEXT NOT NULL,
    "careUnitId" TEXT NOT NULL,
    "practitionerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in-progress',
    "reason" TEXT,
    "diagnosis" TEXT,
    "startDateTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDateTime" DATETIME,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Encounter_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Encounter_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "EpisodeOfCare" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Encounter_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Encounter_careUnitId_fkey" FOREIGN KEY ("careUnitId") REFERENCES "CareUnit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Encounter_practitionerId_fkey" FOREIGN KEY ("practitionerId") REFERENCES "Practitioner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Encounter_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClinicalNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "encounterId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "signedAt" DATETIME,
    "signedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClinicalNote_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClinicalNote_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ClinicalNote_author_fkey" FOREIGN KEY ("author") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Condition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "display" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "category" TEXT,
    "onsetDate" DATETIME,
    "abatementDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Condition_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Allergy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "substance" TEXT NOT NULL,
    "substanceCode" TEXT,
    "reaction" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'moderate',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Allergy_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Observation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "encounterId" TEXT,
    "code" TEXT NOT NULL,
    "display" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "unit" TEXT,
    "status" TEXT NOT NULL DEFAULT 'final',
    "observedDateTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Observation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Observation_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Procedure" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "display" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "performedDateTime" DATETIME NOT NULL,
    "location" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Procedure_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Procedure_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiagnosticReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "encounterId" TEXT,
    "code" TEXT NOT NULL,
    "display" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'preliminary',
    "category" TEXT NOT NULL,
    "result" TEXT,
    "interpretation" TEXT,
    "issuedDateTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DiagnosticReport_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DiagnosticReport_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "encounterId" TEXT,
    "practitionerId" TEXT NOT NULL,
    "medicationCode" TEXT NOT NULL,
    "medicationDisplay" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "duration" TEXT,
    "instructions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "signedAt" DATETIME,
    "signedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Prescription_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Prescription_practitionerId_fkey" FOREIGN KEY ("practitionerId") REFERENCES "Practitioner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DpiRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "synopsis" TEXT,
    "lastModifiedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DpiRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DmpRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DmpRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DmpPublication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dmpId" TEXT NOT NULL,
    "documentId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" DATETIME,
    "publishedBy" TEXT,
    "accessLevel" TEXT NOT NULL DEFAULT 'restricted',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DmpPublication_dmpId_fkey" FOREIGN KEY ("dmpId") REFERENCES "DmpRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DmpPublication_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DmpAccess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dmpId" TEXT NOT NULL,
    "grantedToId" TEXT NOT NULL,
    "grantedToType" TEXT NOT NULL,
    "accessType" TEXT NOT NULL DEFAULT 'read',
    "scopeId" TEXT,
    "grantedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grantedBy" TEXT,
    "expiresAt" DATETIME,
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DmpAccess_dmpId_fkey" FOREIGN KEY ("dmpId") REFERENCES "DmpRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DmpAccessLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "accessedById" TEXT NOT NULL,
    "accessedByType" TEXT NOT NULL,
    "documentId" TEXT,
    "accessType" TEXT NOT NULL,
    "accessedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DmpAccessLog_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "dpiRecordId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "signedAt" DATETIME,
    "signedBy" TEXT,
    "storageUrl" TEXT,
    "mimeType" TEXT,
    "fileHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Document_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_dpiRecordId_fkey" FOREIGN KEY ("dpiRecordId") REFERENCES "DpiRecord" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Document_author_fkey" FOREIGN KEY ("author") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DocumentVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PatientConsent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "grantedAt" DATETIME,
    "grantedBy" TEXT,
    "revokedAt" DATETIME,
    "revokedBy" TEXT,
    "expiresAt" DATETIME,
    "consentText" TEXT NOT NULL,
    "consentVersion" TEXT NOT NULL DEFAULT '1.0',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PatientConsent_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PatientDigitalCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PatientDigitalCard_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CardAccessToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cardId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "accessType" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "revokedAt" DATETIME,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CardAccessToken_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "PatientDigitalCard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CardScanEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cardId" TEXT NOT NULL,
    "scannedById" TEXT,
    "scannedByType" TEXT,
    "accessGranted" BOOLEAN NOT NULL,
    "reason" TEXT,
    "deviceInfo" TEXT,
    "ipAddress" TEXT,
    "scannedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CardScanEvent_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "PatientDigitalCard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DelegatedAccess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "delegatedToId" TEXT NOT NULL,
    "delegatedToType" TEXT NOT NULL,
    "scopeType" TEXT NOT NULL,
    "scopeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "grantedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DelegatedAccess_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "patientId" TEXT,
    "details" TEXT,
    "reason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "resultHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SecurityEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "userId" TEXT,
    "description" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" DATETIME,
    "resolvedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SecurityEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BreakGlassLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "patientId" TEXT,
    "justification" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "dataAccessed" TEXT NOT NULL,
    "ipAddress" TEXT,
    "duration" INTEGER,
    "supervisorReview" TEXT,
    "reviewedAt" DATETIME,
    "reviewedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BreakGlassLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FhirMapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "localResourceType" TEXT NOT NULL,
    "localResourceId" TEXT NOT NULL,
    "fhirResourceType" TEXT NOT NULL,
    "fhirId" TEXT NOT NULL,
    "fhirPayload" TEXT NOT NULL,
    "mappingVersion" TEXT NOT NULL DEFAULT 'R4',
    "lastSyncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InteropMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageType" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sourceSystem" TEXT,
    "targetSystem" TEXT,
    "payload" TEXT NOT NULL,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "processedAt" DATETIME,
    "processedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "deliveredAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EventBusMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" TEXT NOT NULL,
    "aggregateType" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "processedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "_FacilityToPractitioner" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_FacilityToPractitioner_A_fkey" FOREIGN KEY ("A") REFERENCES "Facility" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_FacilityToPractitioner_B_fkey" FOREIGN KEY ("B") REFERENCES "Practitioner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CareUnitToPractitioner" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CareUnitToPractitioner_A_fkey" FOREIGN KEY ("A") REFERENCES "CareUnit" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CareUnitToPractitioner_B_fkey" FOREIGN KEY ("B") REFERENCES "Practitioner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "User_facilityId_idx" ON "User"("facilityId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "Role_organizationId_idx" ON "Role"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE INDEX "Permission_resource_idx" ON "Permission"("resource");

-- CreateIndex
CREATE INDEX "Permission_action_idx" ON "Permission"("action");

-- CreateIndex
CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE INDEX "RolePermission_roleId_idx" ON "RolePermission"("roleId");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX "UserPermission_userId_idx" ON "UserPermission"("userId");

-- CreateIndex
CREATE INDEX "UserPermission_permissionId_idx" ON "UserPermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPermission_userId_permissionId_key" ON "UserPermission"("userId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_code_key" ON "Organization"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Facility_code_key" ON "Facility"("code");

-- CreateIndex
CREATE INDEX "Facility_organizationId_idx" ON "Facility"("organizationId");

-- CreateIndex
CREATE INDEX "CareUnit_facilityId_idx" ON "CareUnit"("facilityId");

-- CreateIndex
CREATE UNIQUE INDEX "CareUnit_facilityId_code_key" ON "CareUnit"("facilityId", "code");

-- CreateIndex
CREATE INDEX "Patient_organizationId_idx" ON "Patient"("organizationId");

-- CreateIndex
CREATE INDEX "Patient_email_idx" ON "Patient"("email");

-- CreateIndex
CREATE INDEX "Patient_phoneNumber_idx" ON "Patient"("phoneNumber");

-- CreateIndex
CREATE INDEX "Patient_mergedWith_idx" ON "Patient"("mergedWith");

-- CreateIndex
CREATE INDEX "PatientIdentifier_patientId_idx" ON "PatientIdentifier"("patientId");

-- CreateIndex
CREATE INDEX "PatientIdentifier_value_idx" ON "PatientIdentifier"("value");

-- CreateIndex
CREATE UNIQUE INDEX "PatientIdentifier_patientId_type_value_key" ON "PatientIdentifier"("patientId", "type", "value");

-- CreateIndex
CREATE INDEX "PatientContact_patientId_idx" ON "PatientContact"("patientId");

-- CreateIndex
CREATE INDEX "PatientInsurance_patientId_idx" ON "PatientInsurance"("patientId");

-- CreateIndex
CREATE INDEX "PatientInsurance_policyNumber_idx" ON "PatientInsurance"("policyNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Practitioner_license_key" ON "Practitioner"("license");

-- CreateIndex
CREATE INDEX "Practitioner_organizationId_idx" ON "Practitioner"("organizationId");

-- CreateIndex
CREATE INDEX "Practitioner_license_idx" ON "Practitioner"("license");

-- CreateIndex
CREATE INDEX "PractitionerSpecialty_practitionerId_idx" ON "PractitionerSpecialty"("practitionerId");

-- CreateIndex
CREATE INDEX "EpisodeOfCare_patientId_idx" ON "EpisodeOfCare"("patientId");

-- CreateIndex
CREATE INDEX "Encounter_patientId_idx" ON "Encounter"("patientId");

-- CreateIndex
CREATE INDEX "Encounter_facilityId_idx" ON "Encounter"("facilityId");

-- CreateIndex
CREATE INDEX "Encounter_careUnitId_idx" ON "Encounter"("careUnitId");

-- CreateIndex
CREATE INDEX "Encounter_practitionerId_idx" ON "Encounter"("practitionerId");

-- CreateIndex
CREATE INDEX "Encounter_episodeId_idx" ON "Encounter"("episodeId");

-- CreateIndex
CREATE INDEX "ClinicalNote_patientId_idx" ON "ClinicalNote"("patientId");

-- CreateIndex
CREATE INDEX "ClinicalNote_encounterId_idx" ON "ClinicalNote"("encounterId");

-- CreateIndex
CREATE INDEX "ClinicalNote_author_idx" ON "ClinicalNote"("author");

-- CreateIndex
CREATE INDEX "Condition_patientId_idx" ON "Condition"("patientId");

-- CreateIndex
CREATE INDEX "Condition_code_idx" ON "Condition"("code");

-- CreateIndex
CREATE INDEX "Allergy_patientId_idx" ON "Allergy"("patientId");

-- CreateIndex
CREATE INDEX "Allergy_substanceCode_idx" ON "Allergy"("substanceCode");

-- CreateIndex
CREATE INDEX "Observation_patientId_idx" ON "Observation"("patientId");

-- CreateIndex
CREATE INDEX "Observation_encounterId_idx" ON "Observation"("encounterId");

-- CreateIndex
CREATE INDEX "Observation_code_idx" ON "Observation"("code");

-- CreateIndex
CREATE INDEX "Procedure_patientId_idx" ON "Procedure"("patientId");

-- CreateIndex
CREATE INDEX "Procedure_encounterId_idx" ON "Procedure"("encounterId");

-- CreateIndex
CREATE INDEX "DiagnosticReport_patientId_idx" ON "DiagnosticReport"("patientId");

-- CreateIndex
CREATE INDEX "DiagnosticReport_encounterId_idx" ON "DiagnosticReport"("encounterId");

-- CreateIndex
CREATE INDEX "DiagnosticReport_code_idx" ON "DiagnosticReport"("code");

-- CreateIndex
CREATE INDEX "Prescription_patientId_idx" ON "Prescription"("patientId");

-- CreateIndex
CREATE INDEX "Prescription_practitionerId_idx" ON "Prescription"("practitionerId");

-- CreateIndex
CREATE INDEX "Prescription_encounterId_idx" ON "Prescription"("encounterId");

-- CreateIndex
CREATE INDEX "DpiRecord_patientId_idx" ON "DpiRecord"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "DpiRecord_patientId_facilityId_key" ON "DpiRecord"("patientId", "facilityId");

-- CreateIndex
CREATE INDEX "DmpRecord_patientId_idx" ON "DmpRecord"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "DmpRecord_patientId_key" ON "DmpRecord"("patientId");

-- CreateIndex
CREATE INDEX "DmpPublication_dmpId_idx" ON "DmpPublication"("dmpId");

-- CreateIndex
CREATE INDEX "DmpPublication_documentId_idx" ON "DmpPublication"("documentId");

-- CreateIndex
CREATE INDEX "DmpPublication_status_idx" ON "DmpPublication"("status");

-- CreateIndex
CREATE INDEX "DmpAccess_dmpId_idx" ON "DmpAccess"("dmpId");

-- CreateIndex
CREATE INDEX "DmpAccess_grantedToId_idx" ON "DmpAccess"("grantedToId");

-- CreateIndex
CREATE INDEX "DmpAccess_grantedToType_idx" ON "DmpAccess"("grantedToType");

-- CreateIndex
CREATE INDEX "DmpAccessLog_patientId_idx" ON "DmpAccessLog"("patientId");

-- CreateIndex
CREATE INDEX "DmpAccessLog_accessedById_idx" ON "DmpAccessLog"("accessedById");

-- CreateIndex
CREATE INDEX "Document_patientId_idx" ON "Document"("patientId");

-- CreateIndex
CREATE INDEX "Document_dpiRecordId_idx" ON "Document"("dpiRecordId");

-- CreateIndex
CREATE INDEX "Document_author_idx" ON "Document"("author");

-- CreateIndex
CREATE INDEX "DocumentVersion_documentId_idx" ON "DocumentVersion"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentVersion_documentId_version_key" ON "DocumentVersion"("documentId", "version");

-- CreateIndex
CREATE INDEX "PatientConsent_patientId_idx" ON "PatientConsent"("patientId");

-- CreateIndex
CREATE INDEX "PatientConsent_type_idx" ON "PatientConsent"("type");

-- CreateIndex
CREATE INDEX "PatientConsent_status_idx" ON "PatientConsent"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PatientDigitalCard_cardNumber_key" ON "PatientDigitalCard"("cardNumber");

-- CreateIndex
CREATE INDEX "PatientDigitalCard_patientId_idx" ON "PatientDigitalCard"("patientId");

-- CreateIndex
CREATE INDEX "PatientDigitalCard_cardNumber_idx" ON "PatientDigitalCard"("cardNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CardAccessToken_token_key" ON "CardAccessToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "CardAccessToken_tokenHash_key" ON "CardAccessToken"("tokenHash");

-- CreateIndex
CREATE INDEX "CardAccessToken_cardId_idx" ON "CardAccessToken"("cardId");

-- CreateIndex
CREATE INDEX "CardAccessToken_token_idx" ON "CardAccessToken"("token");

-- CreateIndex
CREATE INDEX "CardScanEvent_cardId_idx" ON "CardScanEvent"("cardId");

-- CreateIndex
CREATE INDEX "DelegatedAccess_patientId_idx" ON "DelegatedAccess"("patientId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_patientId_idx" ON "AuditLog"("patientId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_resource_idx" ON "AuditLog"("resource");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "SecurityEvent_type_idx" ON "SecurityEvent"("type");

-- CreateIndex
CREATE INDEX "SecurityEvent_severity_idx" ON "SecurityEvent"("severity");

-- CreateIndex
CREATE INDEX "SecurityEvent_userId_idx" ON "SecurityEvent"("userId");

-- CreateIndex
CREATE INDEX "SecurityEvent_createdAt_idx" ON "SecurityEvent"("createdAt");

-- CreateIndex
CREATE INDEX "BreakGlassLog_userId_idx" ON "BreakGlassLog"("userId");

-- CreateIndex
CREATE INDEX "BreakGlassLog_createdAt_idx" ON "BreakGlassLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FhirMapping_fhirId_key" ON "FhirMapping"("fhirId");

-- CreateIndex
CREATE INDEX "FhirMapping_localResourceType_idx" ON "FhirMapping"("localResourceType");

-- CreateIndex
CREATE INDEX "FhirMapping_fhirResourceType_idx" ON "FhirMapping"("fhirResourceType");

-- CreateIndex
CREATE UNIQUE INDEX "FhirMapping_localResourceType_localResourceId_fhirResourceType_key" ON "FhirMapping"("localResourceType", "localResourceId", "fhirResourceType");

-- CreateIndex
CREATE INDEX "InteropMessage_status_idx" ON "InteropMessage"("status");

-- CreateIndex
CREATE INDEX "InteropMessage_messageType_idx" ON "InteropMessage"("messageType");

-- CreateIndex
CREATE INDEX "InteropMessage_createdAt_idx" ON "InteropMessage"("createdAt");

-- CreateIndex
CREATE INDEX "WebhookEvent_eventType_idx" ON "WebhookEvent"("eventType");

-- CreateIndex
CREATE INDEX "WebhookEvent_delivered_idx" ON "WebhookEvent"("delivered");

-- CreateIndex
CREATE INDEX "EventBusMessage_eventType_idx" ON "EventBusMessage"("eventType");

-- CreateIndex
CREATE INDEX "EventBusMessage_aggregateType_idx" ON "EventBusMessage"("aggregateType");

-- CreateIndex
CREATE INDEX "EventBusMessage_processedAt_idx" ON "EventBusMessage"("processedAt");

-- CreateIndex
CREATE UNIQUE INDEX "_FacilityToPractitioner_AB_unique" ON "_FacilityToPractitioner"("A", "B");

-- CreateIndex
CREATE INDEX "_FacilityToPractitioner_B_index" ON "_FacilityToPractitioner"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CareUnitToPractitioner_AB_unique" ON "_CareUnitToPractitioner"("A", "B");

-- CreateIndex
CREATE INDEX "_CareUnitToPractitioner_B_index" ON "_CareUnitToPractitioner"("B");

