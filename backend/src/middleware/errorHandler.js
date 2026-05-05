import jwt from "jsonwebtoken";
import { prisma } from "../server.js";

// Async wrapper for route handlers
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode = 500, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === "development";

  // Default error
  let error = {
    message: err.message || "Internal server error",
    statusCode: err.statusCode || 500,
  };

  // Log error
  if (isDev) {
    console.error("❌ Error:", {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      details: err.details,
    });
  } else {
    console.error("❌ Error:", error.message);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = {
      message: "Invalid token",
      statusCode: 401,
    };
  }

  if (err.name === "TokenExpiredError") {
    error = {
      message: "Token expired",
      statusCode: 401,
    };
  }

  // Prisma errors
  if (err.code === "P2002") {
    const field = err.meta?.target?.[0] || "field";
    error = {
      message: `${field} already exists`,
      statusCode: 409,
    };
  }

  if (err.code === "P2025") {
    error = {
      message: "Record not found",
      statusCode: 404,
    };
  }

  // Send response
  res.status(error.statusCode).json({
    error: error.message,
    ...(isDev && { details: err.details, stack: err.stack }),
  });
};
