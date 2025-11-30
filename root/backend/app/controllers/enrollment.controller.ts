import { Request, Response } from "express";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { Result } from "../../libs/Result";
import { EnrollmentData, EnrollmentProgrammeIntakeData } from "../models/enrollment-model";
import enrollmentService from "../services/enrollment.service";

export default class EnrollmentController {
  async getAllEnrollments(req: Request, res: Response) {
    const page: number = parseInt(req.query.page as string) || 1;
    const pageSize: number = parseInt(req.query.pageSize as string) || 15;
    const query: string = req.query.query as string || "";

    const response: Result<EnrollmentData[]> = await enrollmentService.getAllEnrollments(query, pageSize, page);
    const enrollmentCount: Result<number> = await enrollmentService.getEnrollmentCount(query);

    if (response.isSuccess()) {
      return res.sendSuccess.ok({
        enrollments: response.getData(),
        enrollmentCount: enrollmentCount.isSuccess() ? enrollmentCount.getData() : 0,
      }, response.getMessage());
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

    await enrollmentService.deleteEnrollmentProgrammeIntakeByEnrollmentId(response.getData().enrollmentId);

    if (programmeIntakeIds && programmeIntakeIds.length > 0) {
      await Promise.all(
        programmeIntakeIds.map((programmeIntakeId) =>
          enrollmentService.createEnrollmentProgrammeIntake(response.getData().enrollmentId, programmeIntakeId)
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

    await enrollmentService.deleteEnrollmentProgrammeIntakeByEnrollmentId(response.getData().enrollmentId);

    if (programmeIntakeIds && programmeIntakeIds.length > 0) {
      await Promise.all(
        programmeIntakeIds.map((programmeIntakeId) =>
          enrollmentService.createEnrollmentProgrammeIntake(response.getData().enrollmentId, programmeIntakeId)
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
}
