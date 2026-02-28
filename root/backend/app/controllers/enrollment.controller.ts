import { Request, Response } from "express";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { Result } from "../../libs/Result";
import { EnrollmentData, EnrollmentSubjectData, StudentEnrollmentSchedule, MonthlyEnrollmentData, CreateEnrollmentSubjectTypeData, EnrollmentSubjectWithTypesData, EnrollmentWithProgrammeIntakesData, UpdateEnrollmentSubjectTypeData, StudentEnrollmentScheduleWithSubjectData} from "../models/enrollment-model";
import enrollmentService from "../services/enrollment.service";
import userService from "../services/user.service";
import { UserData } from "../models/user-model";

export default class EnrollmentController {
  async getEnrollments(req: Request, res: Response) {
    const page: number | null = parseInt(req.query.page as string) || null;
    const pageSize: number | null = parseInt(req.query.pageSize as string) || null;
    const query: string = req.query.query as string || "";

    const response: Result<EnrollmentData[]> = await enrollmentService.getEnrollments(query, pageSize, page);
    const enrollmentCount: Result<number> = await enrollmentService.getEnrollmentCount(query);

    let apiResponse: object = {
      enrollments: response.getData(),
    };

    if (page != null && pageSize != null) {
      apiResponse = {
        enrollments: response.getData(),
        enrollmentCount: enrollmentCount.isSuccess() ? enrollmentCount.getData() : 0,
      };
    }

    if (response.isSuccess()) {
      return res.sendSuccess.ok(apiResponse, response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getEnrollmentWithProgrammeIntakesById(req: Request, res: Response) {
    const enrollmentId: number = parseInt(req.params.enrollmentId as string);

    if (!enrollmentId || isNaN(enrollmentId)) {
      return res.sendError.badRequest("Invalid enrollmentId");
    }

    const response: Result<EnrollmentWithProgrammeIntakesData> = await enrollmentService.getEnrollmentWithProgrammeIntakesById(enrollmentId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async createEnrollmentWithProgrammeIntakes(req: Request, res: Response) {
    const enrollmentStartDateTime: Date = req.body.enrollmentStartDateTime;
    const enrollmentEndDateTime: Date = req.body.enrollmentEndDateTime;
    // Optional
    const programmeIntakeIds: number[] = req.body.programmeIntakeIds || [];

    const response: Result<EnrollmentWithProgrammeIntakesData> = await enrollmentService.createEnrollmentWithProgrammeIntakes(enrollmentStartDateTime, enrollmentEndDateTime, programmeIntakeIds);

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

  async updateEnrollmentById(req: Request, res: Response) {
    const enrollmentId: number = Number(req.params.enrollmentId);
    const enrollmentStartDateTime: Date = req.body.enrollmentStartDateTime;
    const enrollmentEndDateTime: Date = req.body.enrollmentEndDateTime;
    // Optional
    const programmeIntakeIds: number[] = req.body.programmeIntakeIds || [];


    const response: Result<EnrollmentWithProgrammeIntakesData> = await enrollmentService.updateEnrollmentWithProgrammeIntakesById(enrollmentId, enrollmentStartDateTime, enrollmentEndDateTime, programmeIntakeIds);


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

  async deleteEnrollmentById(req: Request, res: Response) {
    const enrollmentId: number = Number(req.params.enrollmentId);


    const response = await enrollmentService.deleteEnrollmentById(enrollmentId);

    if (response.isSuccess()) {
      return res.sendSuccess.delete();
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
        case ENUM_ERROR_CODE.CONFLICT:
          return res.sendError.conflict(response.getMessage());
      }
    }
  }

  async getEnrollmentSubjects(req: Request, res: Response) {

    const userId: number = req.user.userId as number;
    const isStudent: boolean = req.user.isStudent as boolean;
    const isAdmin: boolean = req.user.isAdmin as boolean;

    if (isStudent) {
      const response: Result<StudentEnrollmentScheduleWithSubjectData> = await enrollmentService.getEnrollmentSubjectsByStudentId(userId);
      if (response.isSuccess()) {
        return res.sendSuccess.ok(response.getData(), response.getMessage());
      } else {
        switch (response.getErrorCode()) {
          case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
            return res.sendError.notFound(response.getMessage());
        }
      }

    } else if (isAdmin) {
      const page: number | null = parseInt(req.query.page as string) || null;
      const pageSize: number | null = parseInt(req.query.pageSize as string) || null;
      const query: string = req.query.query as string || "";

      const response: Result<EnrollmentSubjectData[]> = await enrollmentService.getEnrollmentSubjects(query, pageSize, page);
      const enrollmentSubjectCount: Result<number> = await enrollmentService.getEnrollmentSubjectCount(query);

      let apiResponse: object = {
        enrollmentSubjects: response.getData(),
      };

      if (page != null && pageSize != null) {
        apiResponse = {
          enrollmentSubjects: response.getData(),
          enrollmentSubjectCount: enrollmentSubjectCount.isSuccess() ? enrollmentSubjectCount.getData() : 0,
        };
      }

      if (response.isSuccess()) {
        return res.sendSuccess.ok(apiResponse, response.getMessage());
      } else {
        switch (response.getErrorCode()) {
          case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
            return res.sendError.notFound(response.getMessage());
        }
      }
    } else {
      throw new Error("getEnrollmentSubjects in enrollment.controller.ts, user is neither student nor admin");
    }
  }

  async getEnrollmentSubjectsByStudentId(req: Request, res: Response) {
    const studentId: number = parseInt(req.params.studentId as string);

    const response: Result<StudentEnrollmentScheduleWithSubjectData> = await enrollmentService.getEnrollmentSubjectsByStudentId(studentId);
    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getEnrollmentSubjectWithEnrollmentSubjectTypesById(req: Request, res: Response) {
    const enrollmentSubjectId: number = Number(req.params.enrollmentSubjectId);

    if (!enrollmentSubjectId || isNaN(enrollmentSubjectId)) {
      return res.sendError.badRequest("Invalid enrollmentSubjectId");
    }

    const response: Result<EnrollmentSubjectWithTypesData> = await enrollmentService.getEnrollmentSubjectWithEnrollmentSubjectTypesById(enrollmentSubjectId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async createEnrollmentSubjectWithEnrollmentSubjectTypes(req: Request, res: Response) {
    const enrollmentId: number = req.body.enrollmentId;
    const subjectId: number = req.body.subjectId;
    const lecturerId: number = req.body.lecturerId;

    const enrollmentSubjectTypes: CreateEnrollmentSubjectTypeData[] = req.body.enrollmentSubjectTypes || [];


    const response: Result<EnrollmentSubjectWithTypesData> = await enrollmentService.createEnrollmentSubjectWithEnrollmentSubjectTypes(enrollmentId, subjectId, lecturerId, enrollmentSubjectTypes);


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

  async updateEnrollmentSubjectWithEnrollmentSubjectTypesById(req: Request, res: Response) {
    const enrollmentSubjectId: number = Number(req.params.enrollmentSubjectId);
    const enrollmentId: number = req.body.enrollmentId;
    const subjectId: number = req.body.subjectId;
    const lecturerId: number = req.body.lecturerId;

    const enrollmentSubjectTypes: UpdateEnrollmentSubjectTypeData[] = req.body.enrollmentSubjectTypes || [];

    const response: Result<EnrollmentSubjectData> = await enrollmentService.updateEnrollmentSubjectWithEnrollmentSubjectTypesById(enrollmentSubjectId, enrollmentId, subjectId, lecturerId, enrollmentSubjectTypes);

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

  async deleteEnrollmentSubjectWithEnrollmentSubjectTypesById(req: Request, res: Response) {
    const enrollmentSubjectId: number = Number(req.params.enrollmentSubjectId);

    const response = await enrollmentService.deleteEnrollmentSubjectWithEnrollmentSubjectTypesById(enrollmentSubjectId);

    if (response.isSuccess()) {
      return res.sendSuccess.delete();
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getEnrollmentScheduleByStudentId(req: Request, res: Response) {
    const studentId: number = req.user.userId as number;

    const response: Result<StudentEnrollmentSchedule> = await enrollmentService.getEnrollmentScheduleByStudentId(studentId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async createStudentEnrollmentSubjectTypes(req: Request, res: Response) {
    const userId: number = req.user.userId as number;
    const isAdmin: boolean = req.user.isAdmin;
    const enrollmentSubjectTypeIds: number[] = req.body.enrollmentSubjectTypeIds;

    const response: Result<StudentEnrollmentScheduleWithSubjectData> = await enrollmentService.enrollStudentSubjects(userId, enrollmentSubjectTypeIds, isAdmin);

    if (response.isSuccess()) {
      return res.sendSuccess.create(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage(), response.getData());
        case ENUM_ERROR_CODE.CONFLICT:
          return res.sendError.conflict(response.getMessage(), response.getData());
      }
    }
  }

  async createStudentEnrollmentSubjectTypesByStudentId(req: Request, res: Response) {
    const studentId: number = parseInt(req.params.studentId as string);
    const isAdmin: boolean = req.user.isAdmin;
    const enrollmentSubjectTypeIds: number[] = req.body.enrollmentSubjectTypeIds;

    if (!studentId || isNaN(studentId)) {
      return res.sendError.notFound("Invalid studentId");
    }

    const studentResponse: Result<UserData> = await userService.getStudentById(studentId);

    if (!studentResponse.isSuccess()) {
      return res.sendError.notFound("Invalid studentId");
    }

    const response: Result<StudentEnrollmentScheduleWithSubjectData> = await enrollmentService.enrollStudentSubjects(studentId, enrollmentSubjectTypeIds, isAdmin);

    if (response.isSuccess()) {
      return res.sendSuccess.create(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage(), response.getData());
        case ENUM_ERROR_CODE.FORBIDDEN:
          return res.sendError.forbidden(response.getMessage());
        case ENUM_ERROR_CODE.CONFLICT:
          return res.sendError.conflict(response.getMessage(), response.getData());
        case ENUM_ERROR_CODE.BAD_REQUEST:
          return res.sendError.badRequest(response.getMessage());
      }
    }
  }



  async getEnrolledSubjectsByStudentId(req: Request, res: Response) {
    const userId: number = req.user.userId as number;
    const isStudent: boolean = req.user.isStudent as boolean;

    if (isStudent) {
      const response: Result<StudentEnrollmentScheduleWithSubjectData> = await enrollmentService.getEnrolledSubjectsByStudentId(userId);

      if (response.isSuccess()) {
        return res.sendSuccess.create(response.getData(), response.getMessage());
      } else {
        switch (response.getErrorCode()) {
          case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
            return res.sendError.notFound(response.getMessage(), response.getData());
        }
      }
    } else {
      return res.sendError.forbidden("trest");
    }
  }

  async getMonthlyEnrollmentCount(req: Request, res: Response) {
    const duration: number = Number(req.query.duration);
    const response: Result<MonthlyEnrollmentData[]> = await enrollmentService.getMonthlyEnrollmentCount(duration);

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
