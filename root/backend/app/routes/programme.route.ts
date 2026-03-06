import { Router } from "express";
import { asyncHandler, runValidatorIfAdmin } from "../utils/utils";
import ProgrammeController from "../controllers/programme.controller";
import { checkAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, verifyAuthTokenHeader, verifyStudentAuthToken } from "../middlewares/auth";
import { programmeParamValidator, programmeIntakeParamValidator, createAndUpdateProgrammeIntakeValidator, createAndUpdateProgrammeValidator, createStudentCourseProgrammeIntakeValidator, getProgrammesAndIntakesQueryValidator, getProgrammeHistoryQueryValidator, getAdminProgrammeHistoryQueryValidator} from "../validators/programme-validator";
import { courseParamValidator } from "../validators/course-validator";
import { studentParamValidator } from "../validators/user-validator";

class ProgrammeRoute {
  router = Router();
  controller = new ProgrammeController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, getProgrammesAndIntakesQueryValidator, asyncHandler(this.controller.getProgrammes));
    this.router.get("/intake", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, getProgrammesAndIntakesQueryValidator, asyncHandler(this.controller.getProgrammeIntakes));
    this.router.get("/history", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAdminAuthToken, verifyAuthToken, runValidatorIfAdmin(getAdminProgrammeHistoryQueryValidator), getProgrammeHistoryQueryValidator, asyncHandler(this.controller.getProgrammeHistory));
    this.router.get("/distribution", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getProgrammeDistribution));
    this.router.get("/intake/:programmeIntakeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, programmeIntakeParamValidator, asyncHandler(this.controller.getProgrammeIntakeById));
    this.router.get("/:programmeId/intake", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyStudentAuthToken, verifyAuthToken, programmeParamValidator, asyncHandler(this.controller.getProgrammeIntakesByProgrammeId));
    this.router.get("/:programmeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyStudentAuthToken, verifyAuthToken, programmeParamValidator, asyncHandler(this.controller.getProgrammeById));

    this.router.post("/", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateProgrammeValidator, asyncHandler(this.controller.createProgramme));
    this.router.post("/intake", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createAndUpdateProgrammeIntakeValidator, asyncHandler(this.controller.createProgrammeIntake));
    this.router.post("/enroll", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createStudentCourseProgrammeIntakeValidator, asyncHandler(this.controller.createStudentCourseProgrammeIntake));

    this.router.put("/:programmeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, programmeParamValidator, createAndUpdateProgrammeValidator, asyncHandler(this.controller.updateProgrammeById));

    this.router.patch("/intake/:programmeIntakeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, programmeIntakeParamValidator, createAndUpdateProgrammeIntakeValidator, asyncHandler(this.controller.updateProgrammeIntakeById));

    this.router.delete("/history/student/:studentId/course/:courseId/programme/intake/:programmeIntakeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, studentParamValidator, courseParamValidator, programmeIntakeParamValidator, asyncHandler(this.controller.deleteStudentCourseProgrammeIntake));
    this.router.delete("/intake/:programmeIntakeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, programmeIntakeParamValidator, asyncHandler(this.controller.deleteProgrammeIntakeById));
    this.router.delete("/:programmeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, programmeParamValidator, asyncHandler(this.controller.deleteProgrammeById));
  }
}

export default new ProgrammeRoute().router;
