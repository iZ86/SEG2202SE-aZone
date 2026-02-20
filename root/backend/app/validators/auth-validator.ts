import { body } from "express-validator";
import validate from "../middlewares/validate";
import { ENUM_USER_ROLE } from "../enums/enums";

export const loginValidator: any = [
  body('userId')
    .notEmpty().withMessage('Missing userId')
    .isNumeric().withMessage('userId must be a number'),
  body('password')
    .trim()
    .notEmpty().withMessage('Missing password')
    .isString().withMessage('Password must be a string'),
  body('role')
    .notEmpty().withMessage('Missing role')
    .isNumeric().withMessage('Role must be a number')
    .isIn(Object.values(ENUM_USER_ROLE)).withMessage('Invalid user role'),
  validate,
];

export const updateMeValidator: any = [
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
