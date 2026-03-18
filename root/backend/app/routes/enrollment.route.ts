import { Router } from "express";
import { asyncHandler, runValidatorIfAdmin } from "../utils/utils";
import EnrollmentController from "../controllers/enrollment.controller";
import { checkAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, verifyAuthTokenHeader, verifyStudentAuthToken } from "../middlewares/auth";
import { enrollmentParamValidator, createEnrollmentSubjectBodyValidator, updateEnrollmentSubjectBodyValidator, createEnrollmentBodyValidator, updateEnrollmentBodyValidator, enrollStudentSubjectsValidator, enrollmentSubjectParamValidator, getEnrollmentsAndSubjectsQueryValidator, getMonthlyEnrollmentCountQueryValidator} from "../validators/enrollment-validator";
import { studentParamValidator } from "../validators/user-validator";

class EnrollmentRoute {
  router = Router();
  controller = new EnrollmentController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {


    this.router.get("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, getEnrollmentsAndSubjectsQueryValidator, asyncHandler(this.controller.getEnrollments));
    this.router.get("/schedule", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAuthToken, asyncHandler(this.controller.getEnrollmentSchedule));
    this.router.get("/subjects", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAdminAuthToken, verifyAuthToken, runValidatorIfAdmin(getEnrollmentsAndSubjectsQueryValidator), asyncHandler(this.controller.getEnrollmentSubjects));
    this.router.get("/monthly-count", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, getMonthlyEnrollmentCountQueryValidator, asyncHandler(this.controller.getMonthlyEnrollmentCount));
    this.router.get("/subjects/enrolled", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAuthToken, asyncHandler(this.controller.getEnrolledSubjects));
    this.router.get("/subjects/:studentId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, studentParamValidator, asyncHandler(this.controller.getEnrollmentSubjectsByStudentId));
    this.router.get("/subject/:enrollmentSubjectId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, enrollmentSubjectParamValidator, asyncHandler(this.controller.getEnrollmentSubjectWithEnrollmentSubjectTypesById));
    this.router.get("/:enrollmentId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, enrollmentParamValidator, asyncHandler(this.controller.getEnrollmentWithProgrammeIntakesById));


    this.router.post("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createEnrollmentBodyValidator, asyncHandler(this.controller.createEnrollmentWithProgrammeIntakes));
    this.router.post("/subject", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createEnrollmentSubjectBodyValidator, asyncHandler(this.controller.createEnrollmentSubjectWithEnrollmentSubjectTypes));
    this.router.post("/subjects", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAuthToken, enrollStudentSubjectsValidator, asyncHandler(this.controller.createStudentEnrollmentSubjectTypes));
    this.router.post("/subject/:studentId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createEnrollmentSubjectBodyValidator, asyncHandler(this.controller.createEnrollmentSubjectWithEnrollmentSubjectTypes));
    this.router.post("/subjects/:studentId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAdminAuthToken, verifyAuthToken, studentParamValidator, enrollStudentSubjectsValidator, asyncHandler(this.controller.createStudentEnrollmentSubjectTypesByStudentId));


    this.router.put("/subject/:enrollmentSubjectId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, enrollmentSubjectParamValidator, updateEnrollmentSubjectBodyValidator, asyncHandler(this.controller.updateEnrollmentSubjectWithEnrollmentSubjectTypesById));
    this.router.put("/:enrollmentId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, enrollmentParamValidator, updateEnrollmentBodyValidator, asyncHandler(this.controller.updateEnrollmentWithProgrammeIntakesById));


    this.router.delete("/subject/:enrollmentSubjectId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, enrollmentSubjectParamValidator, asyncHandler(this.controller.deleteEnrollmentSubjectWithEnrollmentSubjectTypesById));
    this.router.delete("/:enrollmentId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, enrollmentParamValidator, asyncHandler(this.controller.deleteEnrollmentById));



  }
}

export default new EnrollmentRoute().router;
