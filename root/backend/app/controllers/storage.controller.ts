import { Request, Response } from "express";
import StorageService from "../services/storage.service";
import { ENUM_ERROR_CODE, ENUM_USER_ROLE } from "../enums/enums";
import authService from "../services/auth.service";

export default class StorageController {
  async uploadBlob(req: Request, res: Response) {
    const blobReadWriteToken: string = process.env.BLOB_READ_WRITE_TOKEN as string;

    const userData = await authService.getMe(
      req.user.userId,
      req.user.isAdmin ? ENUM_USER_ROLE.ADMIN : ENUM_USER_ROLE.STUDENT);

    const existingUserProfilePictureUrl: string = (await userData).getData().profilePictureUrl;

    if (existingUserProfilePictureUrl) {
      await StorageService.deleteBlob(existingUserProfilePictureUrl, blobReadWriteToken);
    }

    const response = await StorageService.uploadBlob(req, blobReadWriteToken);

    if (response.isSuccess()) {
      return res.status(200).json({
        success: true,
        type: response.getData().type,
        clientToken: response.getData().clientToken,
      });
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.INTERNAL:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }
}
