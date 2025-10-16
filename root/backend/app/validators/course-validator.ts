import { body } from "express-validator";
import validate from "../middlewares/validate";

export const createAndUpdateCourseBodyValidator: any = [
  body('programmeId')
    .notEmpty().withMessage('Missing programmeId')
    .isNumeric().withMessage('programmeId must be number'),
  body('courseName')
    .trim()
    .notEmpty().withMessage('Missing courseName')
    .isString().withMessage('courseName must be string'),
  validate,
];
