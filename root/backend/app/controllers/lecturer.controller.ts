import { Request, Response } from "express";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { Result } from "../../libs/Result";
import { LecturerData, LecturerTitleData, LecturerWithCountData } from "../models/lecturer-model";
import lecturerService from "../services/lecturer.service";

export default class LecturerController {
  async getLecturers(req: Request, res: Response) {
    const page: number | null = Number(req.query.page) || 1;
    const pageSize: number | null = Number(req.query.pageSize) || 15;
    const query: string = req.query.query as string || "";

    const response: Result<LecturerWithCountData> = await lecturerService.getLecturers(query, pageSize, page);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getLecturerById(req: Request, res: Response) {
    const lecturerId: number = Number(req.params.lecturerId as string);

    const response: Result<LecturerData> = await lecturerService.getLecturerById(lecturerId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async createLecturer(req: Request, res: Response) {
    const firstName: string = req.body.firstName;
    const lastName: string = req.body.lastName;
    const lecturerTitleId: number = req.body.lecturerTitleId;
    const email: string = req.body.email;
    const phoneNumber: string = req.body.phoneNumber;

    const response: Result<LecturerData> = await lecturerService.createLecturer(firstName, lastName, lecturerTitleId, email, phoneNumber);

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

  async updateLecturerById(req: Request, res: Response) {
    const lecturerId: number = Number(req.params.lecturerId as string);
    const firstName: string = req.body.firstName;
    const lastName: string = req.body.lastName;
    const lecturerTitleId: number = req.body.lecturerTitleId;
    const email: string = req.body.email;
    const phoneNumber: string = req.body.phoneNumber;

    const response = await lecturerService.updateLecturerById(lecturerId, firstName, lastName, lecturerTitleId, email, phoneNumber);

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

  async deleteLecturerById(req: Request, res: Response) {
    const lecturerId: number = Number(req.params.lecturerId as string);

    const response = await lecturerService.deleteLecturerById(lecturerId);

    if (response.isSuccess()) {
      return res.sendSuccess.delete();
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getLecturerTitles(req: Request, res: Response) {
    const response: Result<LecturerTitleData[]> = await lecturerService.getLecturerTitles();

    if (response.isSuccess()) {
      return res.sendSuccess.ok({
        lecturerTitles: response.getData()
      }, response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getLecturerTitleById(req: Request, res: Response) {
    const lecturerTitleId: number = Number(req.params.lecturerTitleId as string);

    const response: Result<LecturerTitleData> = await lecturerService.getLecturerTitleById(lecturerTitleId);

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
