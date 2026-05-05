import express from "express";
import asyncHandler from "express-async-handler";
import {
  authMiddleware,
  requirePermission,
  canAccessPatient,
} from "../middleware/index.js";
import * as dmpService from "../lib/dmpService.js";

const router = express.Router();

// Require authentication for all DMP routes
router.use(authMiddleware);

// Get DMP record
router.get(
  "/:patientId",
  asyncHandler(async (req, res) => {
    await requirePermission("dmp:read")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { patientId } = req.params;
    const dmp = await dmpService.getDMPRecord(
      patientId,
      req.user.organizationId,
    );

    if (!dmp) {
      return res.status(404).json({ error: "DMP not found" });
    }

    res.json(dmp);
  }),
);

// Get DMP publications (all shared documents)
router.get(
  "/:patientId/publications",
  asyncHandler(async (req, res) => {
    await requirePermission("dmp:read")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { patientId } = req.params;
    const publications = await dmpService.getDMPPublications(patientId);

    res.json(publications);
  }),
);

// Publish document to DMP
router.post(
  "/:patientId/publications",
  asyncHandler(async (req, res) => {
    await requirePermission("dmp:create")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { patientId } = req.params;
    const publication = await dmpService.publishDocumentToDMP(patientId, {
      ...req.body,
      organizationId: req.user.organizationId,
    });

    res.status(201).json(publication);
  }),
);

// Grant DMP access to another user/organization
router.post(
  "/:patientId/access",
  asyncHandler(async (req, res) => {
    await requirePermission("dmp:manage-access")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { patientId } = req.params;
    const accessGrant = await dmpService.grantDMPAccess(patientId, {
      ...req.body,
      grantedById: req.user.id,
    });

    res.status(201).json(accessGrant);
  }),
);

// List DMP access grants
router.get(
  "/:patientId/access",
  asyncHandler(async (req, res) => {
    await requirePermission("dmp:read")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { patientId } = req.params;
    const grants = await dmpService.listDMPAccessGrants(patientId);

    res.json(grants);
  }),
);

// Revoke DMP access
router.delete(
  "/:patientId/access/:grantId",
  asyncHandler(async (req, res) => {
    await requirePermission("dmp:manage-access")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { grantId } = req.params;
    const revoked = await dmpService.revokeDMPAccess(grantId);

    res.json(revoked);
  }),
);

// Get access history (who accessed what and when)
router.get(
  "/:patientId/access-history",
  asyncHandler(async (req, res) => {
    await requirePermission("dmp:read")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { patientId } = req.params;
    const history = await dmpService.getDMPAccessHistory(patientId);

    res.json(history);
  }),
);

// Share specific DMP document
router.post(
  "/:patientId/share",
  asyncHandler(async (req, res) => {
    await requirePermission("dmp:create")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { patientId } = req.params;
    const share = await dmpService.shareDMPDocument(patientId, {
      ...req.body,
      sharedById: req.user.id,
    });

    res.status(201).json(share);
  }),
);

export default router;
