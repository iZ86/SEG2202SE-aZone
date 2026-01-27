import { Request, Response } from "express";
import { ENUM_ERROR_CODE, ENUM_PROGRAMME_STATUS } from "../enums/enums";
import { Result } from "../../libs/Result";
import programmeService from "../services/programme.service";
import intakeService from "../services/intake.service";
import { ProgrammeData, ProgrammeIntakeData, ProgrammeHistoryData, StudentCourseProgrammeIntakeData } from "../models/programme-model";
import { IntakeData } from "../models/intake-model";

export default class ProgrammeController {
  async getProgrammes(req: Request, res: Response) {
    const page: number | null = parseInt(req.query.page as string) || null;
    const pageSize: number | null = parseInt(req.query.pageSize as string) || null;
    const query: string = req.query.query as string || "";

    const response: Result<ProgrammeData[]> = await programmeService.getProgrammes(query, pageSize, page);
    const programmeCount: Result<number> = await programmeService.getProgrammeCount(query);

    let apiResponse: object = {
      programmes: response.getData(),
    };

    if (page != null && pageSize != null) {
      apiResponse = {
        programmes: response.getData(),
        programmeCount: programmeCount.isSuccess() ? programmeCount.getData() : 0,
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

  async getProgrammeById(req: Request, res: Response) {
    const programmeId: number = parseInt(req.params.programmeId as string);

    if (!programmeId || isNaN(programmeId)) {
      return res.sendError.badRequest("Invalid programmeId");
    }

    const response: Result<ProgrammeData> = await programmeService.getProgrammeById(programmeId);

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

    const isProgrammeNameDuplicated: Result<ProgrammeData> = await programmeService.getProgrammeByName(programmeName);

    if (isProgrammeNameDuplicated.isSuccess()) {
      return res.sendError.conflict("Programme name duplciated");
    }

    const response = await programmeService.createProgramme(programmeName);

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

    const programme: Result<ProgrammeData> = await programmeService.getProgrammeById(programmeId);

    if (!programme.isSuccess()) {
      return res.sendError.notFound("Invalid programmeId");
    }

    const isProgrammeNameBelongsToProgrammeId: Result<ProgrammeData> = await programmeService.getProgrammeByIdAndName(programmeId, programmeName);

    if (!isProgrammeNameBelongsToProgrammeId.isSuccess()) {
      const isProgrammeNameDuplicated: Result<ProgrammeData> = await programmeService.getProgrammeByName(programmeName);

      if (isProgrammeNameDuplicated.isSuccess()) {
        return res.sendError.conflict("Programme name duplciated");
      }
    }

    const response = await programmeService.updateProgrammeById(programmeId, programmeName);

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

    const programme: Result<ProgrammeData> = await programmeService.getProgrammeById(programmeId);

    if (!programme.isSuccess()) {
      return res.sendError.notFound("Invalid programmeId");
    }

    const response = await programmeService.deleteProgrammeById(programmeId);

    if (response.isSuccess()) {
      return res.sendSuccess.delete();
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getProgrammeIntakes(req: Request, res: Response) {
    const page: number | null = parseInt(req.query.page as string) || null;
    const pageSize: number | null = parseInt(req.query.pageSize as string) || null;
    const query: string = req.query.query as string || "";

    const response: Result<ProgrammeIntakeData[]> = await programmeService.getProgrammeIntakes(query, pageSize, page);
    const programmeIntakeCount: Result<number> = await programmeService.getProgrammeIntakeCount(query);

    let apiResponse: object = {
      programmeIntakes: response.getData(),
    };

    if (page != null && pageSize != null) {
      apiResponse = {
        programmeIntakes: response.getData(),
        programmeIntakeCount: programmeIntakeCount.isSuccess() ? programmeIntakeCount.getData() : 0,
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

  async getProgrammeIntakesByProgrammeId(req: Request, res: Response) {
    const programmeId: number = parseInt(req.params.programmeId as string);

    if (!programmeId || isNaN(programmeId)) {
      return res.sendError.badRequest("Invalid programmeId");
    }

    const response: Result<ProgrammeData[]> = await programmeService.getProgrammeIntakesByProgrammeId(programmeId);

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

    const response: Result<ProgrammeIntakeData> = await programmeService.getProgrammeIntakeById(programmeIntakeId);

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
    const studyModeId: number = req.body.studyModeId;
    const semester: number = req.body.semester;
    const semesterStartDate: Date = req.body.semesterStartDate;
    const semesterEndDate: Date = req.body.semesterEndDate;

    const programmeIdResponse: Result<ProgrammeData> = await programmeService.getProgrammeById(programmeId);

    const intakeIdResponse: Result<IntakeData> = await intakeService.getIntakeById(intakeId);

    if (!programmeIdResponse.isSuccess() || !intakeIdResponse.isSuccess()) {
      return res.sendError.notFound("Invalid programmeId or intakeId");
    }

    const isProgrammeIntakeDuplicated: Result<ProgrammeIntakeData> = await programmeService.getProgrammeIntakeByProgrammeIdAndIntakeIdAndSemester(programmeId, intakeId, semester);

    if (isProgrammeIntakeDuplicated.isSuccess()) {
      return res.sendError.conflict("programmeIntake duplciated");
    }

    const response = await programmeService.createProgrammeIntake(programmeId, intakeId, studyModeId, semester, semesterStartDate, semesterEndDate);

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
    const studyModeId: number = req.body.studyModeId;
    const semester: number = req.body.semester;
    const semesterStartDate: Date = req.body.semesterStartDate;
    const semesterEndDate: Date = req.body.semesterEndDate;

    if (!programmeIntakeId || isNaN(programmeIntakeId)) {
      return res.sendError.badRequest("Invalid programmeIntakeId");
    }

    const programmeIntakeResponse: Result<ProgrammeIntakeData> = await programmeService.getProgrammeIntakeById(programmeIntakeId);

    const programmeIdResponse: Result<ProgrammeData> = await programmeService.getProgrammeById(programmeId);

    const intakeIdResponse: Result<IntakeData> = await intakeService.getIntakeById(intakeId);

    if (!programmeIntakeResponse.isSuccess() || !programmeIdResponse.isSuccess() || !intakeIdResponse.isSuccess()) {
      return res.sendError.notFound("Invalid programmeIntakeId, or programmeId, or intakeId");
    }

    const isProgrammeIntakeBelongsToProgrammeIntakeId: Result<ProgrammeIntakeData> = await programmeService.getProgrammeIntakeByIdAndProgrammeIdAndIntakeIdAndSemester(programmeIntakeId, programmeId, intakeId, semester);

    if (!isProgrammeIntakeBelongsToProgrammeIntakeId.isSuccess()) {
      const isProgrammeIntakeDuplicated: Result<ProgrammeIntakeData> = await programmeService.getProgrammeIntakeByProgrammeIdAndIntakeIdAndSemester(programmeId, intakeId, semester);

      if (isProgrammeIntakeDuplicated.isSuccess()) {
        return res.sendError.conflict("programmeIntake duplciated");
      }
    }

    const response = await programmeService.updateProgrammeIntakeById(programmeIntakeId, programmeId, intakeId, studyModeId, semester, semesterStartDate, semesterEndDate);

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

    const programmeIntakeResponse: Result<ProgrammeIntakeData> = await programmeService.getProgrammeIntakeById(programmeIntakeId);

    if (!programmeIntakeResponse.isSuccess()) {
      return res.sendError.notFound("Invalid programmeIntakeId");
    }

    const response = await programmeService.deleteProgrammeIntakeById(programmeIntakeId);

    if (response.isSuccess()) {
      return res.sendSuccess.delete();
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getProgrammeHistory(req: Request, res: Response) {
    const userId: number = req.user.userId as number;
    const isStudent: boolean = req.user.isStudent as boolean;
    const isAdmin: boolean = req.user.isAdmin as boolean;
    const status: number = parseInt(req.query.status as string) || 0;

    if (isStudent) {

      const response: Result<ProgrammeHistoryData[]> = await programmeService.getProgrammeHistoryByStudentId(userId, status);

      if (response.isSuccess()) {
        return res.sendSuccess.ok(
          response.getData().map((data) => {
            let statusLabel: string;
            switch (data.courseStatus) {
              case ENUM_PROGRAMME_STATUS.ACTIVE:
                statusLabel = "Active";
                break;
              case ENUM_PROGRAMME_STATUS.COMPLETED:
                statusLabel = "Completed";
                break;
              case ENUM_PROGRAMME_STATUS.FINISHED:
                statusLabel = "Finished";
                break;
              case ENUM_PROGRAMME_STATUS.DROPPED:
                statusLabel = "Dropped";
                break;
              default:
                statusLabel = "Unknown";
            }

            return {
              ...data,
              status: statusLabel,
            };
          }),
          response.getMessage()
        );
      } else {
        switch (response.getErrorCode()) {
          case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
            return res.sendError.notFound(response.getMessage());
        }
      }


    } else if (isAdmin) {

      const studentIdStr: string = req.query.studentId as string || "";

      if (studentIdStr.length === 0) {
        return res.sendError.badRequest("Invalid studentId");
      }

      const studentId: number = parseInt(studentIdStr);

      if (!studentId || isNaN(studentId)) {
        return res.sendError.badRequest("Invalid studentId");
      }

      const response: Result<ProgrammeHistoryData[]> = await programmeService.getProgrammeHistoryByStudentId(studentId, status);

      if (response.isSuccess()) {
        return res.sendSuccess.ok(
          response.getData().map((data) => {
            let statusLabel: string;
            switch (data.courseStatus) {
              case ENUM_PROGRAMME_STATUS.ACTIVE:
                statusLabel = "Active";
                break;
              case ENUM_PROGRAMME_STATUS.COMPLETED:
                statusLabel = "Completed";
                break;
              case ENUM_PROGRAMME_STATUS.FINISHED:
                statusLabel = "Finished";
                break;
              case ENUM_PROGRAMME_STATUS.DROPPED:
                statusLabel = "Dropped";
                break;
              default:
                statusLabel = "Unknown";
            }

            return {
              ...data,
              status: statusLabel,
            };
          }),
          response.getMessage()
        );
      } else {
        switch (response.getErrorCode()) {
          case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
            return res.sendError.notFound(response.getMessage());
        }
      }

    } else {
      throw new Error("getProgrammeHistory in programme.controller.ts, user is neither student nor admin");

    }
  }

  async createStudentCourseProgrammeIntake(req: Request, res: Response) {
    const studentId: number = req.body.studentId;
    const courseId: number = req.body.courseId;
    const programmeIntakeId: number = req.body.programmeIntakeId;


    const response: Result<StudentCourseProgrammeIntakeData> = await programmeService.createStudentCourseProgrammeIntake(studentId, courseId, programmeIntakeId);

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
}
