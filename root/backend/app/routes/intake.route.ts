import { Router } from "express";
import { asyncHandler } from "../utils/utils";
import IntakeController from "../controllers/intake.controller";
import { checkAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, verifyAuthTokenHeader } from "../middlewares/auth";
import { createIntakeBodyValidator, updateIntakeBodyValidator, intakeParamValidator, getIntakesQueryValidator} from "../validators/intake-validator";

class IntakeRoute {
  router = Router();
  controller = new IntakeController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, getIntakesQueryValidator, asyncHandler(this.controller.getIntakes));
    this.router.get("/:intakeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, intakeParamValidator, asyncHandler(this.controller.getIntakeById));

    this.router.post("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createIntakeBodyValidator, asyncHandler(this.controller.createIntake));

    this.router.put("/:intakeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, intakeParamValidator, updateIntakeBodyValidator, asyncHandler(this.controller.updateIntakeById));

    this.router.delete("/:intakeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, intakeParamValidator, asyncHandler(this.controller.deleteIntakeById));
  }
}

export default new IntakeRoute().router;
