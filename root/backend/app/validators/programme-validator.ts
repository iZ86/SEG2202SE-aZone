import { body } from "express-validator";
import validate from "../middlewares/validate";

export const createAndUpdateProgrammeValidator: any = [
  body('programmeName')
    .trim()
    .notEmpty().withMessage('Missing programmeName')
    .isString().withMessage('programmeName must be string'),
  validate,
];

export const createAndUpdateProgrammeIntakeValidator: any = [
  body('programmeId')
    .notEmpty().withMessage('Missing programmeId')
    .isNumeric().withMessage('programmeId must be numeric'),
  body('intakeId')
    .notEmpty().withMessage('Missing intakeId')
    .isNumeric().withMessage('intakeId must be numeric'),
  body('semester')
    .notEmpty().withMessage('Missing semester')
    .isNumeric().withMessage('semester must be numeric'),
  body('semesterStartDate')
    .notEmpty().withMessage('Missing semesterStartDate')
    .isDate().withMessage('semesterStartDate must be (YYYY-MM-DD) format'),
  body('semesterEndDate')
    .notEmpty().withMessage('Missing semesterEndDate')
    .isDate().withMessage('semesterEndDate must be (YYYY-MM-DD) format'),
  validate,
];
