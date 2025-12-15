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

export const enrollStudentSubjectsValidator: any = [
  body('enrollmentSubjectTypeIds')
    .isArray({ min: 1 }).withMessage('enrollmentSubjectTypeIds must be an array of numbers with atleast one value')
    .notEmpty().withMessage('Array cannot be empty'),
  validate,
];

export const createEnrollmentSubjectValidator: any = [
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
  body('enrollmentSubjects')
    .isArray().withMessage('enrollmentSubjects must be an array')
    .notEmpty().withMessage('Array cannot be empty'),
  body('enrollmentSubjects.*.classTypeId')
    .trim()
    .notEmpty().withMessage('classTypeId cannot be empty')
    .isNumeric().withMessage('classTypeId must be numeric'),
  body('enrollmentSubjects.*.venueId')
    .trim()
    .notEmpty().withMessage('venueId cannot be empty')
    .isNumeric().withMessage('venueId must be numeric'),
  body('enrollmentSubjects.*.startTime')
    .trim()
    .notEmpty().withMessage('startTime cannot be empty')
    .isTime({}).withMessage('startTime must be time'),
  body('enrollmentSubjects.*.endTime')
    .trim()
    .notEmpty().withMessage('endTime cannot be empty')
    .isTime({}).withMessage('endTime must be time'),
  body('enrollmentSubjects.*.dayId')
    .trim()
    .notEmpty().withMessage('dayId cannot be empty')
    .isNumeric().withMessage('dayId must be numeric'),
  body('enrollmentSubjects.*.numberOfSeats')
    .trim()
    .notEmpty().withMessage('numberOfSeats cannot be empty')
    .isNumeric().withMessage('numberOfSeats must be numeric'),
  body('enrollmentSubjects.*.grouping')
    .trim()
    .notEmpty().withMessage('grouping cannot be empty')
    .isNumeric().withMessage('grouping must be numeric'),
  validate,
];

export const updateEnrollmentSubjectValidator: any = [
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
  body('enrollmentSubjects')
    .isArray().withMessage('enrollmentSubjects must be an array')
    .notEmpty().withMessage('Array cannot be empty'),
  body('enrollmentSubjects.*.enrollmentSubjectTypeId')
    .trim()
    .notEmpty().withMessage('enrollmentSubjectTypeId cannot be empty')
    .isNumeric().withMessage('enrollmentSubjectTypeId must be numeric'),
  body('enrollmentSubjects.*.classTypeId')
    .trim()
    .notEmpty().withMessage('classTypeId cannot be empty')
    .isNumeric().withMessage('classTypeId must be numeric'),
  body('enrollmentSubjects.*.venueId')
    .trim()
    .notEmpty().withMessage('venueId cannot be empty')
    .isNumeric().withMessage('venueId must be numeric'),
  body('enrollmentSubjects.*.startTime')
    .trim()
    .notEmpty().withMessage('startTime cannot be empty')
    .isTime({}).withMessage('startTime must be time'),
  body('enrollmentSubjects.*.endTime')
    .trim()
    .notEmpty().withMessage('endTime cannot be empty')
    .isTime({}).withMessage('endTime must be time'),
  body('enrollmentSubjects.*.dayId')
    .trim()
    .notEmpty().withMessage('dayId cannot be empty')
    .isNumeric().withMessage('dayId must be numeric'),
  body('enrollmentSubjects.*.numberOfSeats')
    .trim()
    .notEmpty().withMessage('numberOfSeats cannot be empty')
    .isNumeric().withMessage('numberOfSeats must be numeric'),
  body('enrollmentSubjects.*.grouping')
    .trim()
    .notEmpty().withMessage('grouping cannot be empty')
    .isNumeric().withMessage('grouping must be numeric'),
  validate,
];
