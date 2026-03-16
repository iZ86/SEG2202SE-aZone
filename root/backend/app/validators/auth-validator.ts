import { body } from "express-validator";
import validate from "../middlewares/validate";

export const loginBodyValidator: any = [
  body('userId')
    .notEmpty().withMessage('Missing userId')
    .isInt().withMessage('userId must be a number')
    .toInt(),
  body('password')
    .trim()
    .notEmpty().withMessage('Missing password')
    .isString().withMessage('Password must be a string'),
  body('role')
    .notEmpty().withMessage('Missing role')
    .isInt().withMessage('Role must be a number')
    .toInt(),
  validate,
];

export const updateMeBodyValidator: any = [
  body('phoneNumber')
    .trim()
    .notEmpty().withMessage('Missing phoneNumber')
    .matches(/^01\d{8,9}$/).withMessage("phoneNumber must start with 01 and contain 10-11 digits"),
  body('email')
    .trim()
    .notEmpty().withMessage('Missing email')
    .isEmail().withMessage('email must be email'),
  validate,
];
