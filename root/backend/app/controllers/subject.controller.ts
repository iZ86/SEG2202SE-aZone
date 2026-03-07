import { Request, Response } from "express";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { Result } from "../../libs/Result";
import subjectService from "../services/subject.service";
import { SubjectData, StudentSubjectData, StudentSubjectOverviewData, SubjectWithCourseSubjectData, StudentSubjectWithCountData, SubjectWithCountData } from "../models/subject-model";
import courseService from "../services/course.service";
import { CourseData, CourseSubjectData } from "../models/course-model";

export default class SubjectController {
  async getSubjects(req: Request, res: Response) {

    const userId: number = req.user.userId as number;
    const isStudent: boolean = req.user.isStudent as boolean;
    const isAdmin: boolean = req.user.isAdmin as boolean;

    if (isStudent) {

      const page: number = Number(req.query.page) || 1;
      const pageSize: number = Number(req.query.pageSize) || 15;
      const query: string = req.query.query as string || "";
      const semester: number = Number(req.query.semester) || 0;

      const response: Result<StudentSubjectWithCountData> = await subjectService.getSubjectsByStudentId(userId, semester, query, pageSize, page);
      if (response.isSuccess()) {
        return res.sendSuccess.ok(
          response.getData(),
          response.getMessage());
      } else {
        switch (response.getErrorCode()) {
          case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
            return res.sendError.notFound(response.getMessage());
        }
      }
    } else if (isAdmin) {

      const page: number = Number(req.query.page) || 1;
      const pageSize: number = Number(req.query.pageSize) || 15;
      const query: string = req.query.query as string || "";

      const response: Result<SubjectWithCountData> = await subjectService.getSubjects(query, pageSize, page);

      if (response.isSuccess()) {
        return res.sendSuccess.ok(response.getData(), response.getMessage());
      } else {
        switch (response.getErrorCode()) {
          case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
            return res.sendError.notFound(response.getMessage());
        }
      }

    } else {
      throw new Error("getSubjects in subjects.controller.ts, user is neither student nor admin");
    }

  }

  async getSubjectById(req: Request, res: Response) {
    const subjectId: number = parseInt(req.params.subjectId as string);

    if (!subjectId || isNaN(subjectId)) {
      return res.sendError.badRequest("Invalid subjectId");
    }

    const response: Result<SubjectData> = await subjectService.getSubjectById(subjectId);
    const courseSubjectResponse: Result<CourseSubjectData[]> = await courseService.getCourseSubjectsBySubjectId(subjectId);

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

    const response: Result<SubjectWithCourseSubjectData> = await subjectService.createSubject(subjectName, subjectCode, description, creditHours, courseIds);

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

  async updateSubjectById(req: Request, res: Response) {
    const subjectId: number = Number(req.params.subjectId);
    const subjectName: string = req.body.subjectName;
    const subjectCode: string = req.body.subjectCode;
    const description: string = req.body.description;
    const creditHours: number = req.body.creditHours;
    const courseIds: number[] = req.body.courseIds;



    const response: Result<SubjectWithCourseSubjectData> = await subjectService.updateSubjectById(subjectId, subjectCode, subjectName, description, creditHours, courseIds);

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

  async deleteSubjectById(req: Request, res: Response) {
    const subjectId: number = Number(req.params.subjectId);

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

  async getActiveSubjectsOverviewByStudentId(req: Request, res: Response) {
    const userId: number = req.user.userId;

    const response: Result<StudentSubjectOverviewData[]> = await subjectService.getActiveSubjectsOverviewByStudentId(userId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      throw new Error("user.controller.ts, getStudentActiveSubjectsById failed");
    }
  }
}
