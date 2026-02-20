import { body, param } from "express-validator";
import validate from "../middlewares/validate";

export const lecturerParamValidator: any = [
  param('lecturerId')
    .exists().withMessage("Invalid lecturerId")
    .isInt().withMessage("lecturerId must be a number")
    .toInt(),
  validate,
];

export const lecturerTitleParamValidator: any = [
  param('lecturerTitleId')
    .exists().withMessage("Invalid lecturerId")
    .isInt().withMessage("lecturerTitleId must be a number")
    .toInt(),
  validate,
];

export const createAndUpdateLecturerValidator: any = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('Missing firstName')
    .isString().withMessage('firstName must be a string'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Missing lastName')
    .isString().withMessage('lastName must be a string'),
  body('lecturerTitleId')
    .trim()
    .notEmpty().withMessage('Missing lecturerTitleId')
    .isNumeric().withMessage('lecturerTitleId must be a number'),
  body('email')
    .trim()
    .notEmpty().withMessage('Missing email')
    .isEmail().withMessage('Invalid email format'),
  body('phoneNumber')
    .trim()
    .notEmpty().withMessage('Missing phoneNumber')
    .matches(/^01\d{8,9}$/).withMessage("phoneNumber must start with 01 and contain 10-11 digits"),
  validate,
];
