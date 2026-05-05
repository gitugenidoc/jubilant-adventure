import express from "express";
import asyncHandler from "express-async-handler";
import { authMiddleware, requirePermission } from "../middleware/index.js";
import * as auditService from "../lib/auditService.js";

const router = express.Router();

// Require authentication and admin permission for all audit routes
router.use(authMiddleware);
router.use(requirePermission("audit:read"));

// Get audit logs with filters
router.get(
  "/logs",
  asyncHandler(async (req, res) => {
    const {
      userId,
      resourceType,
      patientId,
      action,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;

    const logs = await auditService.getAuditLogs(req.user.organizationId, {
      userId,
      resourceType,
      patientId,
      action,
      startDate,
      endDate,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json(logs);
  }),
);

// Get security events (security incidents)
router.get(
  "/security-events",
  asyncHandler(async (req, res) => {
    const {
      severity,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;

    const events = await auditService.getSecurityEvents(
      req.user.organizationId,
      {
        severity,
        status,
        startDate,
        endDate,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    );

    res.json(events);
  }),
);

// Get break-glass logs (emergency access records)
router.get(
  "/break-glass",
  asyncHandler(async (req, res) => {
    const { userId, patientId, status, page = 1, limit = 50 } = req.query;

    const logs = await auditService.getBreakGlassLogs(req.user.organizationId, {
      userId,
      patientId,
      status,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json(logs);
  }),
);

// Get audit trail for specific user
router.get(
  "/user/:userId",
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    const trail = await auditService.getUserAuditTrail(
      userId,
      req.user.organizationId,
      parseInt(days),
    );

    res.json(trail);
  }),
);

// Get data access report for patient
router.get(
  "/patient/:patientId/access-report",
  asyncHandler(async (req, res) => {
    const { patientId } = req.params;
    const { days = 90 } = req.query;

    const report = await auditService.getDataAccessReport(
      req.user.organizationId,
      patientId,
      parseInt(days),
    );

    res.json(report);
  }),
);

// Generate compliance report
router.get(
  "/compliance-report",
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "startDate and endDate are required" });
    }

    const report = await auditService.generateComplianceReport(
      req.user.organizationId,
      startDate,
      endDate,
    );

    res.json(report);
  }),
);

export default router;
