import express from "express";
import asyncHandler from "express-async-handler";
import {
  authMiddleware,
  requirePermission,
  canAccessPatient,
} from "../middleware/index.js";
import * as dpiService from "../lib/dpiService.js";

const router = express.Router();

// Require authentication for all DPI routes
router.use(authMiddleware);

// Create encounter (consultation, hospitalization, etc)
router.post(
  "/:patientId/encounters",
  asyncHandler(async (req, res) => {
    await requirePermission("dpi:create")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { patientId } = req.params;
    const encounter = await dpiService.createEncounter(
      patientId,
      req.user.organizationId,
      req.body,
    );

    res.status(201).json(encounter);
  }),
);

// Get specific encounter
router.get(
  "/:patientId/encounters/:encounterId",
  asyncHandler(async (req, res) => {
    await requirePermission("dpi:read")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { encounterId } = req.params;
    const encounter = await dpiService.getEncounter(
      encounterId,
      req.user.organizationId,
    );

    if (!encounter) {
      return res.status(404).json({ error: "Encounter not found" });
    }

    res.json(encounter);
  }),
);

// List all encounters for patient
router.get(
  "/:patientId/encounters",
  asyncHandler(async (req, res) => {
    await requirePermission("dpi:read")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { patientId } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query;
    const result = await dpiService.listEncounters(
      patientId,
      req.user.organizationId,
      {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        sortBy: sortBy || "startDate",
        sortOrder: sortOrder || "desc",
      },
    );

    res.json(result);
  }),
);

// Add note to encounter (SOAP notes)
router.post(
  "/:patientId/encounters/:encounterId/notes",
  asyncHandler(async (req, res) => {
    await requirePermission("dpi:create")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { encounterId } = req.params;
    const note = await dpiService.addEncounterNote(encounterId, {
      ...req.body,
      practitionerId: req.user.id,
    });

    res.status(201).json(note);
  }),
);

// Add diagnosis
router.post(
  "/:patientId/encounters/:encounterId/diagnoses",
  asyncHandler(async (req, res) => {
    await requirePermission("dpi:create")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { encounterId } = req.params;
    const diagnosis = await dpiService.addDiagnosis(encounterId, req.body);

    res.status(201).json(diagnosis);
  }),
);

// Add procedure
router.post(
  "/:patientId/encounters/:encounterId/procedures",
  asyncHandler(async (req, res) => {
    await requirePermission("dpi:create")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { encounterId } = req.params;
    const procedure = await dpiService.addProcedure(encounterId, req.body);

    res.status(201).json(procedure);
  }),
);

// Record observation (vital signs, lab results, etc)
router.post(
  "/:patientId/encounters/:encounterId/observations",
  asyncHandler(async (req, res) => {
    await requirePermission("dpi:create")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { encounterId } = req.params;
    const observation = await dpiService.recordObservation(
      encounterId,
      req.body,
    );

    res.status(201).json(observation);
  }),
);

// Upload document
router.post(
  "/:patientId/encounters/:encounterId/documents",
  asyncHandler(async (req, res) => {
    await requirePermission("dpi:create")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { encounterId } = req.params;
    const document = await dpiService.uploadDocument(encounterId, {
      ...req.body,
      uploadedBy: req.user.id,
    });

    res.status(201).json(document);
  }),
);

// Get DPI summary (recent encounters, documents, diagnoses)
router.get(
  "/:patientId/summary",
  asyncHandler(async (req, res) => {
    await requirePermission("dpi:read")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { patientId } = req.params;
    const summary = await dpiService.getDPISummary(
      patientId,
      req.user.organizationId,
    );

    res.json(summary);
  }),
);

// Publish to DMP (shared medical record)
router.post(
  "/:patientId/encounters/:encounterId/publish-to-dmp",
  asyncHandler(async (req, res) => {
    await requirePermission("dpi:update")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { patientId, encounterId } = req.params;
    const publication = await dpiService.publishToDMP(
      encounterId,
      req.user.organizationId,
      req.body,
    );

    res.status(201).json(publication);
  }),
);

export default router;
