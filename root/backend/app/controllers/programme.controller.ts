import { Request, Response } from "express";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { Result } from "../../libs/Result";
import ProgrammeService from "../services/programme.service";
import IntakeService from "../services/intake.service";
import { ProgrammeData, ProgrammeIntakeData } from "../models/programme-model";
import { IntakeData } from "../models/intake-model";

export default class ProgrammeController {
  async getAllProgrammes(req: Request, res: Response) {
    const page: number = parseInt(req.query.page as string) || 1;
    const pageSize: number = parseInt(req.query.pageSize as string) || 15;
    const query: string = req.query.query as string || "";

    const response: Result<ProgrammeData[]> = await ProgrammeService.getAllProgrammes(query, pageSize, page);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getProgrammeById(req: Request, res: Response) {
    const programmeId: number = parseInt(req.params.programmeId as string);

    if (!programmeId || isNaN(programmeId)) {
      return res.sendError.badRequest("Invalid programmeId");
    }

    const response: Result<ProgrammeData> = await ProgrammeService.getProgrammeById(programmeId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async createProgramme(req: Request, res: Response) {
    const programmeName: string = req.body.programmeName;

    const response = await ProgrammeService.createProgramme(programmeName);

    if (response.isSuccess()) {
      return res.sendSuccess.create(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async updateProgrammeById(req: Request, res: Response) {
    const programmeId: number = parseInt(req.params.programmeId as string);
    const programmeName: string = req.body.programmeName;

    if (!programmeId || isNaN(programmeId)) {
      return res.sendError.badRequest("Invalid programmeId");
    }

    const programme: Result<ProgrammeData> = await ProgrammeService.getProgrammeById(programmeId);

    if (!programme.isSuccess()) {
      return res.sendError.notFound("Invalid programmeId");
    }

    const response = await ProgrammeService.updateProgrammeById(programmeId, programmeName);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async deleteProgrammeById(req: Request, res: Response) {
    const programmeId: number = parseInt(req.params.programmeId as string);

    if (!programmeId || isNaN(programmeId)) {
      return res.sendError.badRequest("Invalid programmeId");
    }

    const programme: Result<ProgrammeData> = await ProgrammeService.getProgrammeById(programmeId);

    if (!programme.isSuccess()) {
      return res.sendError.notFound("Invalid programmeId");
    }

    const response = await ProgrammeService.deleteProgrammeById(programmeId);

    if (response.isSuccess()) {
      return res.sendSuccess.delete(response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getAllProgrammeIntakes(req: Request, res: Response) {
    const page: number = parseInt(req.query.page as string) || 1;
    const pageSize: number = parseInt(req.query.pageSize as string) || 15;
    const query: string = req.query.query as string || "";

    const response: Result<ProgrammeData[]> = await ProgrammeService.getAllProgrammeIntakes(query, pageSize, page);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getProgrammeIntakesByProgrammeId(req: Request, res: Response) {
    const programmeId: number = parseInt(req.params.programmeId as string);

    if (!programmeId || isNaN(programmeId)) {
      return res.sendError.badRequest("Invalid programmeId");
    }

    const response: Result<ProgrammeData[]> = await ProgrammeService.getProgrammeIntakesByProgrammeId(programmeId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getProgrammeIntakeById(req: Request, res: Response) {
    const programmeIntakeId: number = parseInt(req.params.programmeIntakeId as string);

    if (!programmeIntakeId || isNaN(programmeIntakeId)) {
      return res.sendError.badRequest("Invalid programmeIntakeId");
    }

    const response: Result<ProgrammeIntakeData> = await ProgrammeService.getProgrammeIntakeById(programmeIntakeId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async createProgrammeIntake(req: Request, res: Response) {
    const programmeId: number = req.body.programmeId;
    const intakeId: number = req.body.intakeId;
    const semester: number = req.body.semester;
    const semesterStartPeriod: Date = req.body.semesterStartPeriod;
    const semesterEndPeriod: Date = req.body.semesterEndPeriod;

    const programmeIdResponse: Result<ProgrammeData> = await ProgrammeService.getProgrammeById(programmeId);

    const intakeIdResponse: Result<IntakeData> = await IntakeService.getIntakeById(intakeId);

    if (!programmeIdResponse.isSuccess() || !intakeIdResponse.isSuccess()) {
      return res.sendError.notFound("Invalid programmeId or intakeId");
    }

    const response = await ProgrammeService.createProgrammeIntake(programmeId, intakeId, semester, semesterStartPeriod, semesterEndPeriod);

    if (response.isSuccess()) {
      return res.sendSuccess.create(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
        case ENUM_ERROR_CODE.INVALID_DATA:
          return res.sendError.badRequest(response.getMessage());
      }
    }
  }

  async updateProgrammeIntakeById(req: Request, res: Response) {
    const programmeIntakeId: number = parseInt(req.params.programmeIntakeId);
    const programmeId: number = req.body.programmeId;
    const intakeId: number = req.body.intakeId;
    const semester: number = req.body.semester;
    const semesterStartPeriod: Date = req.body.semesterStartPeriod;
    const semesterEndPeriod: Date = req.body.semesterEndPeriod;

    if (!programmeIntakeId || isNaN(programmeIntakeId)) {
      return res.sendError.badRequest("Invalid programmeIntakeId");
    }

    const programmeIntakeResponse: Result<ProgrammeIntakeData> = await ProgrammeService.getProgrammeIntakeById(programmeIntakeId);

    const programmeIdResponse: Result<ProgrammeData> = await ProgrammeService.getProgrammeById(programmeId);

    const intakeIdResponse: Result<IntakeData> = await IntakeService.getIntakeById(intakeId);

    if (!programmeIntakeResponse.isSuccess() || !programmeIdResponse.isSuccess() || !intakeIdResponse.isSuccess()) {
      return res.sendError.notFound("Invalid programmeIntakeId, or programmeId, or intakeId");
    }

    const response = await ProgrammeService.updateProgrammeIntakeById(programmeIntakeId, programmeId, intakeId, semester, semesterStartPeriod, semesterEndPeriod);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
        case ENUM_ERROR_CODE.INVALID_DATA:
          return res.sendError.badRequest(response.getMessage());
      }
    }
  }

  async deleteProgrammeIntakeById(req: Request, res: Response) {
    const programmeIntakeId: number = parseInt(req.params.programmeIntakeId as string);

    if (!programmeIntakeId || isNaN(programmeIntakeId)) {
      return res.sendError.badRequest("Invalid programmeIntakeId");
    }

    const programmeIntakeResponse: Result<ProgrammeIntakeData> = await ProgrammeService.getProgrammeIntakeById(programmeIntakeId);

    if (!programmeIntakeResponse.isSuccess()) {
      return res.sendError.notFound("Invalid programmeIntakeId");
    }

    const response = await ProgrammeService.deleteProgrammeIntakeById(programmeIntakeId);

    if (response.isSuccess()) {
      return res.sendSuccess.delete(response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }
}
