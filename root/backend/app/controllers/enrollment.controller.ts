import { Request, Response } from "express";
import { ENUM_CLASS_TYPE, ENUM_DAY, ENUM_ERROR_CODE } from "../enums/enums";
import { Result } from "../../libs/Result";
import { EnrollmentData, EnrollmentProgrammeIntakeData, EnrollmentSubjectData, StudentEnrollmentSchedule, StudentEnrollmentSubjectOrganizedData, EnrollmentSubjectTypeData, StudentEnrolledSubjectTypeIds, StudentEnrolledSubject } from "../models/enrollment-model";
import enrollmentService from "../services/enrollment.service";
import programmeService from "../services/programme.service";
import subjectService from "../services/subject.service";
import { SubjectData } from "../models/subject-model";
import { LecturerData } from "../models/lecturer-model";
import lecturerService from "../services/lecturer.service";
import venueService from "../services/venue.service";
import userService from "../services/user.service";
import { StudentClassData, UserData } from "../models/user-model";

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

    const isEnrollmentBelongsToEnrollmentId: Result<EnrollmentData> = await enrollmentService.getEnrollmentByIdAndEnrollmentStartDateTimeAndEnrollmentEndDateTime(enrollmentId, enrollmentStartDateTime, enrollmentEndDateTime);

    if (!isEnrollmentBelongsToEnrollmentId.isSuccess()) {
      const isDateTimeDuplicated: Result<EnrollmentData> = await enrollmentService.getEnrollmentByEnrollmentStartDateTimeAndEnrollmentEndDateTime(enrollmentStartDateTime, enrollmentEndDateTime);

      if (isDateTimeDuplicated.isSuccess()) {
        return res.sendError.conflict("enrollmentStartDateTime and enrollmentEndDateTime existed");
      }
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

  async getAllEnrollmentSubjectsByStudentId(req: Request, res: Response) {
    const studentId: number = parseInt(req.params.studentId as string);

    const response: Result<{ studentEnrollmentSchedule: StudentEnrollmentSchedule; studentEnrollmentSubjects: StudentEnrollmentSubjectOrganizedData[]; }> = await enrollmentService.getEnrollmentSubjectsByStudentId(studentId);
    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
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

    const enrollmentSubjects: {
      classTypeId: number;
      venueId: number;
      startTime: Date;
      endTime: Date;
      dayId: number;
      numberOfSeats: number;
      grouping: number;
    }[] = req.body.enrollmentSubjects || [];

    const enrollmentResponse: Result<EnrollmentData> = await enrollmentService.getEnrollmentById(enrollmentId);
    const subjectResponse: Result<SubjectData> = await subjectService.getSubjectById(subjectId);
    const lecturerResponse: Result<LecturerData> = await lecturerService.getLecturerById(lecturerId);

    if (!subjectResponse.isSuccess() || !lecturerResponse.isSuccess() || !enrollmentResponse.isSuccess()) {
      return res.sendError.notFound("Invalid subjectId, or lecturerId, or enrollmentId");
    }

    const isEnrollmentSujectDuplicated: Result<EnrollmentSubjectData> = await enrollmentService.getEnrollmentSubjectByEnrollmentIdAndSubjectId(enrollmentId, subjectId);

    if (isEnrollmentSujectDuplicated.isSuccess()) {
      return res.sendError.conflict("enrollmentSubject existed");
    }

    // Check if all the class session data is valid. When the array is not empty
    if (enrollmentSubjects.length > 0) {
      for (const [index, enrollmentSubject] of enrollmentSubjects.entries()) {
        const isClassSessionDuplicated: Result<EnrollmentSubjectTypeData> = await enrollmentService.getEnrollmentSubjectTypeByStartTimeAndEndTimeAndVenueIdAndDayId(
          enrollmentSubject.startTime,
          enrollmentSubject.endTime,
          enrollmentSubject.venueId,
          enrollmentSubject.dayId
        );

        if (isClassSessionDuplicated.isSuccess()) {
          return res.sendError.conflict(`enrollmentSubjectType duplicated at index:${index}`);
        }

        const isDayIdValid: boolean =
          enrollmentSubject.dayId >= ENUM_DAY.MONDAY &&
          enrollmentSubject.dayId <= ENUM_DAY.SUNDAY;

        const isClassTypeIdValid: boolean =
          enrollmentSubject.classTypeId >= ENUM_CLASS_TYPE.LECTURE &&
          enrollmentSubject.classTypeId <= ENUM_CLASS_TYPE.WORKSHOP;

        const isVenueIdValid = await venueService.getVenueById(enrollmentSubject.venueId);

        if (!isVenueIdValid.isSuccess() || !isDayIdValid || !isClassTypeIdValid) {
          return res.sendError.badRequest("Invalid venueId, or dayId, or classTypeId");
        }
      }
    }

    const createEnrollmentSubjectResponse: Result<EnrollmentSubjectData> = await enrollmentService.createEnrollmentSubject(enrollmentId, subjectId, lecturerId);

    if (enrollmentSubjects.length === 0) {
      await enrollmentService.deleteEnrollmentSubjectTypeByEnrollmentSubjectId(createEnrollmentSubjectResponse.getData().enrollmentSubjectId);
      if (createEnrollmentSubjectResponse.isSuccess()) {
        return res.sendSuccess.create(createEnrollmentSubjectResponse.getData(), createEnrollmentSubjectResponse.getMessage());
      } else {
        switch (createEnrollmentSubjectResponse.getErrorCode()) {
          case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
            return res.sendError.notFound(createEnrollmentSubjectResponse.getMessage());
        }
      }
    }

    await Promise.all(
      enrollmentSubjects.map(async (enrollmentSubject) => {
        await enrollmentService.createEnrollmentSubjectType(createEnrollmentSubjectResponse.getData().enrollmentSubjectId, enrollmentSubject.classTypeId, enrollmentSubject.venueId, enrollmentSubject.startTime, enrollmentSubject.endTime, enrollmentSubject.dayId, enrollmentSubject.numberOfSeats, enrollmentSubject.grouping);
      })
    );

    const createEnrollmentSubjectTypeResponse: Result<EnrollmentSubjectTypeData[]> = await enrollmentService.getEnrollmentSubjectTypeByEnrollmentSubjectId(createEnrollmentSubjectResponse.getData().enrollmentSubjectId);

    if (createEnrollmentSubjectTypeResponse.isSuccess()) {
      return res.sendSuccess.create(createEnrollmentSubjectTypeResponse.getData(), createEnrollmentSubjectTypeResponse.getMessage());
    } else {
      switch (createEnrollmentSubjectTypeResponse.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(createEnrollmentSubjectTypeResponse.getMessage());
      }
    }
  }

  async updateEnrollmentSubjectById(req: Request, res: Response) {
    const enrollmentSubjectId: number = parseInt(req.params.enrollmentSubjectId as string);
    const enrollmentId: number = req.body.enrollmentId;
    const subjectId: number = req.body.subjectId;
    const lecturerId: number = req.body.lecturerId;

    const enrollmentSubjects: {
      enrollmentSubjectTypeId: number;
      classTypeId: number;
      venueId: number;
      startTime: Date;
      endTime: Date;
      dayId: number;
      numberOfSeats: number;
      grouping: number;
    }[] = req.body.enrollmentSubjects || [];

    if (!enrollmentSubjectId || isNaN(enrollmentSubjectId)) {
      return res.sendError.badRequest("Invalid enrollmentSubjectId");
    }

    const enrollmentSubjectResponse: Result<EnrollmentSubjectData> = await enrollmentService.getEnrollmentSubjectById(enrollmentSubjectId);
    const enrollmentResponse: Result<EnrollmentData> = await enrollmentService.getEnrollmentById(enrollmentId);
    const subjectResponse: Result<SubjectData> = await subjectService.getSubjectById(subjectId);
    const lecturerResponse: Result<LecturerData> = await lecturerService.getLecturerById(lecturerId);

    if (!enrollmentSubjectResponse.isSuccess() || !enrollmentResponse.isSuccess() || !subjectResponse.isSuccess() || !lecturerResponse.isSuccess()) {
      return res.sendError.notFound("Invalid enrollmentSubjectId or enrollmentId or subjectId or lecturerId");
    }

    const isEnrollmentIdAndSubjectIdBelongsToEnrollmentSubjectId: Result<SubjectData> = await enrollmentService.getEnrollmentSubjectByIdAndEnrollmentIdAndSubjectId(enrollmentSubjectId, enrollmentId, subjectId);

    if (!isEnrollmentIdAndSubjectIdBelongsToEnrollmentSubjectId.isSuccess()) {
      const isEnrollmentSujectDuplicated: Result<EnrollmentSubjectData> = await enrollmentService.getEnrollmentSubjectByEnrollmentIdAndSubjectId(enrollmentId, subjectId);

      if (isEnrollmentSujectDuplicated.isSuccess()) {
        return res.sendError.conflict("enrollmentSubject existed");
      }
    }

    if (enrollmentSubjects.length > 0) {
      for (const [index, enrollmentSubject] of enrollmentSubjects.entries()) {
        // Find duplicate venue, time and day.
        const isClassSessionDuplicated: Result<EnrollmentSubjectTypeData> = await enrollmentService.getEnrollmentSubjectTypeByStartTimeAndEndTimeAndVenueIdAndDayId(
          enrollmentSubject.startTime,
          enrollmentSubject.endTime,
          enrollmentSubject.venueId,
          enrollmentSubject.dayId
        );

        if (isClassSessionDuplicated.isSuccess()) {
          // If updating the same data, ignore it.
          if (isClassSessionDuplicated.getData().enrollmentSubjectTypeId === parseInt(enrollmentSubject.enrollmentSubjectTypeId.toString())) {
            continue;
          }
          return res.sendError.conflict(`enrollmentSubjectType duplicated at index:${index}`);
        }

        const isDayIdValid: boolean =
          enrollmentSubject.dayId >= ENUM_DAY.MONDAY &&
          enrollmentSubject.dayId <= ENUM_DAY.SUNDAY;

        const isClassTypeIdValid: boolean =
          enrollmentSubject.classTypeId >= ENUM_CLASS_TYPE.LECTURE &&
          enrollmentSubject.classTypeId <= ENUM_CLASS_TYPE.WORKSHOP;

        const isVenueIdValid = await venueService.getVenueById(enrollmentSubject.venueId);

        if (!isVenueIdValid.isSuccess() || !isDayIdValid || !isClassTypeIdValid) {
          return res.sendError.badRequest("Invalid venueId, or dayId, or classTypeId");
        }
      }
    }

    const updateEnrollmentSubjectResponse: Result<EnrollmentSubjectData> = await enrollmentService.updateEnrollmentSubjectById(enrollmentSubjectId, enrollmentId, subjectId, lecturerId);

    await enrollmentService.deleteEnrollmentSubjectTypeByEnrollmentSubjectId(updateEnrollmentSubjectResponse.getData().enrollmentSubjectId);

    if (enrollmentSubjects.length === 0) {
      if (updateEnrollmentSubjectResponse.isSuccess()) {
        return res.sendSuccess.create(updateEnrollmentSubjectResponse.getData(), updateEnrollmentSubjectResponse.getMessage());
      } else {
        switch (updateEnrollmentSubjectResponse.getErrorCode()) {
          case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
            return res.sendError.notFound(updateEnrollmentSubjectResponse.getMessage());
        }
      }
    }

    await Promise.all(
      enrollmentSubjects.map(async (enrollmentSubject) => {
        await enrollmentService.createEnrollmentSubjectType(updateEnrollmentSubjectResponse.getData().enrollmentSubjectId, enrollmentSubject.classTypeId, enrollmentSubject.venueId, enrollmentSubject.startTime, enrollmentSubject.endTime, enrollmentSubject.dayId, enrollmentSubject.numberOfSeats, enrollmentSubject.grouping);
      })
    );

    const createEnrollmentSubjectTypeResponse: Result<EnrollmentSubjectTypeData[]> = await enrollmentService.getEnrollmentSubjectTypeByEnrollmentSubjectId(updateEnrollmentSubjectResponse.getData().enrollmentSubjectId);

    if (createEnrollmentSubjectTypeResponse.isSuccess()) {
      return res.sendSuccess.ok(createEnrollmentSubjectTypeResponse.getData(), createEnrollmentSubjectTypeResponse.getMessage());
    } else {
      switch (createEnrollmentSubjectTypeResponse.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(createEnrollmentSubjectTypeResponse.getMessage());
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

  async createStudentEnrollmentSubjectTypes(req: Request, res: Response) {
    const userId: number = req.user.userId as number;
    const isAdmin: boolean = req.user.isAdmin;
    const studentEnrollmentSubjectTypes: StudentEnrolledSubjectTypeIds = req.body;

    const response: Result<StudentEnrolledSubjectTypeIds> = await enrollmentService.enrollStudentSubjects(userId, studentEnrollmentSubjectTypes, isAdmin);

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
    const studentEnrollmentSubjectTypes: StudentEnrolledSubjectTypeIds = req.body;

    if (!studentId || isNaN(studentId)) {
      return res.sendError.notFound("Invalid studentId");
    }

    const studentResponse: Result<UserData> = await userService.getStudentById(studentId);

    if (!studentResponse.isSuccess()) {
      return res.sendError.notFound("Invalid studentId");
    }

    const response: Result<StudentEnrolledSubjectTypeIds> = await enrollmentService.enrollStudentSubjects(studentId, studentEnrollmentSubjectTypes, isAdmin);

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
      const response: Result<{ studentEnrollmentSchedule: StudentEnrollmentSchedule; studentEnrolledSubjects: StudentEnrolledSubject[] }> = await enrollmentService.getEnrolledSubjectsByStudentId(userId);

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
}
