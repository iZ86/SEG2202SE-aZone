import { Request, Response } from "express";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { Result } from "../../libs/Result";
import SubjectService from "../services/subject.service";
import { SubjectData } from "../models/subject-model";

export default class SubjectController {
  async getAllSubjects(req: Request, res: Response) {
    const page: number = parseInt(req.query.page as string) || 1;
    const pageSize: number = parseInt(req.query.pageSize as string) || 15;
    const query: string = req.query.query as string || "";

    const response: Result<SubjectData[]> = await SubjectService.getAllSubjects(query, pageSize, page);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getSubjectById(req: Request, res: Response) {
    const subjectId: number = parseInt(req.params.subjectId as string);

    const response: Result<SubjectData> = await SubjectService.getSubjectById(subjectId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async createSubject(req: Request, res: Response) {
    const subjectName: string = req.body.subjectName;
    const subjectCode: string = req.body.subjectCode;
    const description: string = req.body.description;
    const creditHours: number = req.body.creditHours;

    const response = await SubjectService.createSubject(subjectName, subjectCode, description, creditHours);

    if (response.isSuccess()) {
      return res.sendSuccess.create(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async updateSubjectById(req: Request, res: Response) {
    const subjectId: number = parseInt(req.params.subjectId as string);
    const subjectName: string = req.body.subjectName;
    const subjectCode: string = req.body.subjectCode;
    const description: string = req.body.description;
    const creditHours: number = req.body.creditHours;

    const subjectResponse: Result<SubjectData> = await SubjectService.getSubjectById(subjectId);

    if (!subjectResponse.isSuccess()) {
      return res.sendError.notFound("Invalid subjectId");
    }

    const response = await SubjectService.updateSubjectById(subjectId, subjectName, subjectCode, description, creditHours);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async deleteSubjectById(req: Request, res: Response) {
    const subjectId: number = parseInt(req.params.subjectId as string);
    const subjectResponse: Result<SubjectData> = await SubjectService.getSubjectById(subjectId);

    if (!subjectResponse.isSuccess()) {
      return res.sendError.notFound("Invalid subjectId");
    }

    const response = await SubjectService.deleteSubjectById(subjectId);

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
