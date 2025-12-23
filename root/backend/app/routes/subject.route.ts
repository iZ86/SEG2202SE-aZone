import { Router } from "express";
import { asyncHandler } from "../utils/utils";
import SubjectController from "../controllers/subject.controller";
import { checkAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, verifyAuthTokenHeader, verifyStudentAuthToken } from "../middlewares/auth";
import { createAndUpdateSubjectValidator } from "../validators/subject-validator";

class SubjectRoute {
  router = Router();
  controller = new SubjectController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getSubjects));
    this.router.get("/count", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getSubjectsCount));
    this.router.get("/:subjectId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getSubjectById));

    this.router.post("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateSubjectValidator, asyncHandler(this.controller.createSubject));

    this.router.put("/:subjectId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateSubjectValidator, asyncHandler(this.controller.updateSubjectById));

    this.router.delete("/:subjectId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.deleteSubjectById));

  }
}

export default new SubjectRoute().router;
