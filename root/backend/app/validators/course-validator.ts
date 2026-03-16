import { body, param, query } from "express-validator";
import validate from "../middlewares/validate";

export const courseParamValidator: any = [
  param('courseId')
    .exists().withMessage("Missing courseId")
    .isInt().withMessage("courseId must be an integer"),
  validate,
]

export const getCoursesQueryValidator: any = [
  query('page')
    .optional()
    .isInt().withMessage('page must be an integer'),
  query('pageSize')
    .optional()
    .isInt().withMessage('pageSize must be an integer'),
  query('query')
    .optional()
    .isString().withMessage('query must be a string'),
  query('programmeId')
    .optional()
    .isInt().withMessage('programmeId must be an integer'),
  validate,
]

export const createCourseBodyValidator: any = [
  body('programmeId')
    .notEmpty().withMessage('Missing programmeId')
    .isInt().withMessage('programmeId must be an integer'),
  body('courseCode')
    .trim()
    .notEmpty().withMessage('Missing courseCode')
    .isString().withMessage('courseCode must be a string'),
  body('courseName')
    .trim()
    .notEmpty().withMessage('Missing courseName')
    .isString().withMessage('courseName must be a string'),
  validate,
];

export const updateCourseBodyValidator: any = [
  ...createCourseBodyValidator
]

export const createCourseSubjectBodyValidator: any = [
  body('courseId')
    .notEmpty().withMessage('Missing courseId')
    .isInt().withMessage('courseId must be an integer'),
  body('subjectId')
    .notEmpty().withMessage('Missing subjectId')
    .isInt().withMessage('subjectId must be an integer'),
  validate,
];
