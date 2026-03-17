import { body, param, query } from "express-validator";
import validate from "../middlewares/validate";

export const studentParamValidator: any = [
  param('studentId')
    .exists().withMessage("Missing studentId")
    .isInt().withMessage("studentId must be an integer"),
  validate,
];

export const adminParamValidator: any = [
  param('adminId')
    .exists().withMessage("Missing adminId")
    .isInt().withMessage("adminId must be an integer"),
  validate,
];

export const getStudentsQueryValidator: any = [
  query('page')
    .optional()
    .isInt().withMessage('page must be an integer'),
  query('pageSize')
    .optional()
    .isInt().withMessage('pageSize must be an integer'),
  query('query')
    .optional()
    .isString().withMessage('query must be a string'),
  validate,
]

export const getAdminsQueryValidator: any = [
  ...getStudentsQueryValidator
]

export const createStudentBodyValidator: any = [
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
    .notEmpty().withMessage('Missing userStatus'),
  validate,
];

export const updateStudentBodyValidator: any = [
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
    .notEmpty().withMessage('Missing userStatus'),
  validate,
];

export const updateAdminBodyValidator: any = [
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

export const updateUserProfilePictureBodyValidator: any = [
  body('profilePictureUrl')
    .trim()
    .notEmpty().withMessage('Missing profilePictureUrl')
    .isString().withMessage('profilePictureUrl must be a string'),
  validate,
];
