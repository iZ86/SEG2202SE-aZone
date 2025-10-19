import { body } from "express-validator";
import validate from "../middlewares/validate";

export const createAndUpdateSubjectBodyValidator: any = [
  body('subjectName')
    .trim()
    .notEmpty().withMessage('Missing subjectName')
    .isString().withMessage('subjectName must be string'),
  body('subjectCode')
    .trim()
    .notEmpty().withMessage('Missing subjectCode')
    .isString().withMessage('subjectCode must be string'),
  body('description')
    .trim()
    .notEmpty().withMessage('Missing description')
    .isString().withMessage('description must be string')
    .isLength({ max: 300 }).withMessage('description cannot exceed 300 characters'),
  body('creditHours')
    .trim()
    .notEmpty().withMessage('Missing creditHours')
    .isNumeric().withMessage('creditHours must be numeric'),
  validate,
];
