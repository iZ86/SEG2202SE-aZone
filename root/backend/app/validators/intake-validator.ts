import { body, param, query } from "express-validator";
import validate from "../middlewares/validate";

export const intakeParamValidator: any = [
  param('intakeId')
    .exists().withMessage("Missing intakeId")
    .isInt().withMessage("intakeId must be a number"),
  validate,
];

export const getIntakesQueryValidator: any = [
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

export const createIntakeBodyValidator: any = [
  body('intakeId')
    .notEmpty().withMessage('Missing intakeId')
    .isInt({ min: 200001, max: 209912 }) // covers years 2000-2099, months 01-12
    .withMessage("Invalid intakeId format. Must be an integer in YYYYMM format (e.g., 202503, 202508, 202408)."),
  validate,
];

export const updateIntakeBodyValidator: any = [
  ...createIntakeBodyValidator
]
