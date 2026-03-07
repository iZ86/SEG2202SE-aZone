import { body, param, query } from "express-validator";
import validate from "../middlewares/validate";

export const subjectParamValidator: any = [
  param('subjectId')
    .exists().withMessage("Missing subjectId")
    .isInt().withMessage("subjectId must be a number"),
  validate,
]

export const getSubjectsQueryValidator: any = [
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

export const getStudentSubjectsQueryValidator: any = [
  query('semester')
    .optional()
    .isInt().withMessage('semester must be a number'),
  validate,
]


export const createAndUpdateSubjectBodyValidator: any = [
  body('subjectName')
    .trim()
    .notEmpty().withMessage('Missing subjectName')
    .isString().withMessage('subjectName must be a string'),
  body('subjectCode')
    .trim()
    .notEmpty().withMessage('Missing subjectCode')
    .isString().withMessage('subjectCode must be a string'),
  body('description')
    .trim()
    .optional()
    .isString().withMessage('description must be string')
    .isLength({ max: 300 }).withMessage('description cannot exceed 300 characters'),
  body('creditHours')
    .trim()
    .notEmpty().withMessage('Missing creditHours')
    .isNumeric().withMessage('creditHours must be a number')
    .toInt(),
  body('courseIds')
    .isArray({ min: 1 }).withMessage('courseIds must be an array and at least one value'),
  body('courseIds.*')
    .isNumeric().withMessage('All items must be a number')
    .toInt(),
  validate,
];
