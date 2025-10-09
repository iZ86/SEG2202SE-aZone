/**
 * Validators folder will be used for checking values in the request body
 * This is an example for login
 * Note: Only will be used for APIs that contains request body
 */
import { body } from "express-validator";
import validate from "../middlewares/validate";

export const login: any = [
  body('identifier')
    .notEmpty().withMessage('Missing identifier')
    .isString().withMessage('Indentifier must be string'),
  body('password')
    .notEmpty().withMessage('Missing password')
    .isString().withMessage('Password must be string'),
  validate,
]