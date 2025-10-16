import { Router } from "express";
import { asyncHandler } from "../utils/utils";
import AuthController from "../controllers/auth.controller";
import { loginBodyValidator, updateMeBodyValidator } from "../validators/auth-validator";
import { checkAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, verifyAuthTokenHeader, verifyStudentAuthToken } from "../middlewares/auth";

class AuthRoute {
  router = Router();
  controller = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post("/login", loginBodyValidator, asyncHandler(this.controller.login));
    this.router.get("/me", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getMe));
    this.router.put("/me", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAdminAuthToken, verifyAuthToken, updateMeBodyValidator, asyncHandler(this.controller.udpateMe));
  }
}

export default new AuthRoute().router;
