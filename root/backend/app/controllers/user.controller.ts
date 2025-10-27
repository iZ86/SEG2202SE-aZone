import { Request, Response } from "express";
import { ENUM_ERROR_CODE, ENUM_USER_ROLE } from "../enums/enums";
import { Result } from "../../libs/Result";
import { StudentCourseProgrammeIntakeData, UserData } from "../models/user-model";
import UserService from "../services/user.service";
import CourseService from "../services/course.service";
import ProgrammeService from "../services/programme.service";
import { CourseData } from "../models/course-model";
import { ProgrammeIntakeData } from "../models/programme-model";

export default class UserController {
  async getAllAdmins(req: Request, res: Response) {
    const page: number = parseInt(req.query.page as string) || 1;
    const pageSize: number = parseInt(req.query.pageSize as string) || 15;
    const query: string = req.query.query as string || "";

    const response: Result<UserData[]> = await UserService.getAllAdmins(query, pageSize, page);
    const userCount: Result<number> = await UserService.getUserCount(query, ENUM_USER_ROLE.ADMIN);
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

    const response: Result<UserData[]> = await UserService.getAllStudents(query, pageSize, page);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
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

    const response: Result<UserData> = await UserService.getAdminById(adminId);

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

    const response: Result<UserData> = await UserService.getStudentById(studentId);

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
    const status: boolean = req.body.status;
    const programmeId: number = req.body.programmeId;
    const courseId: number = req.body.courseId;
    const programmeIntakeId: number = req.body.programmeIntakeId;
    const courseStatus: number = req.body.courseStatus;

    const response: Result<StudentCourseProgrammeIntakeData> = await UserService.createStudent(firstName, lastName, email, phoneNumber, password, status, programmeId, courseId, programmeIntakeId, courseStatus);

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
    const programmeId: number = req.body.programmeId;
    const courseId: number = req.body.courseId;
    const programmeIntakeId: number = req.body.programmeIntakeId;
    const courseStatus: number = req.body.courseStatus;

    if (!studentId || isNaN(studentId)) {
      return res.sendError.badRequest("Invalid studentId");
    }

    const userResponse: boolean = await UserService.isUserExist(studentId);

    if (!userResponse) {
      return res.sendError.notFound("Invalid userId");
    }

    const response: Result<StudentCourseProgrammeIntakeData> = await UserService.updateStudentById(studentId, firstName, lastName, email, phoneNumber, userStatus, programmeId, courseId, programmeIntakeId, courseStatus);

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

    const userResponse: boolean = await UserService.isUserExist(adminId);

    if (!userResponse) {
      return res.sendError.notFound("Invalid userId");
    }

    const response: Result<UserData> = await UserService.updateAdminById(adminId, firstName, lastName, email, phoneNumber);

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

    const userResponse: boolean = await UserService.isUserExist(userId);

    if (!userResponse) {
      return res.sendError.notFound("Invalid userId");
    }

    const response: Result<null> = await UserService.deleteUserById(userId);

    if (response.isSuccess()) {
      return res.sendSuccess.delete(response.getMessage());
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

    const response: Result<StudentCourseProgrammeIntakeData[]> = await UserService.getAllStudentCourseProgrammeIntakes(query, pageSize, page);
    const userCount: Result<number> = await UserService.getUserCount(query, ENUM_USER_ROLE.STUDENT);

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

    const response: Result<StudentCourseProgrammeIntakeData> = await UserService.getStudentCourseProgrammeIntakeByStudentId(studentId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
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
    const status: number = req.body.status;

    const studentResponse: Result<UserData> = await UserService.getStudentById(studentId);
    const courseResponse: Result<CourseData> = await CourseService.getCourseById(courseId);
    const programmeIntakeResponse: Result<ProgrammeIntakeData> = await ProgrammeService.getProgrammeIntakeById(programmeIntakeId);

    if (!studentResponse.isSuccess() || !courseResponse.isSuccess() || !programmeIntakeResponse.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid studentId, or courseId, or programmeIntakeId");
    }

    const response: Result<StudentCourseProgrammeIntakeData> = await UserService.createStudentCourseProgrammeIntake(studentId, courseId, programmeIntakeId, status);

    if (response.isSuccess()) {
      return res.sendSuccess.create(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async updateStudentCourseProgrammeIntakeByStudentId(req: Request, res: Response) {
    const studentId: number = parseInt(req.params.studentId);
    const courseId: number = req.body.courseId;
    const programmeIntakeId: number = req.body.programmeIntakeId;
    const status: number = req.body.status;

    if (!studentId || isNaN(studentId)) {
      return res.sendError.badRequest("Invalid studentId");
    }

    const studentResponse: Result<UserData> = await UserService.getStudentById(studentId);
    const courseResponse: Result<CourseData> = await CourseService.getCourseById(courseId);
    const programmeIntakeResponse: Result<ProgrammeIntakeData> = await ProgrammeService.getProgrammeIntakeById(programmeIntakeId);

    if (!studentResponse.isSuccess() || !courseResponse.isSuccess() || !programmeIntakeResponse.isSuccess()) {
      return res.sendError.notFound("Invalid studentId, or courseId, or programmeIntakeId");
    }

    const response: Result<StudentCourseProgrammeIntakeData> = await UserService.updateStudentCourseProgrammeIntakeByStudentId(studentId, courseId, programmeIntakeId, status);

    if (response.isSuccess()) {
      return res.sendSuccess.create(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async deleteStudentCourseProgrammeIntakeByStudentIdAndStatus(req: Request, res: Response) {
    const studentId: number = parseInt(req.params.studentId);
    const status: number = parseInt(req.params.status);

    if (!studentId || isNaN(studentId) || !status || !isNaN(status)) {
      return res.sendError.badRequest("Invalid studentId or status");
    }

    const studentCourseProgrammeIntake: Result<StudentCourseProgrammeIntakeData> = await UserService.getStudentCourseProgrammeIntakeByStudentId(studentId);

    if (!studentCourseProgrammeIntake.isSuccess()) {
      return res.sendError.notFound("Student course programme intake not found");
    }

    const response: Result<null> = await UserService.deleteStudentCourseProgrammeIntakeByStudentIdAndStatus(studentId, status);

    if (response.isSuccess()) {
      return res.sendSuccess.create(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }
}
