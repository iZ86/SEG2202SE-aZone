import { body, param } from "express-validator";
import validate from "../middlewares/validate";

export const venueParamValidator: any = [
  param('venueId')
    .exists().withMessage("Invalid venueId")
    .isInt().withMessage("Invalid venueId")
    .toInt(),
  validate,
];

export const createAndUpdateVenueValidator: any = [
  body('venue')
    .trim()
    .notEmpty().withMessage('Missing venue')
    .isString().withMessage("venue must be string"),
  validate,
];
