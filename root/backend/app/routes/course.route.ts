import { Router } from "express";
import { asyncHandler } from "../utils/utils";
import CourseController from "../controllers/course.controller";
import { checkAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, verifyAuthTokenHeader, verifyStudentAuthToken } from "../middlewares/auth";
import { createAndUpdateCourseBodyValidator, createCourseSubjectBodyValidator } from "../validators/course-validator";

class CourseRoute {
  router = Router();
  controller = new CourseController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get("/programme/:programmeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getCoursesByProgrammeId));
    this.router.post("/subject", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createCourseSubjectBodyValidator, asyncHandler(this.controller.createCourseSubject));
    this.router.get("/:courseId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getCourseById));
    this.router.put("/:courseId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateCourseBodyValidator, asyncHandler(this.controller.updateCourseById));
    this.router.delete("/:courseId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.deleteCourseById));
    this.router.get("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getAllCourses));
    this.router.post("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateCourseBodyValidator, asyncHandler(this.controller.createCourse));
  }
}

export default new CourseRoute().router;
