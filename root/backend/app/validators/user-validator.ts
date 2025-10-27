import { body } from "express-validator";
import validate from "../middlewares/validate";

export const createStudentValidator: any = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('Missing firstName')
    .isString().withMessage('firstName must be string'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Missing lastName')
    .isString().withMessage('lastName must be string'),
  body('email')
    .trim()
    .notEmpty().withMessage('Missing email')
    .isEmail().withMessage('email must be email'),
  body('phoneNumber')
    .trim()
    .notEmpty().withMessage('Missing phoneNumber')
    .matches(/^01\d{8,9}$/).withMessage("phoneNumber must start with 01 and contain 10-11 digits"),
  body('password')
    .trim()
    .notEmpty().withMessage('Missing password')
    .isString().withMessage('Password must be string'),
  body('userStatus')
    .trim()
    .notEmpty().withMessage('Missing userStatus')
    .isIn([1, 0]).withMessage('userStatus must be 1 or 0'),
  body('programmeId')
    .trim()
    .notEmpty().withMessage('Missing programmeId')
    .isNumeric().withMessage('programmeId must be numeric'),
  body('courseId')
    .trim()
    .notEmpty().withMessage('Missing courseId')
    .isNumeric().withMessage('courseId must be numeric'),
  body('programmeIntakeId')
    .trim()
    .notEmpty().withMessage('Missing programmeIntakeId')
    .isNumeric().withMessage('programmeIntakeId must be numeric'),
  body('courseStatus')
    .trim()
    .notEmpty().withMessage('Missing courseStatus')
    .isIn([0, 1]).withMessage('courseStatus must be 1 or 0'),
  validate,
];

export const updateStudentValidator: any = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('Missing firstName')
    .isString().withMessage('firstName must be string'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Missing lastName')
    .isString().withMessage('lastName must be string'),
  body('email')
    .trim()
    .notEmpty().withMessage('Missing email')
    .isEmail().withMessage('email must be email'),
  body('phoneNumber')
    .trim()
    .notEmpty().withMessage('Missing phoneNumber')
    .matches(/^01\d{8,9}$/).withMessage("phoneNumber must start with 01 and contain 10-11 digits"),
  body('userStatus')
    .trim()
    .notEmpty().withMessage('Missing userStatus')
    .isIn([0, 1]).withMessage('userStatus must be 1 or 0'),
  body('programmeId')
    .trim()
    .notEmpty().withMessage('Missing programmeId')
    .isNumeric().withMessage('programmeId must be numeric'),
  body('courseId')
    .trim()
    .notEmpty().withMessage('Missing courseId')
    .isNumeric().withMessage('courseId must be numeric'),
  body('programmeIntakeId')
    .trim()
    .notEmpty().withMessage('Missing programmeIntakeId')
    .isNumeric().withMessage('programmeIntakeId must be numeric'),
  body('courseStatus')
    .trim()
    .notEmpty().withMessage('Missing courseStatus')
    .isIn([1, 0]).withMessage('courseStatus must be 1 or 0'),
  validate,
];

export const updateAdminValidator: any = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('Missing firstName')
    .isString().withMessage('firstName must be string'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Missing lastName')
    .isString().withMessage('lastName must be string'),
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
