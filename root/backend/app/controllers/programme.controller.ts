import { Request, Response } from "express";
import { ENUM_ERROR_CODE, ENUM_PROGRAMME_STATUS } from "../enums/enums";
import { Result } from "../../libs/Result";
import programmeService from "../services/programme.service";
import { ProgrammeData, ProgrammeIntakeData, ProgrammeHistoryData, StudentCourseProgrammeIntakeData, ProgrammeDistribution, ProgrammeWithCountData, ProgrammeIntakeWithCountData } from "../models/programme-model";


export default class ProgrammeController {
  async getProgrammes(req: Request, res: Response) {
    const page: number = Number(req.query.page) || 1;
    const pageSize: number = Number(req.query.pageSize) || 15;
    const query: string = req.query.query as string || "";

    const response: Result<ProgrammeWithCountData> = await programmeService.getProgrammes(query, pageSize, page);
    
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
    const programmeId: number = Number(req.params.programmeId);


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

    const response = await programmeService.createProgramme(programmeName);

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

  async updateProgrammeById(req: Request, res: Response) {
    const programmeId: number = Number(req.params.programmeId);
    const programmeName: string = req.body.programmeName;

    const response = await programmeService.updateProgrammeById(programmeId, programmeName);

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

  async deleteProgrammeById(req: Request, res: Response) {
    const programmeId: number = Number(req.params.programmeId);


    const response = await programmeService.deleteProgrammeById(programmeId);

    if (response.isSuccess()) {
      return res.sendSuccess.delete();
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
        case ENUM_ERROR_CODE.CONFLICT:
          return res.sendError.conflict(response.getMessage());
      }
    }
  }

  async getProgrammeIntakes(req: Request, res: Response) {
    const page: number = Number(req.query.page) || 1;
    const pageSize: number = Number(req.query.pageSize) || 15;
    const query: string = req.query.query as string || "";

    const response: Result<ProgrammeIntakeWithCountData> = await programmeService.getProgrammeIntakes(query, pageSize, page);

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
    const status: number = req.body.status;

    const response = await programmeService.createProgrammeIntake(programmeId, intakeId, studyModeId, semester, semesterStartDate, semesterEndDate, status);

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

  async updateProgrammeIntakeById(req: Request, res: Response) {
    const programmeIntakeId: number = Number(req.params.programmeIntakeId);
    const programmeId: number = req.body.programmeId;
    const intakeId: number = req.body.intakeId;
    const studyModeId: number = req.body.studyModeId;
    const semester: number = req.body.semester;
    const semesterStartDate: Date = req.body.semesterStartDate;
    const semesterEndDate: Date = req.body.semesterEndDate;
    const status: number = req.body.status;


    const response = await programmeService.updateProgrammeIntakeById(programmeIntakeId, programmeId, intakeId, studyModeId, semester, semesterStartDate, semesterEndDate, status);

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

  async deleteProgrammeIntakeById(req: Request, res: Response) {
    const programmeIntakeId: number = Number(req.params.programmeIntakeId);

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

  async deleteStudentCourseProgrammeIntake(req: Request, res: Response) {
    const studentId: number = Number(req.params.studentId);
    const courseId: number = Number(req.params.courseId);
    const programmeIntakeId: number = Number(req.params.programmeIntakeId);


    const response: Result<null> = await programmeService.deleteStudentCourseProgrammeIntake(studentId, courseId, programmeIntakeId);

    if (response.isSuccess()) {
      return res.sendSuccess.delete();
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getProgrammeDistribution(req: Request, res: Response) {
    const response: Result<ProgrammeDistribution[]> = await programmeService.getProgrammeDistribution();

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
