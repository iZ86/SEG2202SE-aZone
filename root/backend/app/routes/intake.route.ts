import { Router } from "express";
import { asyncHandler } from "../utils/utils";
import IntakeController from "../controllers/intake.controller";
import { checkAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, verifyAuthTokenHeader, verifyStudentAuthToken } from "../middlewares/auth";
import { createAndUpdateIntakeValidator } from "../validators/intake-validator";

class CourseRoute {
  router = Router();
  controller = new IntakeController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get("/:intakeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getIntakeById));
    this.router.put("/:intakeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateIntakeValidator, asyncHandler(this.controller.updateIntakeById));
    this.router.delete("/:intakeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.deleteIntakeById));
    this.router.get("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getAllIntakes));
    this.router.post("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateIntakeValidator, asyncHandler(this.controller.createIntake));
  }
}

export default new CourseRoute().router;
