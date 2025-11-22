import { Request, Response } from "express";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { Result } from "../../libs/Result";
import { IntakeData } from "../models/intake-model";
import IntakeService from "../services/intake.service";

export default class IntakeController {
  async getAllIntakes(req: Request, res: Response) {
    const page: number = parseInt(req.query.page as string) || 1;
    const pageSize: number = parseInt(req.query.pageSize as string) || 15;
    const query: string = req.query.query as string || "";

    const response: Result<IntakeData[]> = await IntakeService.getAllIntakes(query, pageSize, page);
    const intakeCount: Result<number> = await IntakeService.getIntakeCount(query);

    if (response.isSuccess()) {
      return res.sendSuccess.ok({
        intakes: response.getData(),
        intakeCount: intakeCount.isSuccess() ? intakeCount.getData() : 0,
      }, response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getIntakeById(req: Request, res: Response) {
    const intakeId: number = parseInt(req.params.intakeId as string);

    if (!intakeId || isNaN(intakeId)) {
      return res.sendError.badRequest("Invalid intakeId");
    }

    const response: Result<IntakeData> = await IntakeService.getIntakeById(intakeId);

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

    const isIntakeDuplicated: Result<IntakeData> = await IntakeService.getIntakeById(intakeId);

    if (isIntakeDuplicated.isSuccess()) {
      return res.sendError.conflict("intakeId existed");
    }

    const response = await IntakeService.createIntake(intakeId);

    if (response.isSuccess()) {
      return res.sendSuccess.create(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async updateIntakeById(req: Request, res: Response) {
    const intakeId: number = parseInt(req.params.intakeId as string);
    const newIntakeId: number = req.body.intakeId;

    if (!intakeId || isNaN(intakeId)) {
      return res.sendError.badRequest("Invalid intakeId");
    }

    const isIntakeDuplicated: Result<IntakeData> = await IntakeService.getIntakeById(newIntakeId);

    if (isIntakeDuplicated.isSuccess()) {
      return res.sendError.conflict("intakeId existed");
    }

    const intakeResponse: Result<IntakeData> = await IntakeService.getIntakeById(intakeId);

    if (!intakeResponse.isSuccess()) {
      return res.sendError.notFound("Invalid intakeId");
    }

    const response = await IntakeService.updateIntakeById(intakeId, newIntakeId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async deleteIntakeById(req: Request, res: Response) {
    const intakeId: number = parseInt(req.params.intakeId as string);

    if (!intakeId || isNaN(intakeId)) {
      return res.sendError.badRequest("Invalid intakeId");
    }

    const intakeResponse: Result<IntakeData> = await IntakeService.getIntakeById(intakeId);

    if (!intakeResponse.isSuccess()) {
      return res.sendError.notFound("Invalid intakeId");
    }

    const response = await IntakeService.deleteIntakeById(intakeId);

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
