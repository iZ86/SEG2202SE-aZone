import { Request, Response } from "express";
import { ENUM_ERROR_CODE, ENUM_USER_ROLE } from "../enums/enums";
import { Result } from "../../libs/Result";
import { UserData, StudentInformation, UserWithCountData, StudentTimeTable, NoProgrammeIntakeStudentTimeTable } from "../models/user-model";
import userService from "../services/user.service";

export default class UserController {
  async getAdmins(req: Request, res: Response) {
    const page: number = Number(req.query.page) || 1;
    const pageSize: number = Number(req.query.pageSize) || 15;
    const query: string = req.query.query as string || "";

    const response: Result<UserWithCountData> = await userService.getAdmins(query, pageSize, page);
    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
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
    const query: string = req.query.query as string || "";

    const response: Result<UserWithCountData> = await userService.getStudents(query, pageSize, page);

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
    const userStatusId: number = req.body.userStatusId;

    const response: Result<UserData> = await userService.createStudent(firstName, lastName, email, phoneNumber, password, userStatusId);

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
    const userStatusId: number = req.body.userStatusId;

    const response: Result<UserData> = await userService.updateStudentById(studentId, firstName, lastName, email, phoneNumber, userStatusId);

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

  async updateUserProfilePicture(req: Request, res: Response) {
    const profilePictureUrl: string = req.body.profilePictureUrl;
    const userId: number = req.user.userId;

    const response: Result<UserData> = await userService.updateUserProfilePictureById(userId, profilePictureUrl);

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
        studentsCount: response.getData()
      }, response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getStudentInformation(req: Request, res: Response) {
    const userId: number = req.user.userId;

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

  async getStudentTimetable(req: Request, res: Response) {
    const userId: number = req.user.userId;

    const response: Result<StudentTimeTable | NoProgrammeIntakeStudentTimeTable> = await userService.getStudentTimetableById(userId);


    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getStudentTimetableByStudentId(req: Request, res: Response) {
    const studentId: number = Number(req.params.studentId);

    const response: Result<StudentTimeTable | NoProgrammeIntakeStudentTimeTable> = await userService.getStudentTimetableById(studentId);


    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }
}
