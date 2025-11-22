import { Request, Response, NextFunction } from "express";

/**
 * Extended Request interface
 * Allows accessing req.user.userId, etc.
 *
 * Extended Response interface
 * Adds res.sendSuccess() and res.sendError.*
 */
declare module 'express-serve-static-core' {
  interface Request {
    user: {
      userId: number;
      isStudent: boolean;
      isAdmin: boolean;
    };
  }

  interface Response {
    sendSuccess: {
      ok(data: any, message?: string): void;
      create(data: any, message?: string): void;
      delete(): void;
    };

    sendError: {
      badRequest(message?: string): void;
      unauthorized(message?: string): void;
      forbidden(message?: string): void;
      notFound(message?: string): void;
      conflict(message?: string): void;
      invalidContentType(message?: string): void;
      tooManyRequests(message?: string): void;
      internal(message?: string): void;
      maintenance(message?: string): void;
    };
  }
}

/**
 * Middleware to attach response helper methods.
 */
export function enhanceResponse(req: Request, res: Response, next: NextFunction) {
  const r = res as Response;

  r.sendSuccess = {
    ok(data, message = "Success") {
      return r.status(200).json({
        success: true,
        data,
        message,
      });
    },

    create(data, message = "Created") {
      return r.status(201).json({
        success: true,
        data,
        message,
      });
    },

    delete() {
      return r.status(204).end();
    },
  };

  r.sendError = {
    badRequest(message = "Bad Request") {
      return r.status(400).json({
        success: false,
        message
      });
    },

    unauthorized(message = "Unauthorized") {
      return r.status(401).json({
        success: false,
        message
      });
    },

    forbidden(message = "Forbidden") {
      return r.status(403).json({
        success: false,
        message
      });
    },

    notFound(message = "Not Found") {
      return r.status(404).json({
        success: false,
        message
      });
    },

    conflict(message = "Conflict") {
      return r.status(409).json({
        success: false,
        message
      });
    },

    invalidContentType(message = "Invalid Content Type") {
      return r.status(415).json({
        success: false,
        message
      });
    },

    tooManyRequests(message = "Too Many Requests") {
      return r.status(429).json({
        success: false,
        message
      });
    },

    internal(message = "Internal Server Error") {
      return r.status(500).json({
        success: false,
        message
      });
    },

    maintenance(message = "Service Unavailable") {
      return r.status(503).json({
        success: false,
        message
      });
    },
  };

  return next();
}
