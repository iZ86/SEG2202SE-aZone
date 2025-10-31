import { body } from "express-validator";
import validate from "../middlewares/validate";

export const createAndUpdateVenueValidator: any = [
  body('venue')
    .trim()
    .notEmpty().withMessage('Missing venue')
    .isString().withMessage("venue must be string"),
  validate,
];
