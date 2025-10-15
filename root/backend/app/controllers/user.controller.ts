import { Request, Response } from "express";
import UserService from "../services/user.service";
import { ENUM_ERROR_CODE } from "../enums/enums";

export default class UserController {
  async getUsers(req: Request, res: Response) {
    const response = await UserService.getAllUsers();

    if (response.isSuccess()) {
      return res.sendSuccess(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }
}
