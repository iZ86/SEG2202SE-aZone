import { Router } from "express";
import { asyncHandler } from "../utils/utils";
import EnrollmentController from "../controllers/enrollment.controller";
import { checkAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, verifyAuthTokenHeader, verifyStudentAuthToken } from "../middlewares/auth";
import { createAndUpdateEnrollmentSubjectValidator, createAndUpdateEnrollmentValidator } from "../validators/enrollment-validator";

class EnrollmentRoute {
  router = Router();
  controller = new EnrollmentController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {


    this.router.get("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getAllEnrollments));
    this.router.post("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateEnrollmentValidator, asyncHandler(this.controller.createEnrollment));

    this.router.get("/subjects", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getAllEnrollmentSubjects));
    this.router.post("/subjects", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateEnrollmentSubjectValidator, asyncHandler(this.controller.createEnrollmentSubject));


    this.router.get("/:enrollmentId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getEnrollmentById));
    this.router.put("/:enrollmentId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateEnrollmentValidator, asyncHandler(this.controller.updateEnrollmentById));
    this.router.delete("/:enrollmentId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.deleteEnrollmentById));


    this.router.get("/subjects/:enrollmentSubjectId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getEnrollmentSubjectById));
    this.router.put("/subjects/:enrollmentSubjectId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateEnrollmentSubjectValidator, asyncHandler(this.controller.updateEnrollmentSubjectById));
    this.router.delete("/subjects/:enrollmentSubjectId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.deleteEnrollmentSubjectById));
  }
}

export default new EnrollmentRoute().router;
