import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

// Middleware
import { errorHandler, asyncHandler } from "./middleware/errorHandler.js";
import { authMiddleware } from "./middleware/auth.js";
import { auditMiddleware } from "./middleware/audit.js";
import { rateLimiter } from "./middleware/rateLimiter.js";

// Routes
import authRoutes from "./routes/auth.js";
import patientRoutes from "./routes/patients.js";
import dpiRoutes from "./routes/dpi.js";
import dmpRoutes from "./routes/dmp.js";
import consentRoutes from "./routes/consent.js";
import digitalCardRoutes from "./routes/digitalCard.js";
import fhirRoutes from "./routes/fhir.js";
import auditRoutes from "./routes/audit.js";
import healthRoutes from "./routes/health.js";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || "http://localhost:5173").split(","),
    credentials: true,
  }),
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Rate limiting
app.use(rateLimiter);

// ==================== ROUTES ====================

// Health & status
app.use("/api/health", healthRoutes);

// Authentication (no auth required)
app.use("/api/auth", authRoutes);

// Audit trail (public but logged)
app.use("/api/audit", auditRoutes);

// Protected routes - require authentication
app.use(authMiddleware);

// Audit middleware - log all protected routes
app.use(auditMiddleware);

// Patients
app.use("/api/patients", patientRoutes);

// DPI - Hospital Electronic Medical Record
app.use("/api/dpi", dpiRoutes);

// DMP - Shared Medical Record
app.use("/api/dmp", dmpRoutes);

// Consent
app.use("/api/consent", consentRoutes);

// Digital Card
app.use("/api/digital-card", digitalCardRoutes);

// FHIR API
app.use("/api/fhir", fhirRoutes);

// ==================== 404 & ERROR HANDLING ====================

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method,
  });
});

app.use(errorHandler);

// ==================== GRACEFUL SHUTDOWN ====================

const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received, shutting down gracefully...`);

  try {
    await prisma.$disconnect();
    console.log("Database disconnected");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// ==================== START SERVER ====================

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connected");

    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════╗
║  🏥 GeniDoc Hayat Hospital Platform        ║
║  Version: 1.0 Phase 1                      ║
║  Environment: ${process.env.NODE_ENV}                   ║
║  Server running on port ${PORT}                 ║
╚════════════════════════════════════════════╝
      `);
      console.log(`📍 API Base: http://localhost:${PORT}/api`);
      console.log(`📍 FHIR API: http://localhost:${PORT}/api/fhir`);
      console.log(`📍 Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export { app, prisma };
