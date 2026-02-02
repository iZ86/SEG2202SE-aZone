import { Router } from "express";
import { asyncHandler } from "../utils/utils";
import CourseController from "../controllers/course.controller";
import { checkAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, verifyAuthTokenHeader } from "../middlewares/auth";
import { createCourseSubjectValidator, createCourseValidator } from "../validators/course-validator";

class CourseRoute {
  router = Router();
  controller = new CourseController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {

    this.router.get("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getCourses));
    this.router.get("/count", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getCoursesCount));
    this.router.get("/:courseId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getCourseById));

    this.router.post("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createCourseValidator, asyncHandler(this.controller.createCourse));
    this.router.post("/subject", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createCourseSubjectValidator, asyncHandler(this.controller.createCourseSubject));

    this.router.put("/:courseId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.updateCourseById));

    this.router.delete("/:courseId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.deleteCourseById));
  }
}

export default new CourseRoute().router;
