import express from "express";
import { prisma } from "../config/database.js";

const router = express.Router();

// GET /api/health - Health check
router.get("/", async (req, res) => {
  try {
    // Check database
    const result = await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
      uptime: process.uptime(),
      version: "1.0.0",
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      message: error.message,
    });
  }
});

export default router;
