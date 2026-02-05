import { Router } from "express";
import { asyncHandler } from "../utils/utils";
import LecturerController from "../controllers/lecturer.controller";
import { checkAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, verifyAuthTokenHeader } from "../middlewares/auth";
import { createAndUpdateLecturerValidator, lecturerParamValidator, lecturerTitleParamValidator } from "../validators/lecturer-validator";

class LecturerRoute {
  router = Router();
  controller = new LecturerController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getLecturers));
    this.router.get("/titles", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getLecturerTitles));
    this.router.get("/titles/:lecturerTitleId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, lecturerTitleParamValidator, asyncHandler(this.controller.getLecturerTitleById));
    this.router.get("/:lecturerId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, lecturerParamValidator, asyncHandler(this.controller.getLecturerById));

    this.router.post("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateLecturerValidator, asyncHandler(this.controller.createLecturer));

    this.router.put("/:lecturerId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, lecturerParamValidator, createAndUpdateLecturerValidator, asyncHandler(this.controller.updateLecturerById));

    this.router.delete("/:lecturerId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, lecturerParamValidator, asyncHandler(this.controller.deleteLecturerById));
  }
}

export default new LecturerRoute().router;
