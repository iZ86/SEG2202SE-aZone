import { Router } from "express";
import { asyncHandler } from "../utils/utils";
import AuthController from "../controllers/auth.controller";
import { loginValidator, updateMeValidator } from "../validators/auth-validator";
import { checkAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, verifyAuthTokenHeader, verifyStudentAuthToken } from "../middlewares/auth";

class AuthRoute {
  router = Router();
  controller = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {

    this.router.get("/me", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getMe));

    this.router.post("/login", loginValidator, asyncHandler(this.controller.login));

    this.router.patch("/me", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAdminAuthToken, verifyAuthToken, updateMeValidator, asyncHandler(this.controller.updateMe));
  }
}

export default new AuthRoute().router;
