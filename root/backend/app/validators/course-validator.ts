import { body, param, query } from "express-validator";
import validate from "../middlewares/validate";

export const courseParamValidator: any = [
  param('courseId')
    .exists().withMessage("Missing courseId")
    .isInt().withMessage("courseId must be a number"),
  validate,
]

export const getCoursesQueryValidator: any = [
  query('page')
    .optional()
    .isInt().withMessage('page must be a number'),
  query('pageSize')
    .optional()
    .isInt().withMessage('pageSize must be a number'),
  query('query')
    .optional()
    .isString().withMessage('query must be a string'),
  query('programmeId')
    .optional()
    .isInt().withMessage('programmeId must be a number'),
  validate,
]

export const createAndUpdateCourseBodyValidator: any = [
  body('programmeId')
    .notEmpty().withMessage('Missing programmeId')
    .isNumeric().withMessage('programmeId must be a number'),
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

export const createCourseSubjectBodyValidator: any = [
  body('courseId')
    .notEmpty().withMessage('Missing courseId')
    .isNumeric().withMessage('courseId must be a number'),
  body('subjectId')
    .notEmpty().withMessage('Missing subjectId')
    .isNumeric().withMessage('subjectId must be a number'),
  validate,
];
