import { Request, Response } from "express";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { Result } from "../../libs/Result";
import { IntakeData, IntakeWithCountData } from "../models/intake-model";
import intakeService from "../services/intake.service";

export default class IntakeController {
  async getIntakes(req: Request, res: Response) {
    const page: number = Number(req.query.page) || 1;
    const pageSize: number = Number(req.query.pageSize) || 15;
    const query: string = req.query.query as string || "";

    const response: Result<IntakeWithCountData> = await intakeService.getIntakes(query, pageSize, page);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getIntakeById(req: Request, res: Response) {
    const intakeId: number = Number(req.params.intakeId);

    const response: Result<IntakeData> = await intakeService.getIntakeById(intakeId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async createIntake(req: Request, res: Response) {
    const intakeId: number = req.body.intakeId;

    const response = await intakeService.createIntake(intakeId);

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

  async updateIntakeById(req: Request, res: Response) {
    const intakeId: number = Number(req.params.intakeId);
    const newIntakeId: number = req.body.intakeId;

    const response = await intakeService.updateIntakeById(intakeId, newIntakeId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
        case ENUM_ERROR_CODE.CONFLICT:
          return res.sendError.conflict(response.getMessage());
        default:
          return res.sendError.internal(response.getMessage());
      }
    }
  }

  async deleteIntakeById(req: Request, res: Response) {
    const intakeId: number = Number(req.params.intakeId);

    const response = await intakeService.deleteIntakeById(intakeId);

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
