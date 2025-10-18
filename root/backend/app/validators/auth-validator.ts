import { body } from "express-validator";
import validate from "../middlewares/validate";
import { ENUM_USER_ROLE } from "../enums/enums";

export const loginBodyValidator: any = [
  body('userId')
    .notEmpty().withMessage('Missing userId')
    .isNumeric().withMessage('Indentifier must be number'),
  body('password')
    .trim()
    .notEmpty().withMessage('Missing password')
    .isString().withMessage('Password must be string'),
  body('role')
    .notEmpty().withMessage('Missing role')
    .isNumeric().withMessage('Role must be number')
    .isIn(Object.values(ENUM_USER_ROLE)).withMessage('Invalid user role'),
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
