import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { CourseData } from "../models/course-model";
import CourseRepository from "../repositories/course.repository";
import ProgrammeService from "./programme.service";
import { ProgrammeData } from "../models/programme-model";

interface ICourseService {
  getCourses(query: string, pageSize: number, page: number): Promise<Result<CourseData[]>>;
  getCourseById(courseId: number): Promise<Result<CourseData>>;
  createCourse(courseName: string, programmeId: number): Promise<Result<null>>;
  updateCourseById(courseId: number, courseName: string, programmeId: number): Promise<Result<null>>;
  deleteCourseById(courseId: number): Promise<Result<null>>;
}

class CourseService implements ICourseService {
  async getCourses(query: string = "", pageSize: number, page: number): Promise<Result<CourseData[]>> {
    const courses: CourseData[] = await CourseRepository.getCourses(query, pageSize, page);

    return Result.succeed(courses, "Courses retrieve success");
  }

  async getCourseById(courseId: number): Promise<Result<CourseData>> {
    const course: CourseData = await CourseRepository.getCourseById(courseId);

    if (!course) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course not found");
    }

    return Result.succeed(course, "Course retrieve success");
  }

  async createCourse(courseName: string, programmeId: number): Promise<Result<null>> {
    const programmeResponse: Result<ProgrammeData> = await ProgrammeService.getProgrammeById(programmeId);

    if (!programmeResponse.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid programmeId");
    }

    await CourseRepository.createCourse(courseName, programmeId);

    return Result.succeed(null, "Course create success");
  }

  async updateCourseById(courseId: number, courseName: string, programmeId: number): Promise<Result<null>> {
    const programmeResponse: Result<ProgrammeData> = await ProgrammeService.getProgrammeById(programmeId);
    const courseResponse: Result<CourseData> = await this.getCourseById(courseId);

    if (!programmeResponse.isSuccess() || !courseResponse.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid programmeId, or courseId");
    }

    await CourseRepository.updateCourseById(courseId, programmeId, courseName);

    return Result.succeed(null, "Course update success");
  }

  async deleteCourseById(courseId: number): Promise<Result<null>> {
    const courseResponse: Result<CourseData> = await this.getCourseById(courseId);

    if (!courseResponse.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid courseId");
    }

    await CourseRepository.deleteCourseById(courseId);

    return Result.succeed(null, "Course delete success");
  }
}

export default new CourseService();
