import express from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import {
  authMiddleware,
  requirePermission,
  canAccessPatient,
} from "../middleware/auth.js";
import * as patientService from "../services/patientService.js";

const router = express.Router();

// GET /api/patients/search - Search patients
router.get(
  "/search",
  authMiddleware,
  requirePermission("patients:read"),
  asyncHandler(async (req, res) => {
    const {
      q,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    if (!q) {
      return res.status(400).json({
        error: true,
        message: "Search query (q) is required",
      });
    }

    const results = await patientService.searchPatients(
      q,
      req.user.organizationId,
      {
        page: parseInt(page),
        limit: Math.min(parseInt(limit), 100),
        sortBy,
        sortOrder,
      },
    );

    res.json(results);
  }),
);

// POST /api/patients - Create patient
router.post(
  "/",
  authMiddleware,
  requirePermission("patients:create"),
  asyncHandler(async (req, res) => {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      email,
      phoneNumber,
      address,
      gpId,
    } = req.body;

    if (!firstName || !lastName || !dateOfBirth) {
      return res.status(400).json({
        error: true,
        message: "firstName, lastName, and dateOfBirth are required",
      });
    }

    const patient = await patientService.createPatient(
      {
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        email,
        phoneNumber,
        address,
        gpId,
      },
      req.user.organizationId,
      req.user.id,
    );

    res.status(201).json(patient);
  }),
);

// GET /api/patients/:id - Get patient details
router.get(
  "/:id",
  authMiddleware,
  requirePermission("patients:read"),
  canAccessPatient,
  asyncHandler(async (req, res) => {
    const patient = await patientService.getPatientById(
      req.params.id,
      req.user.organizationId,
    );

    if (!patient) {
      return res.status(404).json({
        error: true,
        message: "Patient not found",
      });
    }

    res.json(patient);
  }),
);

// PUT /api/patients/:id - Update patient
router.put(
  "/:id",
  authMiddleware,
  requirePermission("patients:update"),
  canAccessPatient,
  asyncHandler(async (req, res) => {
    const { firstName, lastName, email, phoneNumber, address, gpId } = req.body;

    const patient = await patientService.updatePatient(
      req.params.id,
      {
        firstName,
        lastName,
        email,
        phoneNumber,
        address,
        gpId,
      },
      req.user.id,
    );

    res.json(patient);
  }),
);

// GET /api/patients/:id/timeline - Get patient timeline
router.get(
  "/:id/timeline",
  authMiddleware,
  requirePermission("patients:read"),
  canAccessPatient,
  asyncHandler(async (req, res) => {
    const { type, from, to, limit = 50 } = req.query;

    const timeline = await patientService.getPatientTimeline(req.params.id, {
      type,
      from: from ? new Date(from) : null,
      to: to ? new Date(to) : null,
      limit: parseInt(limit),
    });

    res.json(timeline);
  }),
);

// GET /api/patients/:id/duplicates - Find potential duplicates
router.get(
  "/:id/duplicates",
  authMiddleware,
  requirePermission("patients:read"),
  asyncHandler(async (req, res) => {
    const duplicates = await patientService.findPotentialDuplicates(
      req.params.id,
    );
    res.json({ potentialDuplicates: duplicates });
  }),
);

// POST /api/patients/:id/merge - Merge duplicate records
router.post(
  "/:id/merge",
  authMiddleware,
  requirePermission("patients:update"),
  asyncHandler(async (req, res) => {
    const { sourcePatientId, reason } = req.body;

    if (!sourcePatientId) {
      return res.status(400).json({
        error: true,
        message: "sourcePatientId is required",
      });
    }

    const result = await patientService.mergePatients(
      sourcePatientId,
      req.params.id,
      reason || "Duplicate record",
      req.user.id,
    );

    res.json(result);
  }),
);

// POST /api/patients/:id/identifiers - Add patient identifier
router.post(
  "/:id/identifiers",
  authMiddleware,
  requirePermission("patients:update"),
  asyncHandler(async (req, res) => {
    const { type, value } = req.body;

    if (!type || !value) {
      return res.status(400).json({
        error: true,
        message: "type and value are required",
      });
    }

    const identifier = await patientService.addPatientIdentifier(
      req.params.id,
      type,
      value,
    );
    res.status(201).json(identifier);
  }),
);

// GET /api/patients/:id/identifiers - Get patient identifiers
router.get(
  "/:id/identifiers",
  authMiddleware,
  requirePermission("patients:read"),
  canAccessPatient,
  asyncHandler(async (req, res) => {
    const identifiers = await patientService.getPatientIdentifiers(
      req.params.id,
    );
    res.json({ identifiers });
  }),
);

// POST /api/patients/:id/contacts - Add emergency contact
router.post(
  "/:id/contacts",
  authMiddleware,
  requirePermission("patients:update"),
  asyncHandler(async (req, res) => {
    const { type, firstName, lastName, relationship, phoneNumber, email } =
      req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({
        error: true,
        message: "firstName and lastName are required",
      });
    }

    const contact = await patientService.addPatientContact(req.params.id, {
      type: type || "emergency",
      firstName,
      lastName,
      relationship,
      phoneNumber,
      email,
    });

    res.status(201).json(contact);
  }),
);

// GET /api/patients/:id/contacts - Get contacts
router.get(
  "/:id/contacts",
  authMiddleware,
  requirePermission("patients:read"),
  canAccessPatient,
  asyncHandler(async (req, res) => {
    const contacts = await patientService.getPatientContacts(req.params.id);
    res.json({ contacts });
  }),
);

export default router;
