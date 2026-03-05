import { body, param, query } from "express-validator";
import validate from "../middlewares/validate";

export const lecturerParamValidator: any = [
  param('lecturerId')
    .exists().withMessage("Missing lecturerId")
    .isInt().withMessage("lecturerId must be a number")
    .toInt(),
  validate,
];

export const lecturerTitleParamValidator: any = [
  param('lecturerTitleId')
    .exists().withMessage("Missing lecturerTitleId")
    .isInt().withMessage("lecturerTitleId must be a number")
    .toInt(),
  validate,
];

export const getLecturersQueryValidator: any = [
  query('page')
    .optional()
    .isInt().withMessage('page must be a number'),
  query('pageSize')
    .optional()
    .isInt().withMessage('pageSize must be a number'),
  query('query')
    .optional()
    .isString().withMessage('query must be a string'),
  validate,
]

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
