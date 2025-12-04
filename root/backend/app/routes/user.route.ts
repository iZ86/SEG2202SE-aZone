import { Router } from "express";
import { asyncHandler } from "../utils/utils";
import UserController from "../controllers/user.controller";
import { checkAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, verifyAuthTokenHeader, verifyStudentAuthToken } from "../middlewares/auth";
import { createStudentCourseProgrammeIntakeValidator, createStudentValidator, updateAdminValidator, updateStudentValidator, updateUserProfilePictureValidator } from "../validators/user-validator";

class UserRoute {
  router = Router();
  controller = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get("/students/count", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getStudentsCount));
    this.router.get("/students/subjects", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyStudentAuthToken, verifyAuthToken, asyncHandler(this.controller.getStudentSubjectsById));
    this.router.delete("/students/:studentId/course/:courseId/programme/intake/:programmeIntakeId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.deleteStudentCourseProgrammeIntakeByStudentIdAndCourseIdAndProgrammeIntakeId));
    // this.router.put("/students/course/programme/intake/:studentId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, updateStudentCourseProgrammeIntakeValidator, asyncHandler(this.controller.updateStudentCourseProgrammeIntakeById));

    /** This route differs from getMe in auth.routes.ts by getting information of the user that is not personal. */
    this.router.get("/students/information", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAuthToken, asyncHandler(this.controller.getStudentInformationById));
    this.router.get("/students/enrollment/schedule", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAuthToken, asyncHandler(this.controller.getStudentEnrollmentScheduleById));
    this.router.get("/students/subjects/active", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAuthToken, asyncHandler(this.controller.getStudentActiveSubjectsOverviewById));
    this.router.get("/students/timetable", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAuthToken, asyncHandler(this.controller.getStudentTimetableById));
    this.router.get("/students/:studentId/course/programme/intake", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyStudentAuthToken, verifyAuthToken, asyncHandler(this.controller.getStudentCourseProgrammeIntakeByStudentId));
    this.router.get("/students/course/programme/intake", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getAllStudentCourseProgrammeIntakes));
    this.router.post("/students/course/programme/intake", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createStudentCourseProgrammeIntakeValidator, asyncHandler(this.controller.createStudentCourseProgrammeIntake));
    this.router.get("/students/:studentId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyStudentAuthToken, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getStudentById));
    this.router.get("/admins/:adminId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getAdminById));
    this.router.get("/students", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getAllStudents));
    this.router.post("/students", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, createStudentValidator, asyncHandler(this.controller.createStudent));
    this.router.get("/admins", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.getAllAdmins));
    this.router.patch("/admins/:adminId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, updateAdminValidator, asyncHandler(this.controller.updateAdminById));
    this.router.put("/students/:studentId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, updateStudentValidator, asyncHandler(this.controller.updateStudentById));
    this.router.patch("/profile-picture", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyStudentAuthToken, verifyAuthToken, updateUserProfilePictureValidator, asyncHandler(this.controller.updateUserProfilePictureById));
    this.router.delete("/:userId", checkAuthTokenHeader, verifyAuthTokenHeader, verifyAdminAuthToken, verifyAuthToken, asyncHandler(this.controller.deleteUserById));
  }
}

export default new UserRoute().router;
