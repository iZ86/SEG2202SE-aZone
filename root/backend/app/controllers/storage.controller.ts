import { Request, Response } from "express";
import StorageService from "../services/storage.service";
import { ENUM_ERROR_CODE, ENUM_USER_ROLE } from "../enums/enums";
import authService from "../services/auth.service";

export default class StorageController {
  async uploadBlob(req: Request, res: Response) {
    const blobReadWriteToken: string = process.env.BLOB_READ_WRITE_TOKEN as string;


    const userId: number = req.user.userId as number;
    const isAdmin: boolean = req.user.isAdmin as boolean;
    let userData = undefined;

    if (isAdmin) {
      userData = await authService.getAdminMe(userId);
    } else {
      userData = await authService.getStudentMe(userId);
    }

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
