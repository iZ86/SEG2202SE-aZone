import { Request, Response } from "express";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { Result } from "../../libs/Result";
import CourseService from "../services/course.service";
import { CourseData } from "../models/course-model";

export default class CourseController {
  async getCourses(req: Request, res: Response) {
    const page: number = parseInt(req.query.page as string) || 1;
    const pageSize: number = parseInt(req.query.pageSize as string) || 15;
    const query: string = req.query.query as string || "";

    const response: Result<CourseData[]> = await CourseService.getCourses(query, pageSize, page);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getCourseById(req: Request, res: Response) {
    const courseId: number = parseInt(req.params.courseId as string);

    const response: Result<CourseData> = await CourseService.getCourseById(courseId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async createCourse(req: Request, res: Response) {
    const courseName: string = req.body.courseName;
    const programmeId: number = req.body.programmeId;

    const response = await CourseService.createCourse(courseName, programmeId);

    if (response.isSuccess()) {
      return res.sendSuccess.create(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async updateCourseById(req: Request, res: Response) {
    const courseId: number = parseInt(req.params.courseId as string);
    const courseName: string = req.body.courseName;
    const programmeId: number = req.body.programmeId;

    const response = await CourseService.updateCourseById(courseId, courseName, programmeId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async deleteCourseById(req: Request, res: Response) {
    const courseId: number = parseInt(req.params.courseId as string);

    const response = await CourseService.deleteCourseById(courseId);

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
