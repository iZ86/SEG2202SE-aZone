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
    this.router.get("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getProgrammes));
    this.router.get("/intake", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getProgrammeIntakes));
    this.router.get("/history", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getProgrammeHistory))
    this.router.get("/intake/:programmeIntakeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getProgrammeIntakeById));
    this.router.get("/:programmeId/intake", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyStudentAuthToken, verifyAuthToken, asyncHandler(this.controller.getProgrammeIntakesByProgrammeId));
    this.router.get("/:programmeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyStudentAuthToken, verifyAuthToken, asyncHandler(this.controller.getProgrammeById));

    this.router.post("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateProgrammeValidator, asyncHandler(this.controller.createProgramme));
    this.router.post("/intake", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateProgrammeIntakeValidator, asyncHandler(this.controller.createProgrammeIntake));

    this.router.put("/:programmeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateProgrammeValidator, asyncHandler(this.controller.updateProgrammeById));

    this.router.patch("/intake/:programmeIntakeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateProgrammeIntakeValidator, asyncHandler(this.controller.updateProgrammeIntakeById));

    this.router.delete("/intake/:programmeIntakeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.deleteProgrammeIntakeById));
    this.router.delete("/:programmeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.deleteProgrammeById));
  }
}

export default new ProgrammeRoute().router;
