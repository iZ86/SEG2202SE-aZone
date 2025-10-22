import { Request, Response } from "express";
import UserService from "../services/user.service";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { Result } from "../../libs/Result";
import { UserData } from "../models/user-model";

export default class UserController {
  async getAllAdmins(req: Request, res: Response) {
    const page: number = parseInt(req.query.page as string) || 1;
    const pageSize: number = parseInt(req.query.pageSize as string) || 15;
    const query: string = req.query.query as string || "";

    const response: Result<UserData[]> = await UserService.getAdmins(query, pageSize, page);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
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

    const response: Result<UserData[]> = await UserService.getStudents(query, pageSize, page);

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
    const userId: number = parseInt(req.params.userId);

    const response: Result<UserData> = await UserService.getAdminById(userId);

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
    const userId: number = parseInt(req.params.userId);

    const response: Result<UserData> = await UserService.getStudentById(userId);

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

    const response = await UserService.createStudent(firstName, lastName, email, phoneNumber, password, status);

    if (response.isSuccess()) {
      return res.sendSuccess.create(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async updateUserById(req: Request, res: Response) {
    const userId: number = parseInt(req.params.userId);
    const firstName: string = req.body.firstName;
    const lastName: string = req.body.lastName;
    const phoneNumber: string = req.body.phoneNumber;
    const email: string = req.body.email;
    const status: boolean = req.body.status;

    const response = await UserService.updateUserDetailsById(firstName, lastName, phoneNumber, email, status, userId);

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

    const response = await UserService.deleteUserById(userId);

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
    const status: number = parseInt(req.query.status as string) || 1;

    const response: Result<StudentCourseProgrammeIntakeData[]> = await UserService.getStudentCourseProgrammeIntakes(query, pageSize, page, status);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getStudentCourseProgrammeIntakeByStudentId(req: Request, res: Response) {
    const studentId: number = parseInt(req.params.studentId);

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

  async updateStudentCourseProgrammeIntake(req: Request, res: Response) {
    const studentId: number = parseInt(req.params.studentId);
    const courseId: number = req.body.courseId;
    const programmeIntakeId: number = req.body.programmeIntakeId;
    const status: number = req.body.status;

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
