import { Router } from "express";
import { asyncHandler } from "../utils/utils";
import StorageController from "../controllers/storage.controller";
import { checkAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, verifyAuthTokenHeader, verifyStudentAuthToken } from "../middlewares/auth";

class StorageRoute {
  router = Router();
  controller = new StorageController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.uploadBlob));
  }
}

export default new StorageRoute().router;
