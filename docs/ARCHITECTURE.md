# Architecture - GeniDoc Hayat Hospital Platform

## Vue d'ensemble

GeniDoc Hayat est une plateforme hospitalière numérique complète, modulaire et sécurisée, conçue pour le réseau hospitalier marocain (FM6SS, Hôpital Cheikh Khalifa, etc.).

**Principes architecturaux:**

- Zéro papier
- Interopérabilité FHIR/HL7/DICOM
- Traçabilité complète (audit immutable)
- Conformité réglementation marocaine (Loi 09-08, CNDP)
- Sécurité by design
- Event-driven pour interconnexion services

## Layers Architecturaux

### 1. Présentation (Frontend)

```
React 18 + Vite
├── Pages
│   ├── Auth (Login, MFA, Password Reset)
│   ├── Dashboards (Dashboards spécifiques par rôle)
│   ├── Patients (Search, Create, Profile, Tabs)
│   ├── DPI (Clinical notes, Encounters, Timeline)
│   ├── DMP (Shared records, Access management)
│   ├── Documents (Viewer, Signer, Publisher)
│   └── Admin (Users, Roles, Permissions)
├── Components
│   ├── Reusable UI
│   ├── Forms (Validation, Error handling)
│   ├── Tables (Pagination, Filtering, Sorting)
│   └── Modals
├── Lib
│   ├── API Client (Axios instance with auth)
│   ├── Auth Service
│   ├── Permission Guard
│   └── Utility Functions
└── Styles
    └── Tailwind CSS
```

**État:**

- React Query pour caching/sync
- Zustand pour state global
- Context API pour auth/user

### 2. API Gateway & Routes

```
Express.js
├── /api/auth (Public)
│   ├── POST /login
│   ├── POST /register
│   ├── POST /mfa/enable
│   ├── POST /mfa/verify
│   ├── POST /refresh
│   └── POST /logout
├── /api/patients (Protégé)
│   ├── GET /search
│   ├── POST / (create)
│   ├── GET /:id
│   ├── PUT /:id
│   ├── GET /:id/timeline
│   ├── POST /:id/merge
│   └── GET /:id/duplicates
├── /api/dpi (Protégé)
│   ├── GET /:patientId
│   ├── POST /:patientId/encounters
│   ├── POST /:patientId/notes
│   ├── POST /:patientId/documents
│   └── GET /:patientId/documents
├── /api/dmp (Protégé)
│   ├── GET /:patientId
│   ├── POST /:patientId/publish
│   ├── POST /:patientId/access
│   ├── GET /:patientId/access-logs
│   └── DELETE /:patientId/access/:accessId
├── /api/consent (Protégé)
│   ├── GET /patient/:patientId
│   ├── POST / (create)
│   ├── PUT /:id/revoke
│   └── GET /:id/history
├── /api/digital-card (Public/Protégé)
│   ├── GET /card/:token/info
│   ├── POST /card/:token/access-request
│   ├── GET /patient/:patientId/card
│   ├── POST /patient/:patientId/card/regenerate
│   └── GET /patient/:patientId/access-history
├── /api/fhir (FHIR R4)
│   ├── GET /Patient/:id
│   ├── POST /Patient
│   ├── GET /Encounter/:id
│   ├── GET /Observation
│   ├── GET /DiagnosticReport
│   ├── GET /DocumentReference
│   ├── GET /Consent
│   └── POST /Bundle (import/export)
├── /api/audit (Protégé)
│   ├── GET /logs (filtrable)
│   ├── GET /logs/:patientId
│   ├── GET /security-events
│   └── GET /break-glass-logs
└── /api/health (Public)
    └── GET / (status)
```

### 3. Services Métier

```
Node.js Services
├── authService
│   ├── registerUser()
│   ├── loginUser()
│   ├── verifyMfa()
│   ├── enableMfa()
│   ├── refreshToken()
│   └── generateTokens()
├── patientService
│   ├── createPatient()
│   ├── getPatientById()
│   ├── searchPatients()
│   ├── updatePatient()
│   ├── getPatientTimeline()
│   ├── mergePatients()
│   └── findPotentialDuplicates()
├── dpiService
│   ├── createEncounter()
│   ├── addClinicalNote()
│   ├── addDocument()
│   ├── getDpiSummary()
│   └── publishToDmp()
├── dmpService
│   ├── publishDocument()
│   ├── grantAccess()
│   ├── revokeAccess()
│   ├── getAccessLog()
│   └── getDmpData()
├── consentService
│   ├── createConsent()
│   ├── revokeConsent()
│   ├── getConsentHistory()
│   ├── checkConsent()
│   └── trackConsentChange()
├── digitalCardService
│   ├── generateCard()
│   ├── generateQrCode()
│   ├── validateToken()
│   ├── createAccessToken()
│   ├── logAccess()
│   └── revokeCard()
├── fhirService
│   ├── mapPatientToFhir()
│   ├── mapEncounterToFhir()
│   ├── mapObservationToFhir()
│   ├── exportBundle()
│   ├── importBundle()
│   └── validateFhirResource()
├── auditService
│   ├── logAction()
│   ├── logSecurityEvent()
│   ├── logBreakGlass()
│   ├── getAuditLogs()
│   └── generateAuditReport()
└── consentService
    ├── manageConsents()
    └── enforceConsentRules()
```

### 4. Middleware de Sécurité

```
├── authMiddleware      → JWT verification, user attachment
├── auditMiddleware     → Log all requests
├── rateLimiter         → DDoS protection
├── errorHandler        → Centralized error handling
├── requireRole()       → Role-based access control
├── requirePermission() → Permission-based access control
├── canAccessPatient()  → Organization boundary enforcement
└── checkPatientAccess() → Patient data access rules
```

### 5. Base de Données

```
PostgreSQL 16
├── Schema Identité
│   ├── users, roles, permissions, user_roles
│   ├── organizations, facilities, care_units, practitioners
│   └── user_permissions, role_permissions
├── Schema Patients
│   ├── patients, patient_identifiers, patient_contacts, patient_insurances
│   └── episodes_of_care
├── Schema Clinique
│   ├── encounters, clinical_notes, documents
│   ├── conditions, allergies, observations
│   ├── procedures, diagnostic_reports
│   └── prescriptions
├── Schema DPI/DMP
│   ├── dpi_records, dmp_records
│   ├── dmp_publications, dmp_access
│   └── dmp_access_logs
├── Schema Consentement
│   ├── patient_consents
│   └── consent_history
├── Schema Carte Digitale
│   ├── patient_digital_cards, card_access_tokens
│   ├── card_scan_events, delegated_access
│   └── card_access_tokens
├── Schema Audit
│   ├── audit_logs (immutable)
│   ├── security_events
│   └── break_glass_logs
└── Schema Interop
    ├── fhir_mappings, interop_messages
    ├── webhook_events
    └── event_bus_messages
```

## Flux de Données

### Authentification

```
User Login
  ↓
Verify Email + Password
  ↓
Enable MFA?
  ├→ YES: Send OTP → User Enters Code → Verify TOTP
  └→ NO: Generate Tokens
  ↓
Return Access Token + Refresh Token + User Info
  ↓
Frontend stores tokens (Access: memory, Refresh: HttpOnly cookie)
  ↓
All subsequent requests include: Authorization: Bearer <accessToken>
  ↓
JWT middleware verifies and attaches user to req.user
```

### Accès Patient

```
Medical Professional requests patient data
  ↓
Check: Same organization?
  ↓
Check: Specific role permission?
  ↓
Check: Patient consent if DMP?
  ↓
Check: Break-glass access? (if yes → justify & audit)
  ↓
Grant access & log in audit trail
  ↓
Return data with appropriate filters based on role
```

### Publication DMP

```
Doctor completes clinical document in DPI
  ↓
Validate document content
  ↓
Sign document digitally
  ↓
Select: Publish to DMP?
  ↓
Check patient consent
  ↓
Check break-glass status
  ↓
Create DMP publication record
  ↓
Generate FHIR DocumentReference
  ↓
Log publication event → triggers webhook
  ↓
Patient notified of new document
  ↓
Document appears in patient's DMP view
```

### Événements & Webhooks

```
Clinical event occurs (e.g., Lab result)
  ↓
Create event in event_bus_messages
  ↓
Trigger handlers:
  ├→ Update DPI
  ├→ Check DMP publication rules
  ├→ Update cache
  ├→ Notify relevant users
  ├→ Create audit log
  ├→ Update related statistics
  └→ Trigger webhooks for external systems
  ↓
Return response to user
```

## Phases de Développement

### Phase 1: Foundation ✅

- IAM (Auth, RBAC, Audit)
- Patient Master Index
- DPI minimal (encounters, notes)
- DMP minimal (publications, access)
- Carte Digitale Patient
- Consentement
- FHIR R4 API (Patient, Encounter, Observation, DocumentReference, Consent)

### Phase 2: Inter-Services

- Bloc Opératoire ↔ Pharmacie ↔ Facturation
- Laboratoire (Commandes + Résultats)
- Imagerie (DICOM, DICOMweb, Viewer)
- Event Bus complet
- Publication DMP depuis DPI
- IHE XDS.b Documentaire

### Phase 3: Avancé

- HL7 v2 Messages
- openEHR Models
- Connecteurs externes
- Reporting avancé
- Téléconsultation

## Sécurité

### AuthN & AuthZ

- JWT avec expiry court (15min)
- Refresh token HttpOnly
- MFA optionnel
- RBAC + ABAC
- Audit de chaque accès

### Chiffrement

- HTTPS/TLS en transit
- AES-256 au repos pour documents
- Bcrypt pour mots de passe
- Secrets d'environment chiffrés

### Audit & Conformité

- Tous les accès loggés
- Immutabilité des logs (hash chaîné optionnel)
- Logs d'accès à données sensibles
- Break-glass access avec justification
- Droit d'accès patient
- Droit de rectification
- Droit d'oubli si autorisé

## Déploiement

### Local (Docker Compose)

```bash
docker-compose up -d
Backend: http://localhost:3000
Frontend: http://localhost:5173
Database: localhost:5432 (Adminer: http://localhost:8080)
```

### Production

- Frontend: Vercel (CDN global, HTTPS, preview deploys)
- Backend: Cloud (Azure/AWS/DO): Node.js + PM2/systemd
- Database: Managed PostgreSQL (automated backups, failover)
- Storage: S3-compatible (documents chiffrés)
- Monitoring: Sentry (errors), DataDog/New Relic (performance)
- CI/CD: GitHub Actions (test → deploy on push to main)

## Métriques de Performance

**Phase 1 Cibles:**

- Patient Search: <100ms (p95)
- Patient Detail Load: <200ms (p95)
- DPI Timeline: <300ms (p95)
- DMP Publication: <500ms (p95)
- Login: <1s (p95)
- API error rate: <0.1%
- Availability: 99.9%

## Maintenance & Monitoring

- Database backups: 6 hourly + daily retention
- Log retention: 7 years (audit), 1 year (security)
- SSL certificate renewal: 30 days warning
- Dependency updates: monthly, security patches immediately
- Performance monitoring: dashboards setup
- Incident response: post-mortems for P1 issues

---

**Version**: 1.0 Phase 1  
**Last Updated**: Mai 2026  
**Status**: 🟢 Production Ready
