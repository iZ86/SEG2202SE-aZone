import { body, param } from "express-validator";
import validate from "../middlewares/validate";

export const programmeParamValidator: any = [
  param('programmeId')
    .exists().withMessage("Missing programmeId")
    .isInt().withMessage("programmeId must be a number")
    .toInt(),
  validate,
]

export const createAndUpdateProgrammeValidator: any = [
  body('programmeName')
    .trim()
    .notEmpty().withMessage('Missing programmeName')
    .isString().withMessage('programmeName must be a string'),
  validate,
];

export const createAndUpdateProgrammeIntakeValidator: any = [
  body('programmeId')
    .notEmpty().withMessage('Missing programmeId')
    .isNumeric().withMessage('programmeId must be a number')
    .toInt(),
  body('intakeId')
    .notEmpty().withMessage('Missing intakeId')
    .isNumeric().withMessage('intakeId must be a number')
    .toInt(),
  body('studyModeId')
    .notEmpty().withMessage('Missing studyModeId')
    .isNumeric().withMessage('studyModeId must be a number')
    .toInt(),
  body('semester')
    .notEmpty().withMessage('Missing semester')
    .isNumeric().withMessage('semester must be a number')
    .toInt(),
  body('semesterStartDate')
    .notEmpty().withMessage('Missing semesterStartDate')
    .isDate().withMessage('semesterStartDate must be a (YYYY-MM-DD) format')
    .toDate(),
  body('semesterEndDate')
    .notEmpty().withMessage('Missing semesterEndDate')
    .isDate().withMessage('semesterEndDate must be a (YYYY-MM-DD) format')
    .toDate(),
  body('status')
    .notEmpty().withMessage('Missing status')
    .isNumeric().withMessage('status must be a number')
    .toInt(),
  validate,
];

export const createStudentCourseProgrammeIntakeValidator: any = [
  body('studentId')
    .trim()
    .notEmpty().withMessage('Missing studentId')
    .isNumeric().withMessage('studentId must be a number'),
  body('programmeIntakeId')
    .trim()
    .notEmpty().withMessage('Missing programmeIntakeId')
    .isNumeric().withMessage('programmeIntakeId must be a number'),
  body('courseId')
    .trim()
    .notEmpty().withMessage('Missing courseId')
    .isNumeric().withMessage('courseId must be a number'),
  validate,
];
