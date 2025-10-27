import { Router } from "express";
import { asyncHandler } from "../utils/utils";
import UserController from "../controllers/user.controller";
import { checkAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, verifyAuthTokenHeader, verifyStudentAuthToken } from "../middlewares/auth";
import { createStudentValidator, updateAdminValidator, updateStudentValidator } from "../validators/user-validator";

class UserRoute {
  router = Router();
  controller = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.delete("/students/course/programme/intake/:studentId/status/:status", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.deleteStudentCourseProgrammeIntakeByStudentIdAndStatus));
    // this.router.put("/students/course/programme/intake/:studentId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, updateStudentCourseProgrammeIntakeBodyValidator, asyncHandler(this.controller.updateStudentCourseProgrammeIntakeById));
    this.router.get("/students/:studentId/course/programme/intake", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getStudentCourseProgrammeIntakeByStudentId));
    this.router.get("/students/course/programme/intake", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getAllStudentCourseProgrammeIntakes));
    // this.router.post("/students/course/programme/intake", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createStudentCourseProgrammeIntakeBodyValidator, asyncHandler(this.controller.createStudentCourseProgrammeIntake));
    this.router.get("/students/:studentId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getStudentById));
    this.router.get("/admins/:adminId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getAdminById));
    this.router.get("/students", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getAllStudents));
    this.router.post("/students", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createStudentValidator, asyncHandler(this.controller.createStudent));
    this.router.get("/admins", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getAllAdmins));
    this.router.patch("/admins/:adminId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, updateAdminValidator, asyncHandler(this.controller.updateAdminById));
    this.router.put("/students/:studentId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, updateStudentValidator, asyncHandler(this.controller.updateStudentById));
    this.router.delete("/:userId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.deleteUserById));
  }
}

export default new UserRoute().router;
