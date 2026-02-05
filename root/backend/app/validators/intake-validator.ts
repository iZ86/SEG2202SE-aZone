import { body, param } from "express-validator";
import validate from "../middlewares/validate";

export const intakeParamValidator: any = [
  param('intakeId')
    .exists().withMessage("Invalid intakeId")
    .isInt().withMessage("Invalid intakeId")
    .toInt(),
  validate,
];

export const createAndUpdateIntakeValidator: any = [
  body('intakeId')
    .notEmpty().withMessage('Missing intakeId')
    .isInt({ min: 200001, max: 209912 }) // covers years 2000-2099, months 01-12
    .withMessage("Invalid intakeId format. Must be an integer in YYYYMM format (e.g., 202503, 202508, 202408)."),
  validate,
];
