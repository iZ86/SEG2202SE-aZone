import { Router } from "express";
import { asyncHandler } from "../utils/utils";
import UserController from "../controllers/user.controller";
import { checkAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, verifyAuthTokenHeader, verifyStudentAuthToken } from "../middlewares/auth";
import { createStudentValidator } from "../validators/user-validator";

class UserRoute {
  router = Router();
  controller = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get("/students/:userId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getStudentById));
    this.router.get("/admins/:userId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getAdminById));
    this.router.get("/students", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getStudents));
    this.router.post("/students", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createStudentValidator, asyncHandler(this.controller.createStudent));
    this.router.get("/admins", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getAdmins));
    this.router.put("/:userId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.updateUserById));
    this.router.delete("/:userId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.deleteUserById));
  }
}

export default new UserRoute().router;
