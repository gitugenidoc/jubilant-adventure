import express from "express";
import asyncHandler from "express-async-handler";
import {
  authMiddleware,
  requirePermission,
  canAccessPatient,
} from "../middleware/index.js";
import * as consentService from "../lib/consentService.js";

const router = express.Router();

// Require authentication for all consent routes
router.use(authMiddleware);

// Create new consent
router.post(
  "/:patientId/consents",
  asyncHandler(async (req, res) => {
    await requirePermission("consent:create")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { patientId } = req.params;
    const consent = await consentService.createConsent(
      patientId,
      req.user.organizationId,
      {
        ...req.body,
        grantedBy: req.user.id,
      },
    );

    res.status(201).json(consent);
  }),
);

// Get specific consent
router.get(
  "/:patientId/consents/:consentId",
  asyncHandler(async (req, res) => {
    await requirePermission("consent:read")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { consentId } = req.params;
    const consent = await consentService.getConsent(consentId);

    if (!consent) {
      return res.status(404).json({ error: "Consent not found" });
    }

    res.json(consent);
  }),
);

// List all consents for patient
router.get(
  "/:patientId/consents",
  asyncHandler(async (req, res) => {
    await requirePermission("consent:read")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { patientId } = req.params;
    const { status = "active" } = req.query;
    const consents = await consentService.listConsents(patientId, status);

    res.json(consents);
  }),
);

// Revoke consent
router.post(
  "/:patientId/consents/:consentId/revoke",
  asyncHandler(async (req, res) => {
    await requirePermission("consent:update")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { consentId, patientId } = req.params;
    const { reason = "" } = req.body;
    const revoked = await consentService.revokeConsent(consentId, reason);

    await consentService.logConsentChange(
      consentId,
      patientId,
      "revoked",
      reason,
    );

    res.json(revoked);
  }),
);

// Get consent history
router.get(
  "/:patientId/consent-history",
  asyncHandler(async (req, res) => {
    await requirePermission("consent:read")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { patientId } = req.params;
    const history = await consentService.getConsentHistory(patientId);

    res.json(history);
  }),
);

// Verify consent validity for specific purpose
router.get(
  "/:patientId/verify-consent/:consentType",
  asyncHandler(async (req, res) => {
    await requirePermission("consent:read")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { patientId, consentType } = req.params;
    const { purpose = "" } = req.query;
    const result = await consentService.verifyConsentValidity(
      patientId,
      consentType,
      purpose,
    );

    res.json(result);
  }),
);

// Get consented organizations (where patient has given consent)
router.get(
  "/:patientId/consented-organizations",
  asyncHandler(async (req, res) => {
    await requirePermission("consent:read")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { patientId } = req.params;
    const organizations =
      await consentService.getConsentedOrganizations(patientId);

    res.json({ organizations });
  }),
);

// Bulk create consents for patient
router.post(
  "/:patientId/consents-bulk",
  asyncHandler(async (req, res) => {
    await requirePermission("consent:create")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { patientId } = req.params;
    const { consents } = req.body;

    if (!Array.isArray(consents)) {
      return res.status(400).json({ error: "consents must be an array" });
    }

    const created = await consentService.bulkCreateConsents(
      patientId,
      consents,
    );

    res.status(201).json({ created: created.count });
  }),
);

// Get audit log for consent access
router.get(
  "/:patientId/consent-audit",
  asyncHandler(async (req, res) => {
    await requirePermission("consent:read")(req, res, () => {});
    await canAccessPatient(req, res, () => {});

    const { patientId } = req.params;
    const { consentId } = req.query;

    // This would need an audit retrieval function
    // For now, return empty array
    res.json([]);
  }),
);

export default router;
