import { Request, Response } from "express";
import { ENUM_ERROR_CODE, ENUM_PROGRAMME_STATUS, ENUM_USER_ROLE } from "../enums/enums";
import { Result } from "../../libs/Result";
import { StudentCourseProgrammeIntakeData, UserData, StudentInformation, StudentSemesterStartAndEndData, StudentClassData, StudentSubjectData, StudentSubjectOverviewData } from "../models/user-model";
import userService from "../services/user.service";
import courseService from "../services/course.service";
import programmeService from "../services/programme.service";
import { CourseData } from "../models/course-model";
import { ProgrammeIntakeData } from "../models/programme-model";
import { ResultSetHeader } from "mysql2";

export default class UserController {
  async getAllAdmins(req: Request, res: Response) {
    const page: number = parseInt(req.query.page as string) || 1;
    const pageSize: number = parseInt(req.query.pageSize as string) || 15;
    const query: string = req.query.query as string || "";

    const response: Result<UserData[]> = await userService.getAllAdmins(query, pageSize, page);
    const userCount: Result<number> = await userService.getUserCount(query, ENUM_USER_ROLE.ADMIN);
    if (response.isSuccess()) {
      return res.sendSuccess.ok({
        users: response.getData(),
        userCount: userCount.isSuccess() ? userCount.getData() : 0,
      }, response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getAllStudents(req: Request, res: Response) {
    const page: number = parseInt(req.query.page as string) || 1;
    const pageSize: number = parseInt(req.query.pageSize as string) || 15;
    const query: string = req.query.query as string;

    const response: Result<UserData[]> = await userService.getAllStudents(query, pageSize, page);
    const userCount: Result<number> = await userService.getUserCount(query, ENUM_USER_ROLE.STUDENT);

    if (response.isSuccess()) {
      return res.sendSuccess.ok({
        users: response.getData(),
        userCount: userCount.isSuccess() ? userCount.getData() : 0,
      }, response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getAdminById(req: Request, res: Response) {
    const adminId: number = parseInt(req.params.adminId);

    if (!adminId || isNaN(adminId)) {
      return res.sendError.badRequest("Invalid adminId");
    }

    const response: Result<UserData> = await userService.getAdminById(adminId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getStudentById(req: Request, res: Response) {
    const studentId: number = parseInt(req.params.studentId);

    if (!studentId || isNaN(studentId)) {
      return res.sendError.badRequest("Invalid studentId");
    }

    const response: Result<UserData> = await userService.getStudentById(studentId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async createStudent(req: Request, res: Response) {
    const firstName: string = req.body.firstName;
    const lastName: string = req.body.lastName;
    const phoneNumber: string = req.body.phoneNumber;
    const email: string = req.body.email;
    const password: string = req.body.password;
    const userStatus: number = req.body.userStatus;

    const isEmailDuplicated: Result<UserData> = await userService.getStudentByEmail(email);

    if (isEmailDuplicated.isSuccess()) {
      return res.sendError.conflict("Email already exist");
    }

    const response: Result<ResultSetHeader> = await userService.createStudent(firstName, lastName, email, phoneNumber, password, userStatus);

    if (response.isSuccess()) {
      return res.sendSuccess.create(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async updateStudentById(req: Request, res: Response) {
    const studentId: number = parseInt(req.params.studentId);
    const firstName: string = req.body.firstName;
    const lastName: string = req.body.lastName;
    const phoneNumber: string = req.body.phoneNumber;
    const email: string = req.body.email;
    const userStatus: number = req.body.userStatus;

    if (!studentId || isNaN(studentId)) {
      return res.sendError.badRequest("Invalid studentId");
    }

    /**
     * Check if the user is using the email before updating
     * If user is using the old email, doesn't needs to check if the email is duplicated
     */
    const isEmailBelongsToUser: Result<UserData> = await userService.getStudentByIdAndEmail(studentId, email);

    if (!isEmailBelongsToUser.isSuccess()) {
      const isEmailDuplicated: Result<UserData> = await userService.getStudentByEmail(email);

      if (isEmailDuplicated.isSuccess()) {
        return res.sendError.conflict("Email already exist");
      }
    }

    const userResponse: boolean = await userService.isUserExist(studentId);

    if (!userResponse) {
      return res.sendError.notFound("Invalid userId");
    }

    const response: Result<UserData | undefined> = await userService.updateStudentById(studentId, firstName, lastName, email, phoneNumber, userStatus);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async updateAdminById(req: Request, res: Response) {
    const adminId: number = parseInt(req.params.adminId);
    const firstName: string = req.body.firstName;
    const lastName: string = req.body.lastName;
    const phoneNumber: string = req.body.phoneNumber;
    const email: string = req.body.email;

    if (!adminId || isNaN(adminId)) {
      return res.sendError.badRequest("Invalid adminId");
    }

    const userResponse: boolean = await userService.isUserExist(adminId);

    if (!userResponse) {
      return res.sendError.notFound("Invalid userId");
    }

    const response: Result<UserData> = await userService.updateAdminById(adminId, firstName, lastName, email, phoneNumber);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async deleteUserById(req: Request, res: Response) {
    const userId: number = parseInt(req.params.userId);

    if (!userId || isNaN(userId)) {
      return res.sendError.badRequest("Invalid userId");
    }

    const userResponse: boolean = await userService.isUserExist(userId);

    if (!userResponse) {
      return res.sendError.notFound("Invalid userId");
    }

    const response: Result<null> = await userService.deleteUserById(userId);

    if (response.isSuccess()) {
      return res.sendSuccess.delete();
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async updateUserProfilePictureById(req: Request, res: Response) {
    const profilePictureUrl: string = req.body.profilePictureUrl;
    const userId: number = req.user.userId;

    const response: Result<UserData | undefined> = await userService.updateUserProfilePictureById(userId, profilePictureUrl);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getStudentsCount(req: Request, res: Response) {
    const response: Result<number> = await userService.getUserCount(undefined, ENUM_USER_ROLE.STUDENT);

    if (response.isSuccess()) {
      return res.sendSuccess.ok({
        studentsCount: response.getData() || 0
      }, response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getAllStudentCourseProgrammeIntakes(req: Request, res: Response) {
    const page: number = parseInt(req.query.page as string) || 1;
    const pageSize: number = parseInt(req.query.pageSize as string) || 15;
    const query: string = req.query.query as string;

    const response: Result<StudentCourseProgrammeIntakeData[]> = await userService.getAllStudentCourseProgrammeIntakes(query, pageSize, page);
    const userCount: Result<number> = await userService.getUserCount(query, ENUM_USER_ROLE.STUDENT);

    if (response.isSuccess()) {
      return res.sendSuccess.ok({
        users: response.getData(),
        userCount: userCount.isSuccess() ? userCount.getData() : 0,
      }, response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getStudentCourseProgrammeIntakeByStudentId(req: Request, res: Response) {
    const studentId: number = parseInt(req.params.studentId);

    if (!studentId || isNaN(studentId)) {
      return res.sendError.badRequest("Invalid studentId");
    }

    const response: Result<StudentCourseProgrammeIntakeData[]> = await userService.getStudentCourseProgrammeIntakeByStudentId(studentId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(
        response.getData().map((data) => {
          let statusLabel: string;
          switch (data.courseStatus) {
            case ENUM_PROGRAMME_STATUS.ACTIVE:
              statusLabel = "Active";
              break;
            case ENUM_PROGRAMME_STATUS.COMPLETED:
              statusLabel = "Completed";
              break;
            case ENUM_PROGRAMME_STATUS.FINISHED:
              statusLabel = "Finished";
              break;
            case ENUM_PROGRAMME_STATUS.DROPPED:
              statusLabel = "Dropped";
              break;
            default:
              statusLabel = "Unknown";
          }

          return {
            ...data,
            status: statusLabel,
          };
        }),
        response.getMessage()
      );
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async createStudentCourseProgrammeIntake(req: Request, res: Response) {
    const studentId: number = req.body.studentId;
    const courseId: number = req.body.courseId;
    const programmeIntakeId: number = req.body.programmeIntakeId;

    const studentResponse: Result<UserData> = await userService.getStudentById(studentId);
    const courseResponse: Result<CourseData> = await courseService.getCourseById(courseId);
    const programmeIntakeResponse: Result<ProgrammeIntakeData> = await programmeService.getProgrammeIntakeById(programmeIntakeId);

    if (!studentResponse.isSuccess() || !courseResponse.isSuccess() || !programmeIntakeResponse.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid studentId, or courseId, or programmeIntakeId");
    }

    const studentCourseProgrammeIntakeResponse: Result<StudentCourseProgrammeIntakeData> = await userService.getStudentCourseProgrammeIntakeByStudentIdAndCourseIdAndProgrammeIntakeId(studentId, courseId, programmeIntakeId);

    if (studentCourseProgrammeIntakeResponse.getData()) {
      return res.sendError.conflict("Active course exist");
    }

    const response: Result<StudentCourseProgrammeIntakeData[]> = await userService.createStudentCourseProgrammeIntake(studentId, courseId, programmeIntakeId);

    if (response.isSuccess()) {
      return res.sendSuccess.create(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async deleteStudentCourseProgrammeIntakeByStudentIdAndCourseIdAndProgrammeIntakeId(req: Request, res: Response) {
    const studentId: number = parseInt(req.params.studentId);
    const courseId: number = parseInt(req.params.courseId);
    const programmeIntakeId: number = parseInt(req.params.programmeIntakeId);

    if (!studentId || isNaN(studentId) || !courseId || isNaN(courseId) || !programmeIntakeId || isNaN(programmeIntakeId)) {
      return res.sendError.badRequest("Invalid studentId or courseId or programmeIntakeId");
    }

    const studentCourseProgrammeIntake: Result<StudentCourseProgrammeIntakeData[]> = await userService.getStudentCourseProgrammeIntakeByStudentId(studentId);

    if (!studentCourseProgrammeIntake.isSuccess()) {
      return res.sendError.notFound("Student course programme intake not found");
    }

    const response: Result<null> = await userService.deleteStudentCourseProgrammeIntakeByStudentIdAndCourseIdAndProgrammeIntakeId(studentId, courseId, programmeIntakeId);

    if (response.isSuccess()) {
      return res.sendSuccess.create(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getStudentInformationById(req: Request, res: Response) {
    const userId: number = req.user.userId as number;

    const response: Result<StudentInformation> = await userService.getStudentInformationById(userId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage())
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getStudentActiveSubjectsOverviewById(req: Request, res: Response) {
    const userId: number = req.user.userId

    const response: Result<StudentSubjectOverviewData[]> = await userService.getStudentActiveSubjectsOverviewById(userId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      throw new Error("user.controller.ts, getStudentActiveSubjectsById failed");
    }
  }

  async getStudentTimetableById(req: Request, res: Response) {
    const userId: number = req.user.userId

    const response: Result<StudentClassData[]> = await userService.getStudentTimetableById(userId);
    const studentSemesterStartAndEndDate: Result<StudentSemesterStartAndEndData | undefined> = await userService.getStudentSemesterStartAndEndDateById(userId);


    if (response.isSuccess() && studentSemesterStartAndEndDate.isSuccess()) {
      return res.sendSuccess.ok({
        semesterStartDate: studentSemesterStartAndEndDate.getData()?.semesterStartDate,
        semesterEndDate: studentSemesterStartAndEndDate.getData()?.semesterEndDate,
        timetable: response.getData()
      }, response.getMessage());
    } else {
      throw new Error("user.controller.ts, getStudentTimetableById failed");
    }
  }

  async getStudentSubjectsById(req: Request, res: Response) {
    const studentId: number = req.user.userId;
    const page: number = parseInt(req.query.page as string) || 1;
    const pageSize: number = parseInt(req.query.pageSize as string) || 15;
    const query: string = req.query.query as string || "";
    const semester: number = parseInt(req.query.semester as string) || 0;

    const response: Result<StudentSubjectData[]> = await userService.getStudentSubjectsById(studentId, semester, query, pageSize, page);
    const subjectCount: Result<number> = await userService.getStudentSubjectsCountById(studentId, semester, query);
    if (response.isSuccess()) {
      return res.sendSuccess.ok({
        subjects: response.getData(),
        subjectCount: subjectCount.isSuccess() ? subjectCount.getData() : 0,
      }, response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }
}
