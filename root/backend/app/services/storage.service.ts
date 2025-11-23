import { Request } from "express";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { handleUpload } from '@vercel/blob/client';
import UserRepository from "../repositories/user.repository";
import { del } from "@vercel/blob";

interface IStorageService {
  uploadBlob(request: Request, blobReadWriteToken: string): Promise<Result<any>>;
  deleteBlob(blobUrl: string, blobReadWriteToken: string): Promise<Result<null>>;
}

class StorageService implements IStorageService {
  async uploadBlob(req: Request, blobReadWriteToken: string): Promise<Result<any>> {
    const response = await handleUpload({
      body: req.body,
      request: req,
      token: blobReadWriteToken,
      onBeforeGenerateToken: async (
        pathname,
      ) => {
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
          addRandomSuffix: true,
        };
      },
    });

    if (!response) {
      return Result.fail(ENUM_ERROR_CODE.INTERNAL, 'Failed to handle upload');
    }

    return Result.succeed(response, "Uploaded profile picture");
  }

  async deleteBlob(blobUrl: string, blobReadWriteToken: string): Promise<Result<null>> {
    try {
      await del(blobUrl, {
        token: blobReadWriteToken,
      });
      return Result.succeed(null, "Blob deleted successfully");

    } catch (err) {
      console.error('Failed to delete blob:', err);
      return Result.fail(ENUM_ERROR_CODE.INTERNAL, 'Failed to delete blob');
    }
  }
}

export default new StorageService();
