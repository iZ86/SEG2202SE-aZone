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
    .trim()
    .notEmpty().withMessage('Missing intakeId')
    .matches(/^(20\d{2})(0[1-9]|1[0-2])$/)
    .withMessage("Invalid intakeId format. Must be in YYYYMM format (e.g., 202503, 202508, 202408)."),
  validate,
];
