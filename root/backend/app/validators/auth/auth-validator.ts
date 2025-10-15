/**
 * Validators folder will be used for checking values in the request body
 * This is an example for login
 * Note: Only will be used for APIs that contains request body
 */
import { body } from "express-validator";
import validate from "../../middlewares/validate";
import { ENUM_USER_ROLE } from "../../enums/enums";

export const login: any = [
  body('userId')
    .notEmpty().withMessage('Missing userId')
    .isNumeric().withMessage('Indentifier must be number'),
  body('password')
    .notEmpty().withMessage('Missing password')
    .isString().withMessage('Password must be string'),
  body('role')
    .notEmpty().withMessage('Missing role')
    .isIn(Object.values(ENUM_USER_ROLE)).withMessage('Role must user or admin'),
  validate,
]