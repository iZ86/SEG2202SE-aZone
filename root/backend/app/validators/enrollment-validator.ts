import { body, param } from "express-validator";
import validate from "../middlewares/validate";

export const enrollmentParamValidator: any = [
  param('enrollmentId')
    .exists().withMessage("Missing enrollmentId")
    .isInt().withMessage("enrollmentId must be number")
    .toInt(),
  validate,
]

export const enrollmentSubjectParamValidator: any = [
  param('enrollmentSubjectId')
    .exists().withMessage("Missing enrollmentSubjectId")
    .isInt().withMessage("enrollmentSubjectId must be number")
    .toInt(),
  validate,
]

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
    .optional()
    .isArray({ min: 1 }).withMessage('programmeIntakeIds must be an array and at least one value')
    .notEmpty().withMessage('Array cannot be empty'),
  body('programmeIntakeIds.*')
    .isNumeric().withMessage('All programmeIntakeIds must be numeric'),
  validate,
];

export const enrollStudentSubjectsValidator: any = [
  body('enrollmentSubjectTypeIds')
  .isArray().withMessage('enrollmentSubjectTypeIds must be an array of numbers with atleast one value')
  .notEmpty().withMessage('Array cannot be empty'),
  validate,
];


export const createAndUpdateEnrollmentSubjectValidator: any = [
  body('enrollmentId')
    .trim()
    .notEmpty().withMessage('enrollmentId cannot be empty')
    .isNumeric().withMessage('enrollmentId must be numeric'),
  body('subjectId')
    .trim()
    .notEmpty().withMessage('subjectId cannot be empty')
    .isNumeric().withMessage('subjectId must be numeric'),
  body('lecturerId')
    .trim()
    .notEmpty().withMessage('lecturerId cannot be empty')
    .isNumeric().withMessage('lecturerId must be numeric'),
  body('enrollmentSubjectTypes')
    .isArray().withMessage('enrollmentSubjectTypes must be an array'),
  body('enrollmentSubjectTypes.*.classTypeId')
    .trim()
    .notEmpty().withMessage('classTypeId cannot be empty')
    .isNumeric().withMessage('classTypeId must be numeric'),
  body('enrollmentSubjectTypes.*.venueId')
    .trim()
    .notEmpty().withMessage('venueId cannot be empty')
    .isNumeric().withMessage('venueId must be numeric'),
  body('enrollmentSubjectTypes.*.startTime')
    .trim()
    .notEmpty().withMessage('startTime cannot be empty')
    .isTime({}).withMessage('startTime must be time'),
  body('enrollmentSubjectTypes.*.endTime')
    .trim()
    .notEmpty().withMessage('endTime cannot be empty')
    .isTime({}).withMessage('endTime must be time'),
  body('enrollmentSubjectTypes.*.dayId')
    .trim()
    .notEmpty().withMessage('dayId cannot be empty')
    .isNumeric().withMessage('dayId must be numeric'),
  body('enrollmentSubjectTypes.*.numberOfSeats')
    .trim()
    .notEmpty().withMessage('numberOfSeats cannot be empty')
    .isNumeric().withMessage('numberOfSeats must be numeric'),
  body('enrollmentSubjectTypes.*.grouping')
    .trim()
    .notEmpty().withMessage('grouping cannot be empty')
    .isNumeric().withMessage('grouping must be numeric'),
  validate,
];
