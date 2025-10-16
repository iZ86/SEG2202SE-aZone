import { NextFunction } from "express";
import { Request, Response } from "express";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import UserRepository from "../repositories/user.repository";
const jwtSecretKey: string = process.env.SECRET_KEY || "secret_key";

/** Checks if there is an auth header and token. */
export const checkAuthTokenHeader = (req: Request, res: Response, next: NextFunction) => {

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.setHeader('WWW-Authentiate', 'Bearer realm="okujobseeker"');
    return res.sendError.unauthorized("Invalid credentials");
  }
  return next();
};

/** Checks if the token is valid or not. */
export const verifyAuthTokenHeader = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  try {
    const trimmedToken = token!.trim();
    const decodedToken = jwt.verify(trimmedToken, jwtSecretKey) as JwtPayloadDTO;

    req.user = {
      ...req.user,
      userId: decodedToken.userId,
    };

    return next();
  } catch (err) {

    if (err instanceof JsonWebTokenError) {
      res.setHeader('WWW-Authentiate', 'Bearer realm="okujobseeker", error="invalid_token", error_description="Invalid access token"');
      return res.sendError.unauthorized("Invalid credentials");

    } else {
      throw new Error("Error occured in verifyAuthTokenHeader.");

    }
  }

};

export const verifyAdminAuthToken = async (req: Request, res: Response, next: NextFunction) => {
  const isAdmin: boolean = await UserRepository.isAdminExist(req.user.userId);

  if (!isAdmin) {
    req.user = {
      ...req.user,
      isAdmin: false,
    };
    return next();
  }

  req.user = {
    ...req.user,
    isAdmin: true,
  };

  return next();
};

export const verifyStudentAuthToken = async (req: Request, res: Response, next: NextFunction) => {
  const isStudent: boolean = await UserRepository.isStudentExist(req.user.userId);

  if (!isStudent) {
    req.user = {
      ...req.user,
      isStudent: false,
    };
    return next();
  }

  req.user = {
    ...req.user,
    isStudent: true,
  };

  return next();
};

export const verifyAuthToken = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user.isAdmin && !req.user.isStudent) {
    return res.sendError.unauthorized("Unauthorized");
  }
  return next();
};

/** Checks if the content type is application/json. */
export const checkContentType = (req: Request, res: Response, next: NextFunction) => {
  const contentTypeHeader = req.headers['content-type'];
  if (!contentTypeHeader || contentTypeHeader !== "application/json") {
    return res.sendError.invalidContentType("Only supports Content-Type: application/json in HTTP request headers.");
  }
  return next();
};

interface JwtPayloadDTO {
  userId: number;
}
