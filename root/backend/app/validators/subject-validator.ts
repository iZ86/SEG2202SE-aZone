import { body } from "express-validator";
import validate from "../middlewares/validate";

export const createAndUpdateSubjectValidator: any = [
  body('subjectName')
    .trim()
    .notEmpty().withMessage('Missing subjectName')
    .isString().withMessage('subjectName must be a string')
    .toString(),
  body('subjectCode')
    .trim()
    .notEmpty().withMessage('Missing subjectCode')
    .isString().withMessage('subjectCode must be a string')
    .toString(),
  body('description')
    .trim()
    .optional()
    .isString().withMessage('description must be string')
    .isLength({ max: 300 }).withMessage('description cannot exceed 300 characters')
    .toString(),
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
