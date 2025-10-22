import { Router } from "express";
import { asyncHandler } from "../utils/utils";
import ProgrammeController from "../controllers/programme.controller";
import { checkAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, verifyAuthTokenHeader, verifyStudentAuthToken } from "../middlewares/auth";
import { createAndUpdateProgrammeIntakeValidator, createAndUpdateProgrammeValidator } from "../validators/programme-validator";

class ProgrammeRoute {
  router = Router();
  controller = new ProgrammeController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.delete("/intake/:programmeIntakeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.deleteProgrammeIntakeById));
    this.router.put("/intake/:programmeIntakeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateProgrammeIntakeValidator, asyncHandler(this.controller.updateProgrammeIntakeById));
    this.router.get("/intake/:programmeIntakeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getProgrammeIntakeById));
    this.router.get("/intake", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getAllProgrammeIntakes));
    this.router.post("/intake", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateProgrammeIntakeValidator, asyncHandler(this.controller.createProgrammeIntake));
    this.router.get("/:programmeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyStudentAuthToken, verifyAuthToken, asyncHandler(this.controller.getProgrammeById));
    this.router.put("/:programmeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateProgrammeValidator, asyncHandler(this.controller.updateProgrammeById));
    this.router.delete("/:programmeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.deleteProgrammeById));
    this.router.get("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getAllProgrammes));
    this.router.post("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateProgrammeValidator, asyncHandler(this.controller.createProgramme));
  }
}

export default new ProgrammeRoute().router;
