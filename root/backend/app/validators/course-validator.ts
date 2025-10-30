import { body } from "express-validator";
import validate from "../middlewares/validate";

export const createAndUpdateCourseValidator: any = [
  body('programmeId')
    .notEmpty().withMessage('Missing programmeId')
    .isNumeric().withMessage('programmeId must be number'),
  body('courseName')
    .trim()
    .notEmpty().withMessage('Missing courseName')
    .isString().withMessage('courseName must be string'),
  validate,
];


export const createCourseSubjectValidator: any = [
  body('courseId')
    .notEmpty().withMessage('Missing courseId')
    .isNumeric().withMessage('courseId must be number'),
  body('subjectId')
    .notEmpty().withMessage('Missing subjectId')
    .isNumeric().withMessage('subjectId must be number'),
  validate,
];
