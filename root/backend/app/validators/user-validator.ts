import { body, param, query } from "express-validator";
import validate from "../middlewares/validate";

export const studentParamValidator: any = [
  param('studentId')
    .exists().withMessage("Missing studentId")
    .isInt().withMessage("studentId must be a number"),
  validate,
];

export const adminParamValidator: any = [
  param('adminId')
    .exists().withMessage("Missing adminId")
    .isInt().withMessage("adminId must be a number"),
  validate,
];

export const getStudentsQueryValidator: any = [
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

export const getAdminsQueryValidator: any = [
  ...getStudentsQueryValidator
]

export const createStudentValidator: any = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('Missing firstName')
    .isString().withMessage('firstName must be a string'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Missing lastName')
    .isString().withMessage('lastName must be a string'),
  body('email')
    .trim()
    .notEmpty().withMessage('Missing email')
    .isEmail().withMessage('Invalid email format'),
  body('phoneNumber')
    .trim()
    .notEmpty().withMessage('Missing phoneNumber')
    .matches(/^01\d{8,9}$/).withMessage("phoneNumber must start with 01 and contain 10-11 digits"),
  body('password')
    .trim()
    .notEmpty().withMessage('Missing password')
    .isString().withMessage('password must be a string'),
  body('userStatus')
    .trim()
    .notEmpty().withMessage('Missing userStatus')
    .isIn([1, 0]).withMessage('userStatus must be either 1 or 0'),
  validate,
];

export const updateStudentValidator: any = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('Missing firstName')
    .isString().withMessage('firstName must be a string'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Missing lastName')
    .isString().withMessage('lastName must be a string'),
  body('email')
    .trim()
    .notEmpty().withMessage('Missing email')
    .isEmail().withMessage('Invalid email format'),
  body('phoneNumber')
    .trim()
    .notEmpty().withMessage('Missing phoneNumber')
    .matches(/^01\d{8,9}$/).withMessage("phoneNumber must start with 01 and contain 10-11 digits"),
  body('userStatus')
    .trim()
    .notEmpty().withMessage('Missing userStatus')
    .isIn([0, 1]).withMessage('userStatus must be either 1 or 0'),
  validate,
];

export const updateAdminValidator: any = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('Missing firstName')
    .isString().withMessage('firstName must be a string'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Missing lastName')
    .isString().withMessage('lastName must be a string'),
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

export const updateUserProfilePictureValidator: any = [
  body('profilePictureUrl')
    .trim()
    .notEmpty().withMessage('Missing profilePictureUrl')
    .isString().withMessage('profilePictureUrl must be a string'),
  validate,
];
