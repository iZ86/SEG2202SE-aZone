import { body, param } from "express-validator";
import validate from "../middlewares/validate";

export const venueParamValidator: any = [
  param('venueId')
    .exists().withMessage("Missing venueId")
    .isInt().withMessage("venueId must be a number")
    .toInt(),
  validate,
];

export const createAndUpdateVenueValidator: any = [
  body('venue')
    .trim()
    .notEmpty().withMessage('Missing venue')
    .isString().withMessage("venue must be a string"),
  validate,
];
