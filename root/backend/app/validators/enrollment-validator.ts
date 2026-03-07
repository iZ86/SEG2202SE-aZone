import { body, param, query } from "express-validator";
import validate from "../middlewares/validate";

export const getEnrollmentsAndSubjectsQueryValidator: any = [
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

export const getMonthlyEnrollmentCountQueryValidator: any = [
  query('duration')
    .optional()
    .isInt().withMessage('duration must be a number'),
  validate,
]

export const enrollmentParamValidator: any = [
  param('enrollmentId')
    .exists().withMessage("Missing enrollmentId")
    .isInt().withMessage("enrollmentId must be a number"),
  validate,
]

export const enrollmentSubjectParamValidator: any = [
  param('enrollmentSubjectId')
    .exists().withMessage("Missing enrollmentSubjectId")
    .isInt().withMessage("enrollmentSubjectId must be a number"),
  validate,
]

export const createAndUpdateEnrollmentBodyValidator: any = [
  body('enrollmentStartDateTime')
    .trim()
    .notEmpty().withMessage('Missing enrollmentStartDateTime')
    .isISO8601().withMessage("enrollmentStartDateTime must be a date time"),
  validate,
  body('enrollmentEndDateTime')
    .trim()
    .notEmpty().withMessage('Missing enrollmentEndDateTime')
    .isISO8601().withMessage("enrollmentEndDateTime must be a date time"),
  body('programmeIntakeIds')
    .optional()
    .isArray({ min: 1 }).withMessage('programmeIntakeIds must be an array and at least one value'),
  body('programmeIntakeIds.*')
    .isNumeric().withMessage('All programmeIntakeIds must be a number'),
  validate,
];

export const enrollStudentSubjectsValidator: any = [
  body('enrollmentSubjectTypeIds')
    .isArray({min: 0}).withMessage('enrollmentSubjectTypeIds must be an array of numbers with atleast one value'),
  validate,
];


export const createEnrollmentSubjectBodyValidator: any = [
  body('enrollmentId')
    .trim()
    .notEmpty().withMessage('enrollmentId cannot be empty')
    .isNumeric().withMessage('enrollmentId must be a number')
    .toInt(),
  body('subjectId')
    .trim()
    .notEmpty().withMessage('subjectId cannot be empty')
    .isNumeric().withMessage('subjectId must be a number')
    .toInt(),
  body('lecturerId')
    .trim()
    .notEmpty().withMessage('lecturerId cannot be empty')
    .isNumeric().withMessage('lecturerId must be a number')
    .toInt(),
  body('enrollmentSubjectTypes')
    .isArray().withMessage('enrollmentSubjectTypes must be an array'),
  body('enrollmentSubjectTypes.*.classTypeId')
    .trim()
    .notEmpty().withMessage('classTypeId cannot be empty')
    .isNumeric().withMessage('classTypeId must be a number')
    .toInt(),
  body('enrollmentSubjectTypes.*.venueId')
    .trim()
    .notEmpty().withMessage('venueId cannot be empty')
    .isNumeric().withMessage('venueId must be a number')
    .toInt(),
  body('enrollmentSubjectTypes.*.startTime')
    .trim()
    .notEmpty().withMessage('startTime cannot be empty')
    .isTime({}).withMessage('startTime must be a time'),
  body('enrollmentSubjectTypes.*.endTime')
    .trim()
    .notEmpty().withMessage('endTime cannot be empty')
    .isTime({}).withMessage('endTime must be a time'),
  body('enrollmentSubjectTypes.*.dayId')
    .trim()
    .notEmpty().withMessage('dayId cannot be empty')
    .isNumeric().withMessage('dayId must be a number')
    .toInt(),
  body('enrollmentSubjectTypes.*.numberOfSeats')
    .trim()
    .notEmpty().withMessage('numberOfSeats cannot be empty')
    .isNumeric().withMessage('numberOfSeats must be a number')
    .toInt(),
  body('enrollmentSubjectTypes.*.grouping')
    .trim()
    .notEmpty().withMessage('grouping cannot be empty')
    .isNumeric().withMessage('grouping must be a number')
    .toInt(),
  body('enrollmentSubjectTypes.*.lecturerId')
    .trim()
    .notEmpty().withMessage('lecturerId cannot be empty')
    .isNumeric().withMessage('lecturerId must be a number')
    .toInt(),
  validate,
];

export const updateEnrollmentSubjectBodyValidator: any = [
  body('enrollmentId')
    .trim()
    .notEmpty().withMessage('enrollmentId cannot be empty')
    .isNumeric().withMessage('enrollmentId must be a number')
    .toInt(),
  body('subjectId')
    .trim()
    .notEmpty().withMessage('subjectId cannot be empty')
    .isNumeric().withMessage('subjectId must be a number')
    .toInt(),
  body('lecturerId')
    .trim()
    .notEmpty().withMessage('lecturerId cannot be empty')
    .isNumeric().withMessage('lecturerId must be a number')
    .toInt(),
  body('enrollmentSubjectTypes')
    .isArray().withMessage('enrollmentSubjectTypes must be an array'),
  body('enrollmentSubjectTypes.*.enrollmentSubjectTypeId')
    .optional()
    .trim()
    .isNumeric().withMessage('enrollmentSubjectTypeId must be a number')
    .toInt(),
  body('enrollmentSubjectTypes.*.classTypeId')
    .trim()
    .notEmpty().withMessage('classTypeId cannot be empty')
    .isNumeric().withMessage('classTypeId must be a number')
    .toInt(),
  body('enrollmentSubjectTypes.*.venueId')
    .trim()
    .notEmpty().withMessage('venueId cannot be empty')
    .isNumeric().withMessage('venueId must be a number')
    .toInt(),
  body('enrollmentSubjectTypes.*.startTime')
    .trim()
    .notEmpty().withMessage('startTime cannot be empty')
    .isTime({}).withMessage('startTime must be a time'),
  body('enrollmentSubjectTypes.*.endTime')
    .trim()
    .notEmpty().withMessage('endTime cannot be empty')
    .isTime({}).withMessage('endTime must be a time'),
  body('enrollmentSubjectTypes.*.dayId')
    .trim()
    .notEmpty().withMessage('dayId cannot be empty')
    .isNumeric().withMessage('dayId must be a number')
    .toInt(),
  body('enrollmentSubjectTypes.*.numberOfSeats')
    .trim()
    .notEmpty().withMessage('numberOfSeats cannot be empty')
    .isNumeric().withMessage('numberOfSeats must be a number')
    .toInt(),
  body('enrollmentSubjectTypes.*.grouping')
    .trim()
    .notEmpty().withMessage('grouping cannot be empty')
    .isNumeric().withMessage('grouping must be a number')
    .toInt(),
  body('enrollmentSubjectTypes.*.lecturerId')
    .trim()
    .notEmpty().withMessage('lecturerId cannot be empty')
    .isNumeric().withMessage('lecturerId must be a number')
    .toInt(),
  validate,
];
