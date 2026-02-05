import { Router } from "express";
import { asyncHandler } from "../utils/utils";
import IntakeController from "../controllers/intake.controller";
import { checkAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, verifyAuthTokenHeader, verifyStudentAuthToken } from "../middlewares/auth";
import { createAndUpdateIntakeValidator, intakeParamValidator } from "../validators/intake-validator";

class IntakeRoute {
  router = Router();
  controller = new IntakeController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getIntakes));
    this.router.get("/:intakeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, intakeParamValidator, asyncHandler(this.controller.getIntakeById));

    this.router.put("/:intakeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, intakeParamValidator, createAndUpdateIntakeValidator, asyncHandler(this.controller.updateIntakeById));

    this.router.post("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateIntakeValidator, asyncHandler(this.controller.createIntake));

    this.router.delete("/:intakeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, intakeParamValidator, asyncHandler(this.controller.deleteIntakeById));
  }
}

export default new IntakeRoute().router;
