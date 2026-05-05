# GeniDoc Hayat - API Specification v1.0

## Base URL

- **Dev**: `http://localhost:3000/api`
- **Production**: `https://api.genidoc.ma/api`

## Authentication

All protected endpoints require:

```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Access tokens are valid for **15 minutes**. Use refresh token to obtain new access token.

---

## 📍 Authentication Endpoints

### POST `/auth/register`

Create new user account.

**Request:**

```json
{
  "email": "user@example.ma",
  "password": "SecurePass123!",
  "firstname": "Ahmed",
  "lastname": "Bennani",
  "organizationId": "org-uuid",
  "role": "doctor"
}
```

**Response (201):**

```json
{
  "id": "user-uuid",
  "email": "user@example.ma",
  "firstname": "Ahmed",
  "lastname": "Bennani",
  "role": "doctor",
  "mfaEnabled": false,
  "createdAt": "2024-05-05T10:00:00Z"
}
```

**Errors:**

- `400`: Email already exists
- `400`: Password too weak
- `404`: Organization not found

---

### POST `/auth/login`

Authenticate user and get tokens.

**Request:**

```json
{
  "email": "doctor@genidoc.ma",
  "password": "Doctor@123456"
}
```

**Response (200) - No MFA:**

```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "user-uuid",
    "email": "doctor@genidoc.ma",
    "firstname": "Ahmed",
    "roles": ["doctor"],
    "permissions": ["patients:read", "dpi:write", ...],
    "organizationId": "org-uuid",
    "facilityId": "facility-uuid"
  }
}
```

**Response (200) - MFA Required:**

```json
{
  "mfaRequired": true,
  "temporaryToken": "temp-token-uuid",
  "email": "doctor@genidoc.ma",
  "message": "Enter TOTP code from authenticator app"
}
```

**Errors:**

- `401`: Invalid email or password
- `429`: Too many login attempts (rate limited)

---

### POST `/auth/mfa/verify`

Verify TOTP code after MFA is enabled.

**Request:**

```json
{
  "temporaryToken": "temp-token-uuid",
  "code": "123456"
}
```

**Response (200):**

```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... }
}
```

**Errors:**

- `401`: Invalid TOTP code
- `401`: Temporary token expired
- `429`: Too many attempts

---

### POST `/auth/mfa/enable`

Setup TOTP-based MFA.

**Request:** (Protected - Auth Required)

```json
{
  "password": "current-password"
}
```

**Response (200):**

```json
{
  "secret": "JBSWY3DPEBLW64TMMQ======",
  "qrCode": "data:image/png;base64,iVBORw0KGgo...",
  "message": "Scan QR code with authenticator app",
  "setupToken": "setup-token-uuid"
}
```

---

### POST `/auth/mfa/disable`

Disable TOTP MFA.

**Request:** (Protected - Auth Required)

```json
{
  "password": "current-password",
  "code": "123456"
}
```

**Response (200):**

```json
{
  "message": "MFA disabled successfully"
}
```

---

### POST `/auth/refresh`

Get new access token using refresh token.

**Request:**

```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200):**

```json
{
  "accessToken": "eyJhbGc...",
  "expiresIn": 900
}
```

**Errors:**

- `401`: Invalid or expired refresh token

---

### GET `/auth/me`

Get current authenticated user info.

**Response (200):** (Protected)

```json
{
  "id": "user-uuid",
  "email": "doctor@genidoc.ma",
  "firstname": "Ahmed",
  "lastname": "Bennani",
  "roles": ["doctor"],
  "permissions": [
    "patients:read",
    "patients:update",
    "dpi:read",
    "dpi:write",
    "dmp:read"
  ],
  "organizationId": "org-uuid",
  "facilityId": "facility-uuid",
  "practitionerId": "practitioner-uuid",
  "mfaEnabled": true,
  "createdAt": "2024-01-15T08:00:00Z"
}
```

---

## 👥 Patient Endpoints

### GET `/patients/search`

Search patients with pagination and filters.

**Query Parameters:**

- `q` (required): Search term (name, email, phone, ID)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20, max: 100)
- `sortBy` (optional): Field to sort by (name, createdAt, etc.)
- `sortOrder` (optional): 'asc' or 'desc' (default: desc)

**Example:**

```
GET /patients/search?q=mohammed&page=1&limit=20
```

**Response (200):** (Protected - patients:read)

```json
{
  "data": [
    {
      "id": "patient-uuid",
      "localId": "HCK-20240505-00001",
      "firstName": "Mohammed",
      "lastName": "Hassan",
      "dateOfBirth": "1975-03-15",
      "gender": "M",
      "email": "mohammed.hassan@example.ma",
      "phoneNumber": "+212 612 345 678",
      "gpName": "Dr. Ahmed Bennani",
      "lastEncounterDate": "2024-05-03T14:30:00Z",
      "identifiers": ["HCK-20240505-00001", "MA-ID-12345"],
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

**Errors:**

- `403`: Insufficient permissions

---

### POST `/patients`

Create new patient record.

**Request:** (Protected - patients:create)

```json
{
  "firstName": "Aïcha",
  "lastName": "Moudni",
  "dateOfBirth": "1982-07-22",
  "gender": "F",
  "email": "aicha.moudni@example.ma",
  "phoneNumber": "+212 612 345 679",
  "address": "Fez, Morocco",
  "cityCode": "03",
  "gpId": "practitioner-uuid",
  "nationalId": "AB123456",
  "insuranceNumber": "INS-98765"
}
```

**Response (201):**

```json
{
  "id": "patient-uuid",
  "localId": "HCK-20240505-00002",
  "firstName": "Aïcha",
  "lastName": "Moudni",
  "dateOfBirth": "1982-07-22",
  "gender": "F",
  "email": "aicha.moudni@example.ma",
  "phoneNumber": "+212 612 345 679",
  "dpiId": "dpi-uuid",
  "dmpId": "dmp-uuid",
  "digitalCardId": "card-uuid",
  "createdAt": "2024-05-05T10:00:00Z",
  "createdBy": "user-uuid"
}
```

**Errors:**

- `400`: Missing required fields
- `409`: Duplicate identifier (email, phone)
- `403`: Insufficient permissions

---

### GET `/patients/:id`

Get detailed patient record.

**Response (200):** (Protected - canAccessPatient)

```json
{
  "id": "patient-uuid",
  "localId": "HCK-20240505-00001",
  "firstName": "Mohammed",
  "lastName": "Hassan",
  "dateOfBirth": "1975-03-15",
  "gender": "M",
  "email": "mohammed.hassan@example.ma",
  "phoneNumber": "+212 612 345 678",
  "address": "Casablanca",
  "gpId": "practitioner-uuid",
  "gpName": "Dr. Ahmed Bennani",

  // Identifiers
  "identifiers": [
    {
      "id": "id-uuid",
      "type": "local",
      "value": "HCK-20240505-00001",
      "isActive": true,
      "issuedDate": "2024-05-05"
    },
    {
      "id": "id-uuid2",
      "type": "national",
      "value": "AB123456",
      "isActive": true
    }
  ],

  // Contacts
  "contacts": [
    {
      "id": "contact-uuid",
      "type": "emergency",
      "firstName": "Fatima",
      "lastName": "Hassan",
      "relationship": "sister",
      "phoneNumber": "+212 612 345 999"
    }
  ],

  // Insurance
  "insurances": [
    {
      "id": "insurance-uuid",
      "company": "CNOPS",
      "number": "CNP-98765",
      "expiryDate": "2025-12-31",
      "isActive": true
    }
  ],

  // Statistics
  "stats": {
    "encounterCount": 5,
    "documentCount": 12,
    "conditionCount": 3,
    "allergyCount": 1,
    "lastEncounterDate": "2024-05-03T14:30:00Z"
  },

  "createdAt": "2024-01-15T08:00:00Z",
  "updatedAt": "2024-05-05T10:00:00Z"
}
```

**Errors:**

- `404`: Patient not found
- `403`: Access denied (different organization or no permission)

---

### PUT `/patients/:id`

Update patient information.

**Request:** (Protected - patients:update)

```json
{
  "firstName": "Mohammed",
  "lastName": "Hassan",
  "email": "new.email@example.ma",
  "phoneNumber": "+212 612 999 999",
  "address": "New Address",
  "gpId": "new-practitioner-uuid"
}
```

**Response (200):**

```json
{
  "id": "patient-uuid",
  "firstName": "Mohammed",
  // ... updated fields
  "updatedAt": "2024-05-05T15:30:00Z",
  "updatedBy": "user-uuid"
}
```

---

### GET `/patients/:id/timeline`

Get patient's clinical timeline.

**Query Parameters:**

- `type` (optional): Filter by type (encounter, condition, allergy, document)
- `from` (optional): Start date (ISO 8601)
- `to` (optional): End date (ISO 8601)
- `limit` (optional): Number of events (default: 50)

**Response (200):** (Protected)

```json
{
  "patientId": "patient-uuid",
  "timeline": [
    {
      "id": "event-uuid",
      "type": "encounter",
      "date": "2024-05-03T14:30:00Z",
      "title": "Consultation Générale",
      "description": "Hypertension follow-up",
      "practitioner": "Dr. Ahmed Bennani",
      "facility": "HCK - Consultation Générale",
      "status": "finished"
    },
    {
      "id": "event-uuid2",
      "type": "allergy",
      "date": "2024-02-01T00:00:00Z",
      "title": "Penicillin Allergy",
      "severity": "moderate",
      "reaction": "Rash"
    },
    {
      "id": "event-uuid3",
      "type": "condition",
      "date": "2018-05-01T00:00:00Z",
      "title": "Essential Hypertension",
      "code": "I10",
      "status": "active"
    },
    {
      "id": "event-uuid4",
      "type": "document",
      "date": "2024-04-15T09:00:00Z",
      "title": "Laboratory Report",
      "documentType": "laboratory",
      "status": "signed"
    }
  ]
}
```

---

### POST `/patients/:id/merge`

Merge duplicate patient records.

**Request:** (Protected - patients:update + admin approval)

```json
{
  "sourcePatientId": "duplicate-patient-uuid",
  "reason": "Duplicate entry detected"
}
```

**Response (200):**

```json
{
  "message": "Patients merged successfully",
  "targetPatient": "patient-uuid",
  "sourcePatient": "duplicate-patient-uuid",
  "mergedDataCount": {
    "encounters": 3,
    "documents": 5,
    "conditions": 2,
    "allergies": 1
  },
  "auditLog": "merge-log-uuid"
}
```

---

### GET `/patients/:id/duplicates`

Find potential duplicate records.

**Response (200):** (Protected)

```json
{
  "patientId": "patient-uuid",
  "potentialDuplicates": [
    {
      "id": "dup-uuid-1",
      "firstName": "Mohammed",
      "lastName": "Hassan",
      "dateOfBirth": "1975-03-15",
      "email": "similar@example.ma",
      "matchScore": 0.95,
      "matchReason": "Same name, close DOB, similar email"
    },
    {
      "id": "dup-uuid-2",
      "firstName": "Mohamed",
      "lastName": "Hassan",
      "dateOfBirth": "1975-03-14",
      "email": "mohammed.hassan@example.com",
      "matchScore": 0.87,
      "matchReason": "Name variation, exact DOB, different email domain"
    }
  ]
}
```

---

## 📋 DPI (Medical Records) Endpoints

### GET `/dpi/:patientId`

Get patient's DPI (Dossier Patient Informatisé).

**Response (200):** (Protected - dpi:read)

```json
{
  "dpiId": "dpi-uuid",
  "patientId": "patient-uuid",
  "patientName": "Mohammed Hassan",
  "summary": "Hospital medical record",
  "lastUpdated": "2024-05-03T14:30:00Z",
  "documentsCount": 12,
  "encountersCount": 5,
  "practitionersCount": 3,
  "activeConditions": 1,
  "lastModifiedBy": "Dr. Ahmed Bennani"
}
```

---

### POST `/dpi/:patientId/encounters`

Create new clinical encounter.

**Request:** (Protected - dpi:write)

```json
{
  "type": "ambulatory",
  "reason": "Hypertension follow-up",
  "practitionerId": "practitioner-uuid",
  "careUnitId": "care-unit-uuid",
  "startDateTime": "2024-05-05T10:00:00Z",
  "endDateTime": "2024-05-05T10:30:00Z",
  "notes": "Patient BP normal, continue medication"
}
```

**Response (201):**

```json
{
  "id": "encounter-uuid",
  "patientId": "patient-uuid",
  "type": "ambulatory",
  "reason": "Hypertension follow-up",
  "practitionerName": "Dr. Ahmed Bennani",
  "status": "in-progress",
  "startDateTime": "2024-05-05T10:00:00Z",
  "createdAt": "2024-05-05T10:00:00Z"
}
```

---

### POST `/dpi/:patientId/notes`

Add clinical note to encounter.

**Request:** (Protected - dpi:write)

```json
{
  "encounterId": "encounter-uuid",
  "noteType": "clinical",
  "title": "Consultation Notes",
  "content": "Patient presenting with...",
  "assessment": "Essential Hypertension",
  "plan": "Continue Lisinopril 10mg daily"
}
```

**Response (201):**

```json
{
  "id": "note-uuid",
  "encounterId": "encounter-uuid",
  "noteType": "clinical",
  "title": "Consultation Notes",
  "createdAt": "2024-05-05T10:15:00Z",
  "createdBy": "Dr. Ahmed Bennani",
  "status": "draft"
}
```

---

### POST `/dpi/:patientId/documents`

Add document to DPI.

**Request:** (Protected - dpi:write)

```json
{
  "type": "laboratory",
  "title": "Blood Test Results",
  "description": "Lipid panel and glucose",
  "file": "base64-encoded-pdf-or-binary",
  "mimeType": "application/pdf",
  "size": 245632,
  "facilityId": "facility-uuid",
  "practitionerId": "practitioner-uuid"
}
```

**Response (201):**

```json
{
  "id": "document-uuid",
  "type": "laboratory",
  "title": "Blood Test Results",
  "fileName": "blood-test-20240505.pdf",
  "uploadedAt": "2024-05-05T10:30:00Z",
  "uploadedBy": "Dr. Ahmed Bennani",
  "status": "pending-signature"
}
```

---

## 🔗 DMP (Shared Medical Records) Endpoints

### GET `/dmp/:patientId`

Get patient's DMP (shared portion).

**Response (200):** (Protected - dmp:read + consent check)

```json
{
  "dmpId": "dmp-uuid",
  "patientId": "patient-uuid",
  "publishedDocuments": [
    {
      "id": "pub-uuid",
      "title": "Consultation Summary",
      "type": "clinical-summary",
      "publishedDate": "2024-05-03T14:30:00Z",
      "publishedBy": "Dr. Ahmed Bennani",
      "facility": "HCK",
      "confidentiality": "normal"
    }
  ],
  "accessLog": [
    {
      "id": "access-uuid",
      "practitioner": "Dr. Fatima Alami",
      "facility": "HUM6",
      "accessDate": "2024-05-04T10:00:00Z",
      "action": "view",
      "justification": "Patient care"
    }
  ]
}
```

---

### POST `/dmp/:patientId/publish`

Publish document from DPI to DMP.

**Request:** (Protected - dmp:publish)

```json
{
  "documentId": "document-uuid",
  "confidentiality": "normal",
  "expiryDate": "2025-05-05",
  "accessLevel": "all_practitioners"
}
```

**Response (201):**

```json
{
  "id": "publication-uuid",
  "documentId": "document-uuid",
  "title": "Consultation Summary",
  "publishedDate": "2024-05-05T15:00:00Z",
  "status": "published",
  "accessibleBy": "all_practitioners",
  "expiryDate": "2025-05-05"
}
```

---

### POST `/dmp/:patientId/access`

Grant access to DMP for practitioner.

**Request:** (Protected - patient or admin)

```json
{
  "practitionerId": "practitioner-uuid",
  "reason": "Primary care physician",
  "duration": 365
}
```

**Response (201):**

```json
{
  "id": "access-uuid",
  "practitioner": "Dr. Fatima Alami",
  "facility": "HUM6",
  "grantedDate": "2024-05-05T15:30:00Z",
  "expiryDate": "2025-05-05",
  "status": "active"
}
```

---

## 🎫 Digital Card Endpoints

### GET `/digital-card/:patientId/card`

Get patient's digital card info.

**Response (200):** (Protected or public with token)

```json
{
  "cardId": "card-uuid",
  "cardNumber": "DC-ABC12345",
  "patientName": "Mohammed Hassan",
  "qrCode": "data:image/svg+xml;base64,PHN2Zz4...",
  "expiryDate": "2026-05-05",
  "status": "active"
}
```

---

### POST `/digital-card/:patientId/generate`

Generate new QR card.

**Request:** (Protected - patient or doctor)

```json
{
  "validityMonths": 24
}
```

**Response (201):**

```json
{
  "cardId": "card-uuid",
  "cardNumber": "DC-ABC12345",
  "qrCode": "data:image/svg+xml;base64,...",
  "validUntil": "2026-05-05",
  "accessToken": "card-token-uuid"
}
```

---

### GET `/digital-card/:token/info`

Scan digital card (public endpoint).

**Response (200):**

```json
{
  "cardNumber": "DC-ABC12345",
  "patientName": "Mohammed Hassan",
  "organizationName": "Hôpital Cheikh Khalifa",
  "hasActiveConsent": true,
  "shareableData": [
    "Patient Demographics",
    "Active Conditions",
    "Current Medications",
    "Allergies"
  ]
}
```

---

## 📋 Consent Endpoints

### GET `/consent/:patientId`

Get patient's consents.

**Response (200):** (Protected)

```json
{
  "consents": [
    {
      "id": "consent-uuid",
      "type": "dmp_creation",
      "purpose": "Creation of shared medical record",
      "scope": "all_data",
      "status": "granted",
      "grantedDate": "2024-05-01T10:00:00Z",
      "grantedBy": "Dr. Ahmed Bennani",
      "expiryDate": "2025-05-01"
    },
    {
      "id": "consent-uuid2",
      "type": "research",
      "purpose": "Hypertension study",
      "scope": "anonymized_data",
      "status": "revoked",
      "revokedDate": "2024-05-04T14:00:00Z"
    }
  ]
}
```

---

### POST `/consent/:patientId`

Create new consent.

**Request:** (Protected)

```json
{
  "type": "dmp_creation",
  "purpose": "Shared medical record access",
  "scope": "all_data",
  "expiryMonths": 12
}
```

**Response (201):**

```json
{
  "id": "consent-uuid",
  "type": "dmp_creation",
  "status": "granted",
  "grantedDate": "2024-05-05T16:00:00Z",
  "expiryDate": "2025-05-05"
}
```

---

## 🔍 Audit Endpoints

### GET `/audit/logs`

Get audit logs with filtering.

**Query Parameters:**

- `action` (optional): Filter by action (create, read, update, delete)
- `resource` (optional): Filter by resource (patient, document, etc.)
- `patientId` (optional): Filter by patient
- `userId` (optional): Filter by user
- `from` (optional): Start date
- `to` (optional): End date
- `page` (optional): Page number
- `limit` (optional): Per page

**Response (200):** (Protected - audit:read or admin)

```json
{
  "logs": [
    {
      "id": "log-uuid",
      "timestamp": "2024-05-05T15:30:00Z",
      "user": "Dr. Ahmed Bennani",
      "action": "view",
      "resource": "patient",
      "resourceId": "patient-uuid",
      "resourceName": "Mohammed Hassan",
      "organizationId": "org-uuid",
      "facilityId": "facility-uuid",
      "ipAddress": "192.168.1.100",
      "status": "success",
      "details": {
        "fields": ["name", "contact", "medical_history"]
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 450,
    "pages": 23
  }
}
```

---

### GET `/audit/security-events`

Get security-related events.

**Response (200):** (Protected - admin)

```json
{
  "events": [
    {
      "id": "event-uuid",
      "timestamp": "2024-05-05T14:00:00Z",
      "eventType": "break_glass_access",
      "user": "Dr. Fatima Alami",
      "patient": "Mohammed Hassan",
      "justification": "Emergency care needed",
      "severity": "high",
      "status": "logged"
    },
    {
      "id": "event-uuid2",
      "timestamp": "2024-05-04T10:30:00Z",
      "eventType": "failed_login",
      "user": "unknown",
      "ipAddress": "203.0.113.45",
      "attempts": 5,
      "severity": "medium"
    }
  ]
}
```

---

## 🏥 Health Check

### GET `/health`

Check API health (public endpoint).

**Response (200):**

```json
{
  "status": "ok",
  "timestamp": "2024-05-05T16:00:00Z",
  "uptime": 86400,
  "database": "connected",
  "cache": "connected"
}
```

---

## Error Responses

### Common Error Codes

| Code | Meaning           | Example                   |
| ---- | ----------------- | ------------------------- |
| 400  | Bad Request       | Missing required field    |
| 401  | Unauthorized      | Invalid JWT token         |
| 403  | Forbidden         | Insufficient permissions  |
| 404  | Not Found         | Patient doesn't exist     |
| 409  | Conflict          | Duplicate email           |
| 422  | Unprocessable     | Invalid data format       |
| 429  | Too Many Requests | Rate limited              |
| 500  | Server Error      | Database connection error |

### Error Response Format

```json
{
  "error": true,
  "code": "INVALID_EMAIL",
  "message": "Invalid email format",
  "details": {
    "field": "email",
    "reason": "Must be valid email address"
  },
  "timestamp": "2024-05-05T16:00:00Z",
  "requestId": "req-uuid"
}
```

---

## Rate Limiting

Endpoints are rate-limited based on type:

| Endpoint Type  | Limit     | Window    |
| -------------- | --------- | --------- |
| Auth           | 5/15min   | Per IP    |
| API            | 100/15min | Per user  |
| Password Reset | 3/1hr     | Per email |
| MFA            | 10/15min  | Per user  |

**Response Headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1715005200
```

---

## FHIR Endpoints (Future)

- `GET /fhir/Patient/:id` - Get FHIR Patient
- `POST /fhir/Patient` - Create FHIR Patient
- `GET /fhir/Encounter/:id` - Get FHIR Encounter
- `GET /fhir/Observation` - Search Observations
- `GET /fhir/DiagnosticReport/:id` - Get Report
- `GET /fhir/DocumentReference/:id` - Get Document
- `GET /fhir/Consent/:id` - Get Consent
- `POST /fhir/Bundle` - Import/Export Bundle

---

**Version**: 1.0 Phase 1  
**Last Updated**: Mai 2026  
**Status**: Complete Specification
