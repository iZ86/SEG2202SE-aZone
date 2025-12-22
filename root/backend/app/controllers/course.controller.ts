import { Request, Response } from "express";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { Result } from "../../libs/Result";
import courseService from "../services/course.service";
import { CourseData } from "../models/course-model";
import { ProgrammeData } from "../models/programme-model";
import programmeService from "../services/programme.service";
import { SubjectData } from "../models/subject-model";
import subjectService from "../services/subject.service";

export default class CourseController {
  async getCourses(req: Request, res: Response) {
    const page: number = parseInt(req.query.page as string) || 1;
    const pageSize: number = parseInt(req.query.pageSize as string) || 15;
    const query: string = req.query.query as string || "";

    const response: Result<CourseData[]> = await courseService.getCourses(query, pageSize, page);
    const courseCount: Result<number> = await courseService.getCourseCount(query);

    if (response.isSuccess()) {
      return res.sendSuccess.ok({
        courses: response.getData(),
        courseCount: courseCount.isSuccess() ? courseCount.getData() : 0,
      }, response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getCourseById(req: Request, res: Response) {
    const courseId: number = parseInt(req.params.courseId as string);

    if (!courseId || isNaN(courseId)) {
      return res.sendError.badRequest("Invalid courseId");
    }

    const response: Result<CourseData> = await courseService.getCourseById(courseId);

    if (response.isSuccess()) {
      return res.sendSuccess.ok(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async getCoursesByProgrammeId(req: Request, res: Response) {
    const programmeId: number = parseInt(req.params.programmeId as string);

    if (!programmeId || isNaN(programmeId)) {
      return res.sendError.badRequest("Invalid courseId");
    }

    const response: Result<CourseData[]> = await courseService.getCoursesByProgrammeId(programmeId);

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

    const isCourseNameDuplicated: Result<CourseData> = await courseService.getCourseByName(courseName);

    if (isCourseNameDuplicated.isSuccess()) {
      return res.sendError.conflict("Course name duplciated");
    }

    const programmeResponse: Result<ProgrammeData> = await programmeService.getProgrammeById(programmeId);

    if (!programmeResponse.isSuccess()) {
      return res.sendError.notFound(programmeResponse.getMessage());
    }

    const response = await courseService.createCourse(courseName, programmeId);

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

    if (!courseId || isNaN(courseId)) {
      return res.sendError.badRequest("Invalid courseId");
    }

    const programmeResponse: Result<ProgrammeData> = await programmeService.getProgrammeById(programmeId);
    const courseResponse: Result<CourseData> = await courseService.getCourseById(courseId);

    if (!programmeResponse.isSuccess() || !courseResponse.isSuccess()) {
      return res.sendError.notFound("Invalid programmeId, or courseId");
    }

    const isCourseNameBelongsToCourseId: Result<CourseData> = await courseService.getCourseByIdAndCourseName(courseId, courseName);

    if (!isCourseNameBelongsToCourseId.isSuccess()) {
      const isCourseNameDuplicated: Result<CourseData> = await courseService.getCourseByName(courseName);

      if (isCourseNameDuplicated.isSuccess()) {
        return res.sendError.conflict("Course name duplciated");
      }
    }
    
    const response = await courseService.updateCourseById(courseId, courseName, programmeId);

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

    if (!courseId || isNaN(courseId)) {
      return res.sendError.badRequest("Invalid courseId");
    }

    const courseResponse: Result<CourseData> = await courseService.getCourseById(courseId);

    if (!courseResponse.isSuccess()) {
      return res.sendError.notFound("Invalid courseId");
    }

    const response = await courseService.deleteCourseById(courseId);

    if (response.isSuccess()) {
      return res.sendSuccess.delete();
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }

  async createCourseSubject(req: Request, res: Response) {
    const courseId: number = req.body.courseId;
    const subjectId: number = req.body.subjectId;

    const courseIdResponse: Result<CourseData> = await courseService.getCourseById(courseId);

    const subjectIdResponse: Result<SubjectData> = await subjectService.getSubjectById(subjectId);

    if (!courseIdResponse.isSuccess() || !subjectIdResponse.isSuccess()) {
      return res.sendError.notFound("Invalid courseId or subjectId");
    }

    const isCourseSubjectExist: boolean = await courseService.isCourseSubjectExist(courseId, subjectId);

    if (isCourseSubjectExist) {
      return res.sendError.notFound("Course subject already exist");
    }

    const response = await courseService.createCourseSubject(courseId, subjectId);

    if (response.isSuccess()) {
      return res.sendSuccess.create(response.getData(), response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
        case ENUM_ERROR_CODE.BAD_REQUEST:
          return res.sendError.badRequest(response.getMessage());
      }
    }
  }

  async getCoursesCount(req: Request, res: Response) {
    const response: Result<number> = await courseService.getCourseCount();

    if (response.isSuccess()) {
      return res.sendSuccess.ok({
        coursesCount: response.getData() || 0
      }, response.getMessage());
    } else {
      switch (response.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return res.sendError.notFound(response.getMessage());
      }
    }
  }
}
