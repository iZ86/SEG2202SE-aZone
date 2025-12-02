import { body } from "express-validator";
import validate from "../middlewares/validate";

export const createAndUpdateEnrollmentValidator: any = [
  body('enrollmentStartDateTime')
    .trim()
    .notEmpty().withMessage('Missing enrollmentStartDateTime')
    .isISO8601().withMessage("enrollmentStartDateTime must be date time"),
  validate,
  body('enrollmentEndDateTime')
    .trim()
    .notEmpty().withMessage('Missing enrollmentEndDateTime')
    .isISO8601().withMessage("enrollmentEndDateTime must be date time"),
  body('programmeIntakeIds')
    .isArray({ min: 1 }).withMessage('programmeIntakeIds must be an array and at least one value')
    .notEmpty().withMessage('Array cannot be empty'),
  body('programmeIntakeIds.*')
    .isNumeric().withMessage('All items must be numeric'),
  validate,
];
