import { Request, Response } from "express";
import { Result } from "../../../libs/Result";
import { ENUM_ERROR_CODE, ENUM_USER_ROLE } from "../../enums/enums";
import AuthService from "../../services/auth/auth.service";

export default class AuthController {
  async login(req: Request, res: Response) {
    const userId: number = req.body.userId;
    const password: string = req.body.password;
    const role: ENUM_USER_ROLE = req.body.role;
    let response: Result<string>;

    switch (role) {
      case ENUM_USER_ROLE.STUDENT:
        response = await AuthService.loginStudent(userId, password);
        break;

      case ENUM_USER_ROLE.ADMIN:
        response = await AuthService.loginAdmin(userId, password);
        break;
      default:
        return res.sendError.internal("Unexpected login error");
    }

    if (response.isSuccess()) {
      return res.sendSuccess(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.INVALID_CREDS:
          return res.sendError.unauthorized(response.getMessage());
      }
    }
  }

  async getMe(req: Request, res: Response) {
    const userId: number = req.user.userId as number;
    const isAdmin: boolean = req.user.isAdmin as boolean;

    const response = await AuthService.getMe(userId, isAdmin ? ENUM_USER_ROLE.ADMIN : ENUM_USER_ROLE.STUDENT);

    if (response.isSuccess()) {
      return res.sendSuccess(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.INVALID_CREDS:
          return res.sendError.unauthorized(response.getMessage());
      }
    }
  }
}
