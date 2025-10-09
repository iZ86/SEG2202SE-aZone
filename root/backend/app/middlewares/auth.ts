import { NextFunction } from "express";
import { Request, Response } from "../../libs/expressEnhancer";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
const jwtSecretKey: string = process.env.SECRET_KEY || "abc";

/** Checks if there is an auth header and token. */
export const checkAuthTokenHeader = (req: Request, res: Response, next: NextFunction) => {

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.setHeader('WWW-Authentiate', 'Bearer realm="okujobseeker"');
    return res.sendError.unauthorized("Invalid credentials");
  }
  return next();
}

/** Checks if the token is valid or not. */
export const verifyAuthTokenHeader = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  try {
    const trimmedToken = token!.trim();
    const decodedToken = jwt.verify(trimmedToken, jwtSecretKey) as JwtPayloadDTO;
    req.body.userId = decodedToken.userId;
    return next();
  } catch (err) {

    if (err instanceof JsonWebTokenError) {
      res.setHeader('WWW-Authentiate', 'Bearer realm="okujobseeker", error="invalid_token", error_description="Invalid access token"');
      return res.sendError.unauthorized("Invalid credentials");

    } else {
      throw new Error("Error occured in verifyAuthTokenHeader.");

    }
  }

}

export const verifyAdminAuthTokenHeader = async (req: Request, res: Response, next: NextFunction) => {
  // const isAdmin: boolean = await userRepository.isAdminExist(req.body.userId);
  // if (!isAdmin) {
  // return res.sendError.unauthorized("Invalid credentials");
  // }
  return next();
}

export const verifyEmployerAuthTokenHeader = async (req: Request, res: Response, next: NextFunction) => {
  // const isStudent: boolean = await userRepository.isStudentExist(req.body.userId);
  // if (!isStudent) {
  // return res.sendError.unauthorized("Invalid credentials");
  // }
  return next();
}

/** Checks if the content type is application/json. */
export const checkContentType = (req: Request, res: Response, next: NextFunction) => {
  const contentTypeHeader = req.headers['content-type'];
  if (!contentTypeHeader || contentTypeHeader !== "application/json") {
    return res.sendError.invalidContentType("Only supports Content-Type: application/json in HTTP request headers.");
  }
  return next();
}

interface JwtPayloadDTO {
  userId: number;
}
