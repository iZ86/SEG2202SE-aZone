import { body, param, query } from "express-validator";
import validate from "../middlewares/validate";

export const venueParamValidator: any = [
  param('venueId')
    .exists().withMessage("Missing venueId")
    .isInt().withMessage("venueId must be a number"),
  validate,
];

export const getVenuesQueryValidator: any = [
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
];

export const createAndUpdateVenueBodyValidator: any = [
  body('venue')
    .trim()
    .notEmpty().withMessage('Missing venue')
    .isString().withMessage("venue must be a string"),
  validate,
];
