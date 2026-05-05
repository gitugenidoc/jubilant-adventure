import express from "express";
import asyncHandler from "express-async-handler";
import {
  authMiddleware,
  requirePermission,
  canAccessPatient,
} from "../middleware/index.js";

const router = express.Router();

// FHIR (Fast Healthcare Interoperability Resources) API
// RESTful API for healthcare data exchange

router.use(authMiddleware);

// Get Patient resource
router.get(
  "/Patient/:patientId",
  asyncHandler(async (req, res) => {
    await requirePermission("fhir:read")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { patientId } = req.params;

    // Convert patient to FHIR format
    res.json({
      resourceType: "Patient",
      id: patientId,
      identifier: [
        {
          type: { coding: [{ code: "MR" }] },
          value: "patient-local-id",
        },
      ],
      name: [
        {
          use: "official",
          given: ["John"],
          family: "Doe",
        },
      ],
      telecom: [
        { system: "email", value: "john@example.com" },
        { system: "phone", value: "+1-555-0100" },
      ],
      birthDate: "1990-01-01",
      address: [
        {
          line: ["123 Main St"],
          city: "Anytown",
          state: "CA",
          postalCode: "12345",
        },
      ],
      gender: "male",
    });
  }),
);

// Get Encounter resource
router.get(
  "/Encounter/:encounterId",
  asyncHandler(async (req, res) => {
    await requirePermission("fhir:read")(req, res, () => {});

    const { encounterId } = req.params;

    res.json({
      resourceType: "Encounter",
      id: encounterId,
      status: "finished",
      class: { code: "AMB", display: "ambulatory" },
      type: [
        {
          coding: [{ code: "office-visit", display: "Office Visit" }],
        },
      ],
      subject: { reference: "Patient/patient-id" },
      period: {
        start: "2026-01-15T09:00:00Z",
        end: "2026-01-15T10:00:00Z",
      },
      reason: [{ text: "Routine checkup" }],
    });
  }),
);

// Get Observation resource (vital signs, lab results)
router.get(
  "/Observation/:observationId",
  asyncHandler(async (req, res) => {
    await requirePermission("fhir:read")(req, res, () => {});

    const { observationId } = req.params;

    res.json({
      resourceType: "Observation",
      id: observationId,
      status: "final",
      category: [{ coding: [{ code: "vital-signs", display: "Vital Signs" }] }],
      code: {
        coding: [{ code: "8480-6", display: "Systolic blood pressure" }],
      },
      subject: { reference: "Patient/patient-id" },
      effectiveDateTime: "2026-01-15T09:30:00Z",
      valueQuantity: {
        value: 120,
        unit: "mmHg",
      },
    });
  }),
);

// Get DiagnosticReport resource
router.get(
  "/DiagnosticReport/:reportId",
  asyncHandler(async (req, res) => {
    await requirePermission("fhir:read")(req, res, () => {});

    const { reportId } = req.params;

    res.json({
      resourceType: "DiagnosticReport",
      id: reportId,
      status: "final",
      category: [{ coding: [{ code: "LAB" }] }],
      code: {
        coding: [{ code: "hematology-panel" }],
      },
      subject: { reference: "Patient/patient-id" },
      issued: "2026-01-15T10:00:00Z",
      result: [
        { reference: "Observation/obs-1" },
        { reference: "Observation/obs-2" },
      ],
    });
  }),
);

// Get Medication resource
router.get(
  "/Medication/:medicationId",
  asyncHandler(async (req, res) => {
    await requirePermission("fhir:read")(req, res, () => {});

    const { medicationId } = req.params;

    res.json({
      resourceType: "Medication",
      id: medicationId,
      code: {
        coding: [{ code: "308136", display: "Aspirin" }],
      },
      status: "active",
    });
  }),
);

// Get MedicationRequest resource (prescriptions)
router.get(
  "/MedicationRequest/:requestId",
  asyncHandler(async (req, res) => {
    await requirePermission("fhir:read")(req, res, () => {});

    const { requestId } = req.params;

    res.json({
      resourceType: "MedicationRequest",
      id: requestId,
      status: "active",
      intent: "order",
      medicationReference: { reference: "Medication/med-1" },
      subject: { reference: "Patient/patient-id" },
      authoredOn: "2026-01-15T10:00:00Z",
      requester: { reference: "Practitioner/prac-1" },
      dosageInstruction: [
        {
          text: "Take one tablet by mouth daily",
          timing: { repeat: { frequency: 1, period: 1, periodUnit: "d" } },
        },
      ],
    });
  }),
);

// Get Condition resource
router.get(
  "/Condition/:conditionId",
  asyncHandler(async (req, res) => {
    await requirePermission("fhir:read")(req, res, () => {});

    const { conditionId } = req.params;

    res.json({
      resourceType: "Condition",
      id: conditionId,
      clinicalStatus: { coding: [{ code: "active" }] },
      code: {
        coding: [{ code: "I10", display: "Essential hypertension" }],
      },
      subject: { reference: "Patient/patient-id" },
      onsetDateTime: "2020-01-01",
    });
  }),
);

// Search Patient
router.get(
  "/Patient",
  asyncHandler(async (req, res) => {
    await requirePermission("fhir:read")(req, res, () => {});

    const { name, birthdate, page = 1, _count = 20 } = req.query;

    res.json({
      resourceType: "Bundle",
      type: "searchset",
      total: 1,
      link: [{ relation: "self", url: "/Patient?name=doe" }],
      entry: [
        {
          fullUrl: "/Patient/patient-1",
          resource: {
            resourceType: "Patient",
            id: "patient-1",
            name: [{ given: ["John"], family: "Doe" }],
          },
        },
      ],
    });
  }),
);

// Search Observation
router.get(
  "/Observation",
  asyncHandler(async (req, res) => {
    await requirePermission("fhir:read")(req, res, () => {});

    const { patient, code, page = 1, _count = 20 } = req.query;

    res.json({
      resourceType: "Bundle",
      type: "searchset",
      total: 2,
      entry: [
        {
          fullUrl: "/Observation/obs-1",
          resource: {
            resourceType: "Observation",
            id: "obs-1",
            code: { coding: [{ code: "8480-6" }] },
          },
        },
      ],
    });
  }),
);

// Create resource (generic)
router.post(
  "/:resourceType",
  asyncHandler(async (req, res) => {
    await requirePermission("fhir:create")(req, res, () => {});

    const { resourceType } = req.params;
    const resource = req.body;

    res.status(201).json({
      ...resource,
      id: require("crypto").randomUUID(),
      meta: {
        versionId: "1",
        lastUpdated: new Date().toISOString(),
      },
    });
  }),
);

export default router;
