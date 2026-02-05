import { Request, Response } from "express";
import { ENUM_ERROR_CODE, ENUM_USER_ROLE } from "../enums/enums";
import { Result } from "../../libs/Result";
import { UserData, StudentInformation, StudentSemesterStartAndEndData, StudentClassData } from "../models/user-model";
import userService from "../services/user.service";

export default class UserController {
  async getAdmins(req: Request, res: Response) {
    const page: number = Number(req.query.page as string) || 1;
    const pageSize: number = Number(req.query.pageSize as string) || 15;
    const query: string = req.query.query as string || "";

    const response: Result<UserData[]> = await userService.getAdmins(query, pageSize, page);
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

  async getStudents(req: Request, res: Response) {
    const page: number = Number(req.query.page as string) || 1;
    const pageSize: number = Number(req.query.pageSize as string) || 15;
    const query: string = req.query.query as string;

    const response: Result<UserData[]> = await userService.getStudents(query, pageSize, page);
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
    const adminId: number = Number(req.params.adminId);

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
    const studentId: number = Number(req.params.studentId);

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

    const response: Result<UserData> = await userService.createStudent(firstName, lastName, email, phoneNumber, password, userStatus);

    if (response.isSuccess()) {
      return res.sendSuccess.create(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
        case ENUM_ERROR_CODE.CONFLICT:
          return res.sendError.conflict(response.getMessage());
      }
    }
  }

  async updateStudentById(req: Request, res: Response) {
    const studentId: number = Number(req.params.studentId);
    const firstName: string = req.body.firstName;
    const lastName: string = req.body.lastName;
    const phoneNumber: string = req.body.phoneNumber;
    const email: string = req.body.email;
    const userStatus: number = req.body.userStatus;

    const response: Result<UserData | undefined> = await userService.updateStudentById(studentId, firstName, lastName, email, phoneNumber, userStatus);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
        case ENUM_ERROR_CODE.CONFLICT:
          return res.sendError.conflict(response.getMessage());
      }
    }
  }

  async updateAdminById(req: Request, res: Response) {
    const adminId: number = Number(req.params.adminId);
    const firstName: string = req.body.firstName;
    const lastName: string = req.body.lastName;
    const phoneNumber: string = req.body.phoneNumber;
    const email: string = req.body.email;

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

  async getStudentInformationById(req: Request, res: Response) {
    const userId: number = req.user.userId as number;

    const response: Result<StudentInformation> = await userService.getStudentInformationById(userId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getStudentTimetableById(req: Request, res: Response) {
    const userId: number = req.user.userId;

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

  async getStudentTimetableByStudentId(req: Request, res: Response) {
    const studentId: number = Number(req.params.studentId as string);

    const response: Result<StudentClassData[]> = await userService.getStudentTimetableById(studentId);
    const studentSemesterStartAndEndDate: Result<StudentSemesterStartAndEndData | undefined> = await userService.getStudentSemesterStartAndEndDateById(studentId);


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
}
