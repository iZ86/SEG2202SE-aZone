import { Router } from "express";
import { asyncHandler } from "../utils/utils";
import EnrollmentController from "../controllers/enrollment.controller";
import { checkAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, verifyAuthTokenHeader, verifyStudentAuthToken } from "../middlewares/auth";
import { createAndUpdateEnrollmentSubjectValidator, createAndUpdateEnrollmentValidator, createEnrollmentSubjectTypeValidator, enrollStudentSubjectsValidator, updateEnrollmentSubjectTypeValidator } from "../validators/enrollment-validator";
import { verify } from "crypto";

class EnrollmentRoute {
  router = Router();
  controller = new EnrollmentController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {


    this.router.get("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getAllEnrollments));
    this.router.post("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateEnrollmentValidator, asyncHandler(this.controller.createEnrollment));

    this.router.get("/schedule", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAuthToken, asyncHandler(this.controller.getEnrollmentScheduleByStudentId));

    this.router.get("/subjects", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getAllEnrollmentSubjects));
    this.router.post("/subject", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateEnrollmentSubjectValidator, asyncHandler(this.controller.createEnrollmentSubject));

    this.router.post("/subjects", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAuthToken, enrollStudentSubjectsValidator, asyncHandler(this.controller.createStudentEnrollmentSubjectTypes));

    this.router.get("/:enrollmentId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getEnrollmentById));
    this.router.put("/:enrollmentId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateEnrollmentValidator, asyncHandler(this.controller.updateEnrollmentById));
    this.router.delete("/:enrollmentId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.deleteEnrollmentById));

    this.router.get("/subjects/enrolled", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAuthToken, asyncHandler(this.controller.getEnrolledSubjectsByStudentId));

    this.router.get("/subjects/:enrollmentSubjectId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getEnrollmentSubjectById));
    this.router.put("/subjects/:enrollmentSubjectId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateEnrollmentSubjectValidator, asyncHandler(this.controller.updateEnrollmentSubjectById));
    this.router.delete("/subjects/:enrollmentSubjectId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.deleteEnrollmentSubjectById));



    this.router.get("/subjects-type/:enrollmentSubjectId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getEnrollmentSubjectTypeByEnrollmentSubjectId));
    this.router.post("/subjects-type", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createEnrollmentSubjectTypeValidator, asyncHandler(this.controller.createEnrollmentSubjectType));
    this.router.put("/subjects-type/:enrollmentSubjectId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, updateEnrollmentSubjectTypeValidator, asyncHandler(this.controller.updateEnrollmentSubjectTypeByEnrollmentSubjectId));
    this.router.delete("/subjects-type/:enrollmentSubjectId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.deleteEnrollmentSubjectTypeByEnrollmentSubjectId));
  }
}

export default new EnrollmentRoute().router;
