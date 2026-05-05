import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { prisma } from "../server.js";
import { AppError } from "../middleware/errorHandler.js";
import { logSecurityEvent } from "../middleware/audit.js";

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || 12);
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || "15m";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || "7d";

/**
 * Register new user
 */
export const registerUser = async (data) => {
  const { email, password, firstname, lastname, organizationId, roleId } = data;

  // Check if email exists
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    throw new AppError("Email already registered", 409);
  }

  // Hash password
  const hashedPassword = await bcryptjs.hash(password, BCRYPT_ROUNDS);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstname,
      lastname,
      organizationId,
      isActive: true,
      roles: roleId
        ? {
            create: {
              roleId,
            },
          }
        : undefined,
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  return user;
};

/**
 * Login user
 */
export const loginUser = async (email, password, ipAddress) => {
  const user = await prisma.user.findUnique({
    where: { email },
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
    // Log security event
    await logSecurityEvent({
      type: "failed_login",
      severity: "low",
      description: `Failed login attempt for non-existent email: ${email}`,
      ipAddress,
    });

    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AppError("User account is inactive", 403);
  }

  // Verify password
  const passwordMatch = await bcryptjs.compare(password, user.password);

  if (!passwordMatch) {
    await logSecurityEvent({
      type: "failed_login",
      severity: "low",
      description: `Failed login attempt for user: ${email}`,
      userId: user.id,
      ipAddress,
    });

    throw new AppError("Invalid email or password", 401);
  }

  // If MFA enabled, return partial token requiring MFA verification
  if (user.mfaEnabled) {
    return {
      requiresMfa: true,
      mfaToken: generateTempToken(user.id, "5m"),
      userId: user.id,
    };
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // Generate tokens
  const tokens = generateTokens(user);

  return {
    requiresMfa: false,
    user: formatUser(user),
    tokens,
  };
};

/**
 * Verify MFA code
 */
export const verifyMfa = async (userId, token, ipAddress) => {
  // Verify MFA token first
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== "mfa" || decoded.sub !== userId) {
      throw new AppError("Invalid MFA token", 401);
    }
  } catch (error) {
    throw new AppError("MFA token expired", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: { role: true },
      },
    },
  });

  if (!user || !user.mfaEnabled) {
    throw new AppError("User not found or MFA not enabled", 401);
  }

  // MFA code is passed in request, but we need it from the route
  // This function expects the caller to have verified the TOTP code

  await prisma.user.update({
    where: { id: userId },
    data: { lastLogin: new Date() },
  });

  const tokens = generateTokens(user);

  return {
    user: formatUser(user),
    tokens,
  };
};

/**
 * Enable MFA for user
 */
export const enableMfa = async (userId) => {
  const secret = speakeasy.generateSecret({
    name: `GeniDoc Hayat (${process.env.MFA_ISSUER})`,
    issuer: process.env.MFA_ISSUER || "GeniDoc Hayat",
  });

  // Generate QR code
  const qrCode = await qrcode.toDataURL(secret.otpauth_url);

  // Save secret temporarily (user must verify within session)
  await prisma.user.update({
    where: { id: userId },
    data: { mfaSecret: secret.base32 },
  });

  return {
    secret: secret.base32,
    qrCode,
    message:
      "Scan this QR code with your authenticator app and verify a code to enable MFA",
  };
};

/**
 * Verify MFA code for setup
 */
export const verifyMfaSetup = async (userId, code) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mfaSecret: true },
  });

  if (!user || !user.mfaSecret) {
    throw new AppError("MFA not initialized", 400);
  }

  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: "base32",
    token: code,
    window: parseInt(process.env.MFA_WINDOW || 2),
  });

  if (!verified) {
    throw new AppError("Invalid MFA code", 401);
  }

  // Enable MFA
  await prisma.user.update({
    where: { id: userId },
    data: { mfaEnabled: true },
  });

  return { success: true, message: "MFA enabled successfully" };
};

/**
 * Disable MFA
 */
export const disableMfa = async (userId, password) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Verify password
  const passwordMatch = await bcryptjs.compare(password, user.password);
  if (!passwordMatch) {
    throw new AppError("Invalid password", 401);
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      mfaEnabled: false,
      mfaSecret: null,
    },
  });

  return { success: true, message: "MFA disabled" };
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new AppError("User not found or inactive", 401);
    }

    const tokens = generateTokens(user);
    return tokens;
  } catch (error) {
    throw new AppError("Invalid refresh token", 401);
  }
};

// ==================== TOKEN GENERATION ====================

function generateTokens(user) {
  const accessToken = jwt.sign({ sub: user.id, type: "access" }, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });

  const refreshToken = jwt.sign(
    { sub: user.id, type: "refresh" },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRY },
  );

  return { accessToken, refreshToken };
}

function generateTempToken(userId, expiresIn = "5m") {
  return jwt.sign({ sub: userId, type: "mfa" }, JWT_SECRET, { expiresIn });
}

function formatUser(user) {
  return {
    id: user.id,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    organizationId: user.organizationId,
    facilityId: user.facilityId,
    careUnitId: user.careUnitId,
    roles: user.roles.map((ur) => ur.role.name),
  };
}

export const verifyMfaCode = async (userId, code) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mfaSecret: true },
  });

  if (!user?.mfaSecret) {
    throw new AppError("MFA not configured", 400);
  }

  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: "base32",
    token: code,
    window: parseInt(process.env.MFA_WINDOW || 2),
  });

  return verified;
};
