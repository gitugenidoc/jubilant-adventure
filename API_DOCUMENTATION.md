# API Documentation - GeniDoc Hayat

## Base URL

```
http://localhost:3000/api
```

## Authentication

All protected endpoints require an `Authorization` header with a Bearer token:

```
Authorization: Bearer <accessToken>
```

---

## 1. Authentication Endpoints

### POST /auth/register

Create a new user account.

**Request:**

```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "password": "SecurePassword@123",
  "organizationId": "HCK"
}
```

**Response:** `201 Created`

```json
{
  "id": "user-id",
  "email": "john@example.com",
  "firstname": "John",
  "lastname": "Doe",
  "roles": ["doctor"]
}
```

### POST /auth/login

Login with email and password.

**Request:**

```json
{
  "email": "doctor@genidoc.ma",
  "password": "Doctor@123456"
}
```

**Response:** `200 OK`

```json
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "user": {
    "id": "user-id",
    "email": "doctor@genidoc.ma",
    "firstname": "Dr",
    "lastname": "Ahmed",
    "roles": ["doctor"],
    "permissions": ["patients:read", "patients:create", ...]
  }
}
```

### POST /auth/mfa/verify

Verify MFA code.

**Request:**

```json
{
  "code": "123456",
  "temporaryToken": "temp-token"
}
```

**Response:** `200 OK` (returns same as login)

### POST /auth/logout

Logout user.

**Response:** `200 OK`

```json
{ "message": "Logged out successfully" }
```

---

## 2. Patient Management Endpoints

### GET /patients/search

Search for patients with pagination.

**Query Parameters:**

- `q`: Search query (name, email, phone, ID)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: asc or desc (default: desc)

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "patient-1",
      "localId": "PAT-001",
      "firstname": "Mohammed",
      "lastname": "Hassan",
      "email": "mohammed@example.com",
      "phone": "+212612345678",
      "dateOfBirth": "1990-01-15",
      "gender": "M",
      "createdAt": "2026-01-10T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### POST /patients

Create a new patient.

**Request:**

```json
{
  "firstname": "Mohammed",
  "lastname": "Hassan",
  "email": "mohammed@example.com",
  "phone": "+212612345678",
  "dateOfBirth": "1990-01-15",
  "gender": "M",
  "address": "123 Street",
  "city": "Casablanca"
}
```

**Response:** `201 Created`

```json
{
  "id": "patient-id",
  "localId": "PAT-001",
  "firstname": "Mohammed",
  "lastname": "Hassan",
  ...
}
```

### GET /patients/:id

Get patient details.

**Response:** `200 OK`

```json
{
  "id": "patient-id",
  "localId": "PAT-001",
  "firstname": "Mohammed",
  "lastname": "Hassan",
  "email": "mohammed@example.com",
  "phone": "+212612345678",
  "dateOfBirth": "1990-01-15",
  "gender": "M",
  "address": "123 Street",
  "city": "Casablanca",
  "dpi": { "id": "dpi-id", ... },
  "dmp": { "id": "dmp-id", ... }
}
```

### PUT /patients/:id

Update patient information.

**Request:**

```json
{
  "firstname": "Mohammed",
  "lastname": "Hassan",
  "email": "new-email@example.com",
  "phone": "+212612345679"
}
```

**Response:** `200 OK` (updated patient)

### GET /patients/:id/timeline

Get patient clinical timeline.

**Response:** `200 OK`

```json
{
  "timeline": [
    {
      "id": "event-1",
      "type": "encounter",
      "title": "Consultation",
      "description": "General checkup",
      "date": "2026-01-15T10:00:00Z",
      "practitioner": "Dr. Ahmed"
    }
  ]
}
```

---

## 3. DPI (Electronic Health Record) Endpoints

### POST /dpi/:patientId/encounters

Create a new encounter (consultation, hospitalization, etc.).

**Request:**

```json
{
  "type": "consultation",
  "practitionerId": "doctor-id",
  "departmentId": "dept-id",
  "startDate": "2026-01-15T10:00:00Z",
  "reason": "Routine checkup",
  "diagnosis": "Hypertension"
}
```

**Response:** `201 Created`

### GET /dpi/:patientId/encounters

List all encounters for a patient.

**Query Parameters:**

- `page`: Page number
- `limit`: Items per page
- `sortBy`: Sort field
- `sortOrder`: asc or desc

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "encounter-1",
      "type": "consultation",
      "startDate": "2026-01-15T10:00:00Z",
      "status": "completed",
      "practitioner": { "firstname": "Dr", "lastname": "Ahmed" }
    }
  ],
  "pagination": { ... }
}
```

### POST /dpi/:patientId/encounters/:encounterId/notes

Add SOAP notes to an encounter.

**Request:**

```json
{
  "type": "subjective",
  "content": "Patient reports chest pain"
}
```

**Response:** `201 Created`

### POST /dpi/:patientId/encounters/:encounterId/diagnoses

Add diagnosis to encounter.

**Request:**

```json
{
  "code": "I10",
  "description": "Essential hypertension",
  "status": "confirmed"
}
```

**Response:** `201 Created`

### POST /dpi/:patientId/encounters/:encounterId/observations

Record vital signs or lab results.

**Request:**

```json
{
  "code": "8480-6",
  "display": "Systolic blood pressure",
  "value": 120,
  "unit": "mmHg"
}
```

**Response:** `201 Created`

### POST /dpi/:patientId/encounters/:encounterId/documents

Upload a medical document.

**Request:** (multipart/form-data)

- `type`: lab_report, imaging, prescription, etc.
- `title`: Document title
- `file`: Binary file

**Response:** `201 Created`

### GET /dpi/:patientId/summary

Get DPI summary (recent encounters, documents, diagnoses).

**Response:** `200 OK`

```json
{
  "encounters": [...],
  "documents": [...],
  "diagnoses": [...]
}
```

### POST /dpi/:patientId/encounters/:encounterId/publish-to-dmp

Publish encounter to shared medical record.

**Request:**

```json
{
  "documentType": "encounter_summary"
}
```

**Response:** `201 Created`

---

## 4. DMP (Shared Medical Record) Endpoints

### GET /dmp/:patientId

Get DMP record with publications and access grants.

**Response:** `200 OK`

```json
{
  "id": "dmp-id",
  "patientId": "patient-id",
  "status": "active",
  "publications": [...],
  "accessGrants": [...]
}
```

### GET /dmp/:patientId/publications

List all published documents.

**Response:** `200 OK` (array of publications)

### POST /dmp/:patientId/publications

Publish document to DMP.

**Request:**

```json
{
  "documentType": "encounter_summary",
  "title": "Consultation du 15 janvier",
  "content": "..."
}
```

**Response:** `201 Created`

### POST /dmp/:patientId/access

Grant access to DMP document.

**Request:**

```json
{
  "grantedToId": "user-id",
  "accessType": "view",
  "validUntil": "2026-12-31"
}
```

**Response:** `201 Created`

### GET /dmp/:patientId/access

List all access grants.

**Response:** `200 OK` (array of grants)

### DELETE /dmp/:patientId/access/:grantId

Revoke access to DMP.

**Response:** `200 OK`

### GET /dmp/:patientId/access-history

Get access history (who accessed what).

**Response:** `200 OK` (array of access logs)

---

## 5. Consent Endpoints

### POST /consent/:patientId/consents

Create a new consent.

**Request:**

```json
{
  "type": "research",
  "category": "health-research",
  "description": "Consent for medical research",
  "validFrom": "2026-01-15",
  "validUntil": "2027-01-15"
}
```

**Response:** `201 Created`

### GET /consent/:patientId/consents

List consents with status filter.

**Query Parameters:**

- `status`: active, revoked (default: active)

**Response:** `200 OK` (array of consents)

### POST /consent/:patientId/consents/:consentId/revoke

Revoke a consent.

**Request:**

```json
{
  "reason": "Changed my mind"
}
```

**Response:** `200 OK`

### GET /consent/:patientId/consent-history

Get consent change history.

**Response:** `200 OK` (array of history events)

### GET /consent/:patientId/verify-consent/:consentType

Verify if valid consent exists for purpose.

**Response:** `200 OK`

```json
{
  "isValid": true,
  "consent": { ... }
}
```

---

## 6. Audit Endpoints (Admin Only)

### GET /audit/logs

Get audit logs with filters.

**Query Parameters:**

- `action`: login, logout, view, create, update, delete, export
- `resourceType`: patient, encounter, document, etc.
- `userId`: Filter by user
- `startDate`: Filter from date
- `endDate`: Filter to date
- `page`: Page number
- `limit`: Items per page

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "log-1",
      "timestamp": "2026-01-15T10:00:00Z",
      "user": { "email": "doctor@genidoc.ma" },
      "action": "view",
      "resourceType": "patient",
      "status": "success"
    }
  ],
  "pagination": { ... }
}
```

### GET /audit/security-events

Get security incidents.

**Query Parameters:**

- `severity`: low, medium, high, critical
- `status`: open, investigating, resolved
- `startDate`, `endDate`, `page`, `limit`

**Response:** `200 OK` (array of security events)

### GET /audit/break-glass

Get emergency access logs.

**Query Parameters:**

- `userId`, `patientId`, `status`, `page`, `limit`

**Response:** `200 OK` (array of break-glass logs)

### GET /audit/compliance-report

Generate compliance report.

**Query Parameters:**

- `startDate`: Required
- `endDate`: Required

**Response:** `200 OK`

```json
{
  "period": { "startDate": "2026-01-01", "endDate": "2026-01-31" },
  "totalEvents": 1245,
  "securityEvents": 3,
  "breakGlassEvents": 2,
  "failedLoginAttempts": 5,
  "dataExports": 12,
  "complianceStatus": "compliant"
}
```

---

## Error Responses

All errors return appropriate HTTP status codes with a JSON body:

```json
{
  "error": "Error message",
  "details": "Additional details if available"
}
```

**Common Status Codes:**

- `200 OK`: Successful request
- `201 Created`: Resource created
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server error

---

## Rate Limiting

All endpoints are rate-limited to prevent abuse:

- **Standard endpoints**: 100 requests per 15 minutes per user
- **Auth endpoints**: 5 failed attempts per 15 minutes per IP

---

## Demo Credentials

```
Email: doctor@genidoc.ma
Password: Doctor@123456
MFA: Not required (can be enabled)
```

---

## Frontend Integration

### Available Routes

| Route                 | Component         | Purpose                  |
| --------------------- | ----------------- | ------------------------ |
| `/`                   | LandingPage       | Landing page             |
| `/login`              | LoginPage         | Login/Register page      |
| `/dashboard`          | DashboardPage     | Main dashboard           |
| `/patients`           | PatientListPage   | Search patients          |
| `/patients/new`       | PatientCreatePage | Create patient           |
| `/patients/:id`       | PatientDetailPage | Patient details          |
| `/dpi/:patientId`     | DPIPage           | Electronic health record |
| `/dmp/:patientId`     | DMPPage           | Shared medical record    |
| `/consent/:patientId` | ConsentPage       | Consent management       |
| `/audit`              | AuditPage         | Audit logs (admin)       |

---

## Development Notes

1. All endpoints check permissions via `requirePermission` middleware
2. Patient access is restricted via `canAccessPatient` middleware
3. Audit logs are automatically created for all protected routes
4. MFA is optional but recommended for production
5. All timestamps are in ISO 8601 format with UTC timezone
6. Pagination defaults: page=1, limit=20, max_limit=100
