import { Request, Response } from "express";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { Result } from "../../libs/Result";
import { EnrollmentData, EnrollmentProgrammeIntakeData, EnrollmentSubjectData, StudentEnrollmentSubjectData, StudentEnrollmentSchedule, StudentEnrollmentSubjectOrganizedData, EnrollmentSubjectTypeData, StudentEnrolledSubjectTypeIds } from "../models/enrollment-model";
import enrollmentService from "../services/enrollment.service";
import programmeService from "../services/programme.service";
import subjectService from "../services/subject.service";
import { SubjectData } from "../models/subject-model";
import { LecturerData } from "../models/lecturer-model";
import lecturerService from "../services/lecturer.service";

export default class EnrollmentController {
  async getAllEnrollments(req: Request, res: Response) {
    const page: number | null = parseInt(req.query.page as string) || null;
    const pageSize: number | null = parseInt(req.query.pageSize as string) || null;
    const query: string = req.query.query as string || "";

    const response: Result<EnrollmentData[]> = await enrollmentService.getAllEnrollments(query, pageSize, page);
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

  async getEnrollmentById(req: Request, res: Response) {
    const enrollmentId: number = parseInt(req.params.enrollmentId as string);

    if (!enrollmentId || isNaN(enrollmentId)) {
      return res.sendError.badRequest("Invalid enrollmentId");
    }

    const response: Result<EnrollmentData> = await enrollmentService.getEnrollmentById(enrollmentId);
    const enrollmentProgrammeIntakesResponse: Result<EnrollmentProgrammeIntakeData[]> = await enrollmentService.getEnrollmentProgrammeIntakesByEnrollmentId(enrollmentId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok({
        enrollments: response.getData(),
        programmeIntakes: enrollmentProgrammeIntakesResponse.getData(),
      }, response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async createEnrollment(req: Request, res: Response) {
    const enrollmentStartDateTime: Date = req.body.enrollmentStartDateTime;
    const enrollmentEndDateTime: Date = req.body.enrollmentEndDateTime;
    const programmeIntakeIds: number[] = req.body.programmeIntakeIds;

    const isDateTimeDuplicated: Result<EnrollmentData> = await enrollmentService.getEnrollmentByEnrollmentStartDateTimeAndEnrollmentEndDateTime(enrollmentStartDateTime, enrollmentEndDateTime);

    if (isDateTimeDuplicated.isSuccess()) {
      return res.sendError.conflict("enrollmentStartDateTime and enrollmentEndDateTime existed");
    }

    const response: Result<EnrollmentData> = await enrollmentService.createEnrollment(enrollmentStartDateTime, enrollmentEndDateTime);

    await programmeService.deleteProgrammeIntakeEnrollmentIdByEnrollmentId(response.getData().enrollmentId);

    if (programmeIntakeIds && programmeIntakeIds.length > 0) {
      await Promise.all(
        programmeIntakeIds.map((programmeIntakeId) =>
          programmeService.updateProgrammeIntakeEnrollmentIdById(programmeIntakeId, response.getData().enrollmentId)
        )
      );
    }

    if (response.isSuccess()) {
      return res.sendSuccess.create(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async updateEnrollmentById(req: Request, res: Response) {
    const enrollmentId: number = parseInt(req.params.enrollmentId as string);
    const enrollmentStartDateTime: Date = req.body.enrollmentStartDateTime;
    const enrollmentEndDateTime: Date = req.body.enrollmentEndDateTime;
    const programmeIntakeIds: number[] = req.body.programmeIntakeIds;

    if (!enrollmentId || isNaN(enrollmentId)) {
      return res.sendError.badRequest("Invalid enrollmentId");
    }

    const enrollmentResponse: Result<EnrollmentData> = await enrollmentService.getEnrollmentById(enrollmentId);

    if (!enrollmentResponse.isSuccess()) {
      return res.sendError.notFound("Invalid enrollmentId");
    }

    const response = await enrollmentService.updateEnrollmentById(enrollmentId, enrollmentStartDateTime, enrollmentEndDateTime);

    await programmeService.deleteProgrammeIntakeEnrollmentIdByEnrollmentId(response.getData().enrollmentId);

    if (programmeIntakeIds && programmeIntakeIds.length > 0) {
      await Promise.all(
        programmeIntakeIds.map((programmeIntakeId) =>
          programmeService.updateProgrammeIntakeEnrollmentIdById(programmeIntakeId, response.getData().enrollmentId)
        )
      );
    }

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async deleteEnrollmentById(req: Request, res: Response) {
    const enrollmentId: number = parseInt(req.params.enrollmentId as string);

    if (!enrollmentId || isNaN(enrollmentId)) {
      return res.sendError.badRequest("Invalid enrollmentId");
    }

    const enrollmentResponse: Result<EnrollmentData> = await enrollmentService.getEnrollmentById(enrollmentId);

    if (!enrollmentResponse.isSuccess()) {
      return res.sendError.notFound("Invalid enrollmentId");
    }

    await programmeService.deleteProgrammeIntakeEnrollmentIdByEnrollmentId(enrollmentId);
    const response = await enrollmentService.deleteEnrollmentById(enrollmentId);

    if (response.isSuccess()) {
      return res.sendSuccess.delete();
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getAllEnrollmentSubjects(req: Request, res: Response) {

    const userId: number = req.user.userId as number;
    const isStudent: boolean = req.user.isStudent as boolean;
    const isAdmin: boolean = req.user.isAdmin as boolean;

    if (isStudent) {
      const response: Result<{ studentEnrollmentSchedule: StudentEnrollmentSchedule; studentEnrollmentSubjects: StudentEnrollmentSubjectOrganizedData[]; }> = await enrollmentService.getEnrollmentSubjectsByStudentId(userId);
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

      const response: Result<EnrollmentSubjectData[]> = await enrollmentService.getAllEnrollmentSubjects(query, pageSize, page);
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
      throw new Error("getAllEnrollmentSubjects in enrollment.controller.ts, user is neither student nor admin");
    }


  }

  async getEnrollmentSubjectById(req: Request, res: Response) {
    const enrollmentSubjectId: number = parseInt(req.params.enrollmentSubjectId as string);

    if (!enrollmentSubjectId || isNaN(enrollmentSubjectId)) {
      return res.sendError.badRequest("Invalid enrollmentSubjectId");
    }

    const response: Result<EnrollmentSubjectData> = await enrollmentService.getEnrollmentSubjectById(enrollmentSubjectId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async createEnrollmentSubject(req: Request, res: Response) {
    const enrollmentId: number = req.body.enrollmentId;
    const subjectId: number = req.body.subjectId;
    const lecturerId: number = req.body.lecturerId;

    if (!enrollmentId || isNaN(enrollmentId) || !subjectId || isNaN(subjectId) || !lecturerId || isNaN(lecturerId)) {
      return res.sendError.badRequest("Invalid enrollmentId or subjectId or lecturerId");
    }

    const subjectResponse: Result<SubjectData> = await subjectService.getSubjectById(subjectId);
    const lecturerResponse: Result<LecturerData> = await lecturerService.getLecturerById(lecturerId);

    if (!subjectResponse.isSuccess() || !lecturerResponse.isSuccess()) {
      return res.sendError.notFound("Invalid subjectId or lecturerId");
    }

    const isEnrollmentSujectDuplicated: Result<EnrollmentSubjectData> = await enrollmentService.getEnrollmentSubjectByEnrollmentIdAndSubjectIdAndLecturerId(enrollmentId, subjectId, lecturerId);

    if (isEnrollmentSujectDuplicated.isSuccess()) {
      return res.sendError.conflict("enrollmentSubject existed");
    }

    const response: Result<EnrollmentSubjectData> = await enrollmentService.createEnrollmentSubject(enrollmentId, subjectId, lecturerId);

    if (response.isSuccess()) {
      return res.sendSuccess.create(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async updateEnrollmentSubjectById(req: Request, res: Response) {
    const enrollmentSubjectId: number = parseInt(req.params.enrollmentSubjectId as string);
    const enrollmentId: number = req.body.enrollmentId;
    const subjectId: number = req.body.subjectId;
    const lecturerId: number = req.body.lecturerId;

    if (!enrollmentSubjectId || isNaN(enrollmentSubjectId) || !enrollmentId || isNaN(enrollmentId) || !subjectId || isNaN(subjectId) || !lecturerId || isNaN(lecturerId)) {
      return res.sendError.badRequest("Invalid enrollmentSubjectId or enrollmentId or subjectId or lecturerId");
    }

    const enrollmentSubjectResponse: Result<EnrollmentSubjectData> = await enrollmentService.getEnrollmentSubjectById(enrollmentSubjectId);
    const subjectResponse: Result<SubjectData> = await subjectService.getSubjectById(subjectId);
    const lecturerResponse: Result<LecturerData> = await lecturerService.getLecturerById(lecturerId);

    if (!enrollmentSubjectResponse.isSuccess() || !subjectResponse.isSuccess() || !lecturerResponse.isSuccess()) {
      return res.sendError.notFound("Invalid enrollmentSubjectId or subjectId or lecturerId");
    }

    const isEnrollmentIdAndSubjectIdAndLecturerIdBelongsToEnrollmentSubjectId: Result<SubjectData> = await enrollmentService.getEnrollmentSubjectByIdAndEnrollmentIdAndSubjectIdAndLecturerId(enrollmentSubjectId, enrollmentId, subjectId, lecturerId);

    if (!isEnrollmentIdAndSubjectIdAndLecturerIdBelongsToEnrollmentSubjectId.isSuccess()) {
      const isEnrollmentSujectDuplicated: Result<EnrollmentSubjectData> = await enrollmentService.getEnrollmentSubjectByEnrollmentIdAndSubjectIdAndLecturerId(enrollmentId, subjectId, lecturerId);

      if (isEnrollmentSujectDuplicated.isSuccess()) {
        return res.sendError.conflict("enrollmentSubject existed");
      }
    }

    const response = await enrollmentService.updateEnrollmentSubjectById(enrollmentSubjectId, enrollmentId, subjectId, lecturerId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async deleteEnrollmentSubjectById(req: Request, res: Response) {
    const enrollmentSubjectId: number = parseInt(req.params.enrollmentSubjectId as string);

    if (!enrollmentSubjectId || isNaN(enrollmentSubjectId)) {
      return res.sendError.badRequest("Invalid enrollmentSubjectId");
    }

    const enrollmentSubjectResponse: Result<EnrollmentSubjectData> = await enrollmentService.getEnrollmentSubjectById(enrollmentSubjectId);

    if (!enrollmentSubjectResponse.isSuccess()) {
      return res.sendError.notFound("Invalid enrollmentSubjectId");
    }

    const response = await enrollmentService.deleteEnrollmentSubjectById(enrollmentSubjectId);

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

    const studentEnrollmentScheduleResponse: Result<StudentEnrollmentSchedule> = await enrollmentService.getEnrollmentScheduleByStudentId(studentId);

    if (studentEnrollmentScheduleResponse.isSuccess()) {
      return res.sendSuccess.ok(studentEnrollmentScheduleResponse.getData(), studentEnrollmentScheduleResponse.getMessage());
    }
  }

  async getEnrollmentSubjectTypeByEnrollmentSubjectId(req: Request, res: Response) {
    const enrollmentSubjectId: number = parseInt(req.params.enrollmentSubjectId as string);

    if (!enrollmentSubjectId || isNaN(enrollmentSubjectId)) {
      return res.sendError.badRequest("Invalid enrollmentSubjectId");
    }

    const response: Result<EnrollmentSubjectTypeData[]> = await enrollmentService.getEnrollmentSubjectTypeByEnrollmentSubjectId(enrollmentSubjectId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async createEnrollmentSubjectType(req: Request, res: Response) {
    const enrollmentSubjects: {
      enrollmentSubjectId: number;
      classTypeId: number;
      venueId: number;
      startTime: Date;
      endTime: Date;
      dayId: number;
      numberOfSeats: number;
      grouping: number;
    }[] = req.body.enrollmentSubjects;

    await Promise.all(
      enrollmentSubjects.map(async (enrollmentSubject) => {
        await enrollmentService.createEnrollmentSubjectType(enrollmentSubject.enrollmentSubjectId, enrollmentSubject.classTypeId, enrollmentSubject.venueId, enrollmentSubject.startTime, enrollmentSubject.endTime, enrollmentSubject.dayId, enrollmentSubject.numberOfSeats, enrollmentSubject.grouping);
      })
    );

    const response: Result<EnrollmentSubjectTypeData[]> = await enrollmentService.getEnrollmentSubjectTypeByEnrollmentSubjectId(enrollmentSubjects[0].enrollmentSubjectId);

    if (response.isSuccess()) {
      return res.sendSuccess.create(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async updateEnrollmentSubjectTypeByEnrollmentSubjectId(req: Request, res: Response) {
    const enrollmentSubjectId: number = parseInt(req.params.enrollmentSubjectId as string);
    const enrollmentSubjects: {
      classTypeId: number;
      venueId: number;
      startTime: Date;
      endTime: Date;
      dayId: number;
      numberOfSeats: number;
      grouping: number;
    }[] = req.body.enrollmentSubjects;

    if (!enrollmentSubjectId || isNaN(enrollmentSubjectId)) {
      return res.sendError.badRequest("Invalid enrollmentSubjectId");
    }

    const enrollmentSubjectResponse: Result<EnrollmentSubjectData> = await enrollmentService.getEnrollmentSubjectById(enrollmentSubjectId);

    if (!enrollmentSubjectResponse.isSuccess()) {
      return res.sendError.notFound("Invalid enrollmentSubjectId");
    }

    await enrollmentService.deleteEnrollmentSubjectTypeByEnrollmentSubjectId(enrollmentSubjectId);

    await Promise.all(
      enrollmentSubjects.map(async (enrollmentSubject) => {
        await enrollmentService.createEnrollmentSubjectType(enrollmentSubjectId, enrollmentSubject.classTypeId, enrollmentSubject.venueId, enrollmentSubject.startTime, enrollmentSubject.endTime, enrollmentSubject.dayId, enrollmentSubject.numberOfSeats, enrollmentSubject.grouping);
      })
    );

    const response: Result<EnrollmentSubjectTypeData[]> = await enrollmentService.getEnrollmentSubjectTypeByEnrollmentSubjectId(enrollmentSubjectId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async deleteEnrollmentSubjectTypeByEnrollmentSubjectId(req: Request, res: Response) {
    const enrollmentSubjectId: number = parseInt(req.params.enrollmentSubjectId as string);

    if (!enrollmentSubjectId || isNaN(enrollmentSubjectId)) {
      return res.sendError.badRequest("Invalid enrollmentSubjectId");
    }

    const enrollmentSubjectTypeResponse: Result<EnrollmentSubjectTypeData[]> = await enrollmentService.getEnrollmentSubjectTypeByEnrollmentSubjectId(enrollmentSubjectId);

    if (!enrollmentSubjectTypeResponse.isSuccess()) {
      return res.sendError.notFound("Invalid enrollmentSubjectId");
    }

    const response = await enrollmentService.deleteEnrollmentSubjectTypeByEnrollmentSubjectId(enrollmentSubjectId);

    if (response.isSuccess()) {
      return res.sendSuccess.delete();
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async createStudentEnrollmentSubjectTypes(req: Request, res: Response) {
    const userId: number = req.user.userId as number;
    const isStudent: boolean = req.user.isStudent as boolean;
    const studentEnrollmentSubjectTypes: StudentEnrolledSubjectTypeIds = req.body;

    if (isStudent) {
      const response: Result<StudentEnrolledSubjectTypeIds> = await enrollmentService.enrollStudentSubjects(userId, studentEnrollmentSubjectTypes);

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
    } else {
      return res.sendError.forbidden("trest");
    }
  }
}
