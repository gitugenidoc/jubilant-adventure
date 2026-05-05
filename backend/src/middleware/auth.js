import jwt from "jsonwebtoken";
import { AppError, asyncHandler } from "./errorHandler.js";
import { prisma } from "../server.js";

/**
 * Verify JWT token and attach user to request
 */
export const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError("No authentication token provided", 401);
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user with roles and permissions
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
        permissions: {
          include: { permission: true },
        },
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.isActive) {
      throw new AppError("User account is inactive", 403);
    }

    // Build permissions list
    const permissions = new Set();

    // From roles
    user.roles.forEach((ur) => {
      ur.role.permissions.forEach((rp) => {
        permissions.add(rp.permission.name);
      });
    });

    // Direct permissions
    user.permissions.forEach((up) => {
      permissions.add(up.permission.name);
    });

    // Attach to request
    req.user = {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      organizationId: user.organizationId,
      facilityId: user.facilityId,
      careUnitId: user.careUnitId,
      roles: user.roles.map((ur) => ur.role.name),
      permissions: Array.from(permissions),
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError("Token expired", 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError("Invalid token", 401);
    }
    throw error;
  }
});

/**
 * Require specific role(s)
 */
export const requireRole =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const hasRole = allowedRoles.some((role) => req.user.roles.includes(role));

    if (!hasRole) {
      throw new AppError("Insufficient permissions", 403);
    }

    next();
  };

/**
 * Require specific permission(s)
 */
export const requirePermission =
  (...permissions) =>
  (req, res, next) => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const hasPermission = permissions.every((perm) =>
      req.user.permissions.includes(perm),
    );

    if (!hasPermission) {
      throw new AppError("Insufficient permissions", 403);
    }

    next();
  };

/**
 * Optional auth - user may or may not be authenticated
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    if (user && user.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        roles: user.roles.map((ur) => ur.role.name),
      };
    }
  } catch (error) {
    // Silent fail for optional auth
  }

  next();
});

/**
 * Check if user has access to a patient (same organization)
 */
export const canAccessPatient = asyncHandler(async (req, res, next) => {
  const patientId = req.params.patientId || req.body.patientId;

  if (!patientId) {
    throw new AppError("Patient ID required", 400);
  }

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { organizationId: true },
  });

  if (!patient) {
    throw new AppError("Patient not found", 404);
  }

  // Check if user is in same organization
  if (patient.organizationId !== req.user.organizationId) {
    throw new AppError("Access denied to patient", 403);
  }

  req.patient = patient;
  next();
});

/**
 * Check if user is patient or has permission to access patient data
 */
export const checkPatientAccess = asyncHandler(async (req, res, next) => {
  const patientId = req.params.patientId || req.body.patientId;

  if (!patientId) {
    throw new AppError("Patient ID required", 400);
  }

  // If user has read_patient permission, allow
  if (req.user.permissions.includes("patients:read")) {
    return next();
  }

  // Otherwise check if they are the patient (not in Phase 1)
  // In future: check if user is linked to patient account

  throw new AppError("Access denied", 403);
});
