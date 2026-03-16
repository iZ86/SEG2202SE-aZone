import { body, param, query } from "express-validator";
import validate from "../middlewares/validate";

export const programmeParamValidator: any = [
  param('programmeId')
    .exists().withMessage("Missing programmeId")
    .isInt().withMessage("programmeId must be a number"),
  validate,
]

export const programmeIntakeParamValidator: any = [
  param('programmeIntakeId')
    .exists().withMessage("Missing programmeIntakeId")
    .isInt().withMessage("programmeIntakeId must be a number"),
  validate,
]

export const getProgrammesAndIntakesQueryValidator: any = [
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

export const getProgrammeHistoryQueryValidator: any = [
  query('status')
    .optional()
    .isInt().withMessage('status must be a number'),
  validate,
]

export const getAdminProgrammeHistoryQueryValidator: any = [
  query('studentId')
    .isInt().withMessage('studentId must be a number'),
  validate,
]


export const createProgrammeBodyValidator: any = [
  body('programmeName')
    .trim()
    .notEmpty().withMessage('Missing programmeName')
    .isString().withMessage('programmeName must be a string'),
  validate,
];

export const updateProgrammeBodyValidator: any = [
  ...createProgrammeBodyValidator
]

export const createProgrammeIntakeBodyValidator: any = [
  body('programmeId')
    .notEmpty().withMessage('Missing programmeId')
    .isInt().withMessage('programmeId must be a number')
    .toInt(),
  body('intakeId')
    .notEmpty().withMessage('Missing intakeId')
    .isInt().withMessage('intakeId must be a number')
    .toInt(),
  body('studyModeId')
    .notEmpty().withMessage('Missing studyModeId')
    .isInt().withMessage('studyModeId must be a number')
    .toInt(),
  body('semester')
    .notEmpty().withMessage('Missing semester')
    .isInt().withMessage('semester must be a number')
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
    .isInt().withMessage('status must be a number')
    .toInt(),
  validate,
];

export const updateProgrammeIntakeBodyValidator: any = [
  ...createProgrammeIntakeBodyValidator
]

export const createStudentCourseProgrammeIntakeBodyValidator: any = [
  body('studentId')
    .trim()
    .notEmpty().withMessage('Missing studentId')
    .isInt().withMessage('studentId must be a number')
    .toInt(),
  body('programmeIntakeId')
    .trim()
    .notEmpty().withMessage('Missing programmeIntakeId')
    .isInt().withMessage('programmeIntakeId must be a number')
    .toInt(),
  body('courseId')
    .trim()
    .notEmpty().withMessage('Missing courseId')
    .isInt().withMessage('courseId must be a number')
    .toInt(),
  validate,
];
