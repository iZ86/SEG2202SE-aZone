import { Request, Response } from "express";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { Result } from "../../libs/Result";
import { IntakeData } from "../models/intake-model";
import intakeService from "../services/intake.service";

export default class IntakeController {
  async getIntakes(req: Request, res: Response) {
    const page: number | null = Number(req.query.page as string) || null;
    const pageSize: number | null = Number(req.query.pageSize as string) || null;
    const query: string = req.query.query as string || "";

    const response: Result<IntakeData[]> = await intakeService.getIntakes(query, pageSize, page);
    const intakeCount: Result<number> = await intakeService.getIntakeCount(query);

    let apiResponse: object = {
      intakes: response.getData(),
    };

    if (page != null && pageSize != null) {
      apiResponse = {
        intakes: response.getData(),
        intakeCount: intakeCount.isSuccess() ? intakeCount.getData() : 0,
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

  async getIntakeById(req: Request, res: Response) {
    const intakeId: number = Number(req.params.intakeId as string);

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

    const isIntakeDuplicated: Result<IntakeData> = await intakeService.getIntakeById(intakeId);

    if (isIntakeDuplicated.isSuccess()) {
      return res.sendError.conflict("intakeId existed");
    }

    const response = await intakeService.createIntake(intakeId);

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
    const intakeId: number = Number(req.params.intakeId as string);
    const newIntakeId: number = req.body.intakeId;

    const isIntakeDuplicated: Result<IntakeData> = await intakeService.getIntakeById(newIntakeId);

    if (isIntakeDuplicated.isSuccess()) {
      return res.sendError.conflict("intakeId existed");
    }

    const intakeResponse: Result<IntakeData> = await intakeService.getIntakeById(intakeId);

    if (!intakeResponse.isSuccess()) {
      return res.sendError.notFound("Invalid intakeId");
    }

    const response = await intakeService.updateIntakeById(intakeId, newIntakeId);

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
    const intakeId: number = Number(req.params.intakeId as string);

    const intakeResponse: Result<IntakeData> = await intakeService.getIntakeById(intakeId);

    if (!intakeResponse.isSuccess()) {
      return res.sendError.notFound("Invalid intakeId");
    }

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
