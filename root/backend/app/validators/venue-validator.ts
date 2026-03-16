import { body, param, query } from "express-validator";
import validate from "../middlewares/validate";

export const venueParamValidator: any = [
  param('venueId')
    .exists().withMessage("Missing venueId")
    .isInt().withMessage("venueId must be an integer"),
  validate,
];

export const getVenuesQueryValidator: any = [
  query('page')
    .optional()
    .isInt().withMessage('page must be an integer'),
  query('pageSize')
    .optional()
    .isInt().withMessage('pageSize must be an integer'),
  query('query')
    .optional()
    .isString().withMessage('query must be a string'),
  validate,
];

export const createVenueBodyValidator: any = [
  body('venue')
    .trim()
    .notEmpty().withMessage('Missing venue')
    .isString().withMessage("venue must be a string"),
  validate,
];

export const updateVenueBodyValidator: any = [
  ...createVenueBodyValidator
]
