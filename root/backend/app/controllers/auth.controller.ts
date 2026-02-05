import { Request, Response } from "express";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE, ENUM_USER_ROLE } from "../enums/enums";
import authService from "../services/auth.service";

export default class AuthController {
  async login(req: Request, res: Response) {
    const userId: number = req.body.userId;
    const password: string = req.body.password;
    const role: ENUM_USER_ROLE = Number(req.body.role);
    let response: Result<{ token: string; }>;

    switch (role) {
      case ENUM_USER_ROLE.STUDENT:
        response = await authService.loginStudent(userId, password);
        break;

      case ENUM_USER_ROLE.ADMIN:
        response = await authService.loginAdmin(userId, password);
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
      response = await authService.getAdminMe(userId);
    } else {
      response = await authService.getStudentMe(userId);
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

  async updateMe(req: Request, res: Response) {
    const userId: number = req.user.userId as number;
    const phoneNumber: string = req.body.phoneNumber;
    const email: string = req.body.email;

    const response = await authService.updateMe(userId, phoneNumber, email);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
        case ENUM_ERROR_CODE.CONFLICT:
          return res.sendError.conflict(response.getMessage());
        default:
          return res.sendError.badRequest(response.getMessage());
      }
    }
  }
}
