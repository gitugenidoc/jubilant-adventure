import express from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { authMiddleware, optionalAuth } from "../middleware/auth.js";
import * as authService from "../services/authService.js";
import { prisma } from "../config/database.js";

const router = express.Router();

// POST /api/auth/register - Create new user
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { email, password, firstname, lastname, organizationId } = req.body;

    // Validation
    if (!email || !password || !firstname || !lastname) {
      return res.status(400).json({
        error: true,
        message:
          "Missing required fields: email, password, firstname, lastname",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: true,
        message: "Password must be at least 8 characters",
      });
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({
        error: true,
        message: "User with this email already exists",
      });
    }

    // Create user
    const user = await authService.registerUser(
      email,
      password,
      firstname,
      lastname,
      organizationId || "default-org",
    );

    res.status(201).json({
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      message: "User registered successfully",
    });
  }),
);

// POST /api/auth/login - Authenticate user
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: "Email and password required",
      });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: {
              include: { permissions: { include: { permission: true } } },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({
        error: true,
        message: "Invalid email or password",
      });
    }

    // Verify password
    const isValid = await authService.comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        error: true,
        message: "Invalid email or password",
      });
    }

    // Check if MFA is enabled
    if (user.mfaEnabled) {
      const tempToken = await authService.generateTokens(user.id, true);
      return res.json({
        mfaRequired: true,
        temporaryToken: tempToken,
        email: user.email,
        message: "Enter TOTP code from authenticator app",
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await authService.generateTokens(
      user.id,
    );

    // Build permissions
    const permissions = new Set();
    user.roles.forEach((ur) => {
      ur.role.permissions.forEach((rp) => {
        permissions.add(rp.permission.name);
      });
    });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        roles: user.roles.map((ur) => ur.role.name),
        permissions: Array.from(permissions),
        organizationId: user.organizationId,
        mfaEnabled: user.mfaEnabled,
      },
    });
  }),
);

// POST /api/auth/mfa/verify - Verify TOTP code
router.post(
  "/mfa/verify",
  asyncHandler(async (req, res) => {
    const { temporaryToken, code } = req.body;

    if (!temporaryToken || !code) {
      return res.status(400).json({
        error: true,
        message: "temporaryToken and code required",
      });
    }

    // Decode temp token to get userId (in real app, verify JWT)
    // For now, simplified - in production use JWT verification
    const decoded = JSON.parse(
      Buffer.from(temporaryToken.split(".")[1], "base64").toString(),
    );
    const userId = decoded.sub;

    // Get user and MFA secret
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: { permissions: { include: { permission: true } } },
            },
          },
        },
      },
    });

    if (!user || !user.mfaSecret) {
      return res.status(401).json({
        error: true,
        message: "Invalid temporary token",
      });
    }

    // Verify TOTP
    const isValid = await authService.verifyMfaCode(user.mfaSecret, code);
    if (!isValid) {
      return res.status(401).json({
        error: true,
        message: "Invalid TOTP code",
      });
    }

    // Generate real tokens
    const { accessToken, refreshToken } = await authService.generateTokens(
      user.id,
    );

    // Build permissions
    const permissions = new Set();
    user.roles.forEach((ur) => {
      ur.role.permissions.forEach((rp) => {
        permissions.add(rp.permission.name);
      });
    });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        roles: user.roles.map((ur) => ur.role.name),
        permissions: Array.from(permissions),
      },
    });
  }),
);

// POST /api/auth/mfa/enable - Setup MFA
router.post(
  "/mfa/enable",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        error: true,
        message: "Password required",
      });
    }

    // Verify password
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isValid = await authService.comparePassword(password, user.password);

    if (!isValid) {
      return res.status(401).json({
        error: true,
        message: "Invalid password",
      });
    }

    // Generate MFA secret
    const { secret, qrCode } = await authService.enableMfa(user.email);

    res.json({
      secret,
      qrCode,
      message:
        "Scan this QR code with Google Authenticator, Microsoft Authenticator, or Authy",
    });
  }),
);

// POST /api/auth/mfa/verify-setup - Confirm MFA setup
router.post(
  "/mfa/verify-setup",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { code, secret } = req.body;

    if (!code || !secret) {
      return res.status(400).json({
        error: true,
        message: "code and secret required",
      });
    }

    // Verify TOTP with the new secret
    const isValid = await authService.verifyMfaCode(secret, code);
    if (!isValid) {
      return res.status(401).json({
        error: true,
        message: "Invalid code",
      });
    }

    // Save secret to user
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        mfaSecret: secret,
        mfaEnabled: true,
      },
    });

    res.json({
      message: "MFA enabled successfully",
    });
  }),
);

// POST /api/auth/mfa/disable - Disable MFA
router.post(
  "/mfa/disable",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { password, code } = req.body;

    if (!password || !code) {
      return res.status(400).json({
        error: true,
        message: "Password and TOTP code required",
      });
    }

    // Verify password
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isValid = await authService.comparePassword(password, user.password);

    if (!isValid) {
      return res.status(401).json({
        error: true,
        message: "Invalid password",
      });
    }

    // Verify TOTP
    const isValidCode = await authService.verifyMfaCode(user.mfaSecret, code);
    if (!isValidCode) {
      return res.status(401).json({
        error: true,
        message: "Invalid TOTP code",
      });
    }

    // Disable MFA
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        mfaSecret: null,
        mfaEnabled: false,
      },
    });

    res.json({
      message: "MFA disabled successfully",
    });
  }),
);

// POST /api/auth/refresh - Get new access token
router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: true,
        message: "refreshToken required",
      });
    }

    try {
      const newAccessToken = await authService.refreshAccessToken(refreshToken);
      res.json({
        accessToken: newAccessToken,
        expiresIn: 900,
      });
    } catch (error) {
      res.status(401).json({
        error: true,
        message: "Invalid or expired refresh token",
      });
    }
  }),
);

// GET /api/auth/me - Get current user
router.get(
  "/me",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        roles: { include: { role: true } },
        organization: true,
        facility: true,
      },
    });

    res.json({
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      roles: user.roles.map((ur) => ur.role.name),
      permissions: req.user.permissions ? Array.from(req.user.permissions) : [],
      organizationId: user.organizationId,
      organizationName: user.organization?.name,
      facilityId: user.facilityId,
      facilityName: user.facility?.name,
      mfaEnabled: user.mfaEnabled,
      createdAt: user.createdAt,
    });
  }),
);

// POST /api/auth/logout - Logout (client-side token cleanup)
router.post(
  "/logout",
  authMiddleware,
  asyncHandler(async (req, res) => {
    // In a real app, you might blacklist the token or track logout
    res.json({
      message: "Logged out successfully",
    });
  }),
);

export default router;
