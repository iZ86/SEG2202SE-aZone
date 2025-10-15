import { Router } from "express";
import { asyncHandler } from "../../utils/utils";
import AuthController from "../../controllers/auth/auth.controller";
import { login } from "../../validators/auth/auth-validator";
import { checkAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, verifyAuthTokenHeader, verifyStudentAuthToken } from "../../middlewares/auth";

class AuthRoute {
  router = Router();
  controller = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post("/login", login, asyncHandler(this.controller.login));
    this.router.get("/me", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getMe));
  }
}

export default new AuthRoute().router;
