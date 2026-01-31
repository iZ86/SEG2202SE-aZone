import { Router } from "express";
import { asyncHandler } from "../utils/utils";
import EnrollmentController from "../controllers/enrollment.controller";
import { checkAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, verifyAuthTokenHeader, verifyStudentAuthToken } from "../middlewares/auth";
import { createAndUpdateEnrollmentSubjectValidator, updateEnrollmentSubjectValidator, createAndUpdateEnrollmentValidator, enrollStudentSubjectsValidator } from "../validators/enrollment-validator";

class EnrollmentRoute {
  router = Router();
  controller = new EnrollmentController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {


    this.router.get("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getEnrollments));
    this.router.get("/schedule", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAuthToken, asyncHandler(this.controller.getEnrollmentScheduleByStudentId));
    this.router.get("/subjects", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getEnrollmentSubjects));
    this.router.get("/monthly-count", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getMonthlyEnrollmentCount));
    this.router.get("/subjects/enrolled", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAuthToken, asyncHandler(this.controller.getEnrolledSubjectsByStudentId));
    this.router.get("/subjects/:studentId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getEnrollmentSubjectsByStudentId));
    this.router.get("/subject/:enrollmentSubjectId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getEnrollmentSubjectById));
    this.router.get("/subjects-type/:enrollmentSubjectId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getEnrollmentSubjectTypeByEnrollmentSubjectId));
    this.router.get("/:enrollmentId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getEnrollmentById));


    this.router.post("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateEnrollmentValidator, asyncHandler(this.controller.createEnrollment));
    this.router.post("/subject", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateEnrollmentSubjectValidator, asyncHandler(this.controller.createEnrollmentSubject));
    this.router.post("/subjects", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAdminAuthToken, verifyAuthToken, enrollStudentSubjectsValidator, asyncHandler(this.controller.createStudentEnrollmentSubjectTypes));
    this.router.post("/subject/:studentId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateEnrollmentSubjectValidator, asyncHandler(this.controller.createEnrollmentSubject));
    this.router.post("/subjects/:studentId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAdminAuthToken, verifyAuthToken, enrollStudentSubjectsValidator, asyncHandler(this.controller.createStudentEnrollmentSubjectTypesByStudentId));


    this.router.put("/subject/:enrollmentSubjectId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, updateEnrollmentSubjectValidator, asyncHandler(this.controller.updateEnrollmentSubjectById));
    this.router.put("/:enrollmentId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateEnrollmentValidator, asyncHandler(this.controller.updateEnrollmentById));


    this.router.delete("/subject/:enrollmentSubjectId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.deleteEnrollmentSubjectById));
    this.router.delete("/:enrollmentId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.deleteEnrollmentById));



  }
}

export default new EnrollmentRoute().router;
