import { Request, Response } from "express";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE, ENUM_USER_ROLE } from "../enums/enums";
import AuthService from "../services/auth.service";

export default class AuthController {
  async login(req: Request, res: Response) {
    const userId: number = req.body.userId;
    const password: string = req.body.password;
    const role: ENUM_USER_ROLE = parseInt(req.body.role);
    let response: Result<{ token: string; }>;

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
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.INVALID_CREDS:
          return res.sendError.forbidden(response.getMessage());
        default:
          return res.sendError.badRequest(response.getMessage());
      }
    }
  }

  /** Gets personal information of user. */
  async getMe(req: Request, res: Response) {
    const userId: number = req.user.userId as number;
    const isAdmin: boolean = req.user.isAdmin as boolean;
    let response = undefined;

    if (isAdmin) {
      response = await AuthService.getAdminMe(userId);
    } else {
      response = await AuthService.getStudentMe(userId);
    }

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.INVALID_CREDS:
          return res.sendError.forbidden(response.getMessage());
        default:
          return res.sendError.badRequest(response.getMessage());
      }
    }
  }

  async udpateMe(req: Request, res: Response) {
    const userId: number = req.user.userId as number;
    const phoneNumber: string = req.body.phoneNumber;
    const email: string = req.body.email;

    const response = await AuthService.updateMe(userId, phoneNumber, email);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
        default:
          return res.sendError.badRequest(response.getMessage());
      }
    }
  }
}
