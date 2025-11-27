import { body } from "express-validator";
import validate from "../middlewares/validate";

export const createAndUpdateLecturerValidator: any = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('Missing firstName')
    .isString().withMessage('firstName must be string'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Missing lastName')
    .isString().withMessage('lastName must be string'),
  body('lecturerTitleId')
    .trim()
    .notEmpty().withMessage('Missing lecturerTitleId')
    .isNumeric().withMessage('lecturerTitleId must be numeric'),
  body('email')
    .trim()
    .notEmpty().withMessage('Missing email')
    .isEmail().withMessage('email must be email'),
  body('phoneNumber')
    .trim()
    .notEmpty().withMessage('Missing phoneNumber')
    .matches(/^01\d{8,9}$/).withMessage("phoneNumber must start with 01 and contain 10-11 digits"),
  validate,
];
