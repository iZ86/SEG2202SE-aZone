import { Request, Response } from "express";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { Result } from "../../libs/Result";
import subjectService from "../services/subject.service";
import { SubjectData } from "../models/subject-model";
import courseService from "../services/course.service";
import { CourseData } from "../models/course-model";

export default class SubjectController {
  async getAllSubjects(req: Request, res: Response) {
    const page: number = parseInt(req.query.page as string) || 1;
    const pageSize: number = parseInt(req.query.pageSize as string) || 15;
    const query: string = req.query.query as string || "";

    const response: Result<SubjectData[]> = await subjectService.getAllSubjects(query, pageSize, page);
    const subjectCount: Result<number> = await subjectService.getSubjectCount(query);

    if (response.isSuccess()) {
      return res.sendSuccess.ok({
        subjects: response.getData(),
        subjectCount: subjectCount.isSuccess() ? subjectCount.getData() : 0,
      }, response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getSubjectById(req: Request, res: Response) {
    const subjectId: number = parseInt(req.params.subjectId as string);

    if (!subjectId || isNaN(subjectId)) {
      return res.sendError.badRequest("Invalid subjectId");
    }

    const response: Result<SubjectData> = await subjectService.getSubjectById(subjectId);
    const courseSubjectResponse: Result<CourseData[]> = await courseService.getCourseSubjectBySubjectId(subjectId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok({
        subjects: response.getData(),
        courses: courseSubjectResponse.getData() || [],
      }, response.getMessage());
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
    const courseIds: number[] = req.body.courseIds;

    const isSubjectNameDuplicated: Result<SubjectData> = await subjectService.getSubjectBySubjectCode(subjectCode);

    if (isSubjectNameDuplicated.isSuccess()) {
      return res.sendError.conflict("Subject code duplciated");
    }

    const response = await subjectService.createSubject(subjectName, subjectCode, description, creditHours, courseIds);

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
    const courseIds: number[] = req.body.courseIds;

    if (!subjectId || isNaN(subjectId)) {
      return res.sendError.badRequest("Invalid subjectId");
    }

    const subjectResponse: Result<SubjectData> = await subjectService.getSubjectById(subjectId);

    if (!subjectResponse.isSuccess()) {
      return res.sendError.notFound("Invalid subjectId");
    }

    if (
      !Array.isArray(courseIds) ||
      courseIds.length === 0 ||
      courseIds.some((id) => isNaN(id))
    ) {
      return res.sendError.badRequest("Invalid or missing courseIds");
    }

    const isSubjectCodeBelongsToSubjectId: Result<SubjectData> = await subjectService.getSubjectByIdAndSubjectCode(subjectId, subjectCode);

    if (!isSubjectCodeBelongsToSubjectId.isSuccess()) {
      const isSubjectNameDuplicated: Result<SubjectData> = await subjectService.getSubjectBySubjectCode(subjectCode);

      if (isSubjectNameDuplicated.isSuccess()) {
        return res.sendError.conflict("Subject code duplciated");
      }
    }

    const response = await subjectService.updateSubjectById(subjectId, subjectCode, subjectName, description, creditHours, courseIds);

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
    const subjectResponse: Result<SubjectData> = await subjectService.getSubjectById(subjectId);

    if (!subjectId || isNaN(subjectId)) {
      return res.sendError.badRequest("Invalid subjectId");
    }

    if (!subjectResponse.isSuccess()) {
      return res.sendError.notFound("Invalid subjectId");
    }

    const response = await subjectService.deleteSubjectById(subjectId);

    if (response.isSuccess()) {
      return res.sendSuccess.delete();
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getSubjectsCount(req: Request, res: Response) {
    const response: Result<number> = await subjectService.getSubjectCount();

    if (response.isSuccess()) {
      return res.sendSuccess.ok({
        subjectsCount: response.getData() || 0
      }, response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }
}
