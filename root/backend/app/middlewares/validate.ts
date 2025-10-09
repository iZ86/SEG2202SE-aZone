import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator/lib/validation-result';

export default function (req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg
    });
  }

  return next();
}
