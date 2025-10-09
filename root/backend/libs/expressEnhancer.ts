import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from "express";

/**
 * Extended Request interface
 * Allows accessing req.user.userId, etc.
 */
export interface Request extends ExpressRequest {
  user?: {
    userId?: number;
    isStudent?: boolean;
    isAdmin?: boolean;
  };
}

/**
 * Extended Response interface
 * Adds res.sendSuccess() and res.sendError.*
 */
export interface Response extends ExpressResponse {
  sendSuccess<T>(data: T, message?: string): void;
  sendError: {
    badRequest(message?: string, error?: any): void;
    unauthorized(message?: string, error?: any): void;
    forbidden(message?: string, error?: any): void;
    notFound(message?: string, error?: any): void;
    invalidContentType(message?: string, error?: any): void;
    tooManyRequests(message?: string, error?: any): void;
    internal(message?: string, error?: any): void;
    maintenance(message?: string, error?: any): void;
  };
}

/**
 * Middleware to attach response helper methods.
 */
export function enhanceResponse(req: Request, res: ExpressResponse, next: NextFunction) {
  const r = res as Response;

  r.sendSuccess = function <T>(data: T, message = "Success") {
    return this.status(200).json({
      success: true,
      data,
      message,
    });
  };

  r.sendError = {
    badRequest(message = "Bad Request", error = null) {
      return r.status(400).json({ success: false, message, error });
    },

    unauthorized(message = "Unauthorized", error = null) {
      return r.status(401).json({ success: false, message, error });
    },

    forbidden(message = "Forbidden", error = null) {
      return r.status(403).json({ success: false, message, error });
    },

    notFound(message = "Not Found", error = null) {
      return r.status(404).json({ success: false, message, error });
    },

    invalidContentType(message = "Invalid Content Type", error = null) {
      return r.status(415).json({ success: false, message, error });
    },

    tooManyRequests(message = "Too Many Requests", error = null) {
      return r.status(429).json({ success: false, message, error });
    },

    internal(message = "Internal Server Error", error = null) {
      return r.status(500).json({ success: false, message, error });
    },

    maintenance(message = "Service Unavailable", error = null) {
      return r.status(503).json({ success: false, message, error });
    },
  };

  return next();
}
