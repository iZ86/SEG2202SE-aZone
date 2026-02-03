import { body, param } from "express-validator";
import validate from "../middlewares/validate";

export const createCourseValidator: any = [
  body('programmeId')
    .notEmpty().withMessage('Missing programmeId')
    .isNumeric().withMessage('programmeId must be number'),
  body('courseCode')
    .trim()
    .notEmpty().withMessage('Missing courseCode')
    .isString().withMessage('courseCode must be string'),
  body('courseName')
    .trim()
    .notEmpty().withMessage('Missing courseName')
    .isString().withMessage('courseName must be string'),
  validate,
];

export const updateCourseValidator: any = [
  param('courseId')
    .exists().withMessage("Invalid courseId")
    .isInt().withMessage("Invalid courseId")
    .toInt(),
  body('programmeId')
    .notEmpty().withMessage('Missing programmeId')
    .isNumeric().withMessage('programmeId must be number'),
  body('courseCode')
    .trim()
    .notEmpty().withMessage('Missing courseCode')
    .isString().withMessage('courseCode must be string'),
  body('courseName')
    .trim()
    .notEmpty().withMessage('Missing courseName')
    .isString().withMessage('courseName must be string'),
  validate,
];

export const deleteCourseValidator: any = [
  param('courseId')
    .exists().withMessage("Invalid courseId")
    .isInt().withMessage("Invalid courseId")
    .toInt(),
  validate,
]

export const createCourseSubjectValidator: any = [
  body('courseId')
    .notEmpty().withMessage('Missing courseId')
    .isNumeric().withMessage('courseId must be number'),
  body('subjectId')
    .notEmpty().withMessage('Missing subjectId')
    .isNumeric().withMessage('subjectId must be number'),
  validate,
];
