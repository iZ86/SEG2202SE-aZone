import { Request, Response } from "express";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { Result } from "../../libs/Result";
import { EnrollmentData } from "../models/enrollment-model";
import EnrollmentService from "../services/enrollment.service";

export default class EnrollmentController {
  async getAllEnrollments(req: Request, res: Response) {
    const page: number = parseInt(req.query.page as string) || 1;
    const pageSize: number = parseInt(req.query.pageSize as string) || 15;
    const query: string = req.query.query as string || "";

    const response: Result<EnrollmentData[]> = await EnrollmentService.getAllEnrollments(query, pageSize, page);
    const enrollmentCount: Result<number> = await EnrollmentService.getEnrollmentCount(query);

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

    const response: Result<EnrollmentData> = await EnrollmentService.getEnrollmentById(enrollmentId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
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

    const isDateTimeDuplicated: Result<EnrollmentData> = await EnrollmentService.getEnrollmentByEnrollmentStartDateTimeAndEnrollmentEndDateTime(enrollmentStartDateTime, enrollmentEndDateTime);

    if (isDateTimeDuplicated.isSuccess()) {
      return res.sendError.conflict("enrollmentStartDateTime and enrollmentEndDateTime existed");
    }

    const response: Result<EnrollmentData> = await EnrollmentService.createEnrollment(enrollmentStartDateTime, enrollmentEndDateTime);

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

    if (!enrollmentId || isNaN(enrollmentId)) {
      return res.sendError.badRequest("Invalid enrollmentId");
    }

    const enrollmentResponse: Result<EnrollmentData> = await EnrollmentService.getEnrollmentById(enrollmentId);

    if (!enrollmentResponse.isSuccess()) {
      return res.sendError.notFound("Invalid enrollmentId");
    }

    const response = await EnrollmentService.updateEnrollmentById(enrollmentId, enrollmentStartDateTime, enrollmentEndDateTime);

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

    const enrollmentResponse: Result<EnrollmentData> = await EnrollmentService.getEnrollmentById(enrollmentId);

    if (!enrollmentResponse.isSuccess()) {
      return res.sendError.notFound("Invalid enrollmentId");
    }

    const response = await EnrollmentService.deleteEnrollmentById(enrollmentId);

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
