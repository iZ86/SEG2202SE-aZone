import { NextFunction } from 'express';
import { Request, Response } from '../../libs/expressEnhancer';
import { validationResult } from 'express-validator/lib/validation-result';

export default function (req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendError.badRequest(errors.array()[0].msg);
  }

  return next();
}
